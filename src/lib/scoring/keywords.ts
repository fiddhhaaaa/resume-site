import { ROLES, type Item } from "@/data/roles";
import type { SkillId } from "@/data/skills";
import { CAP } from "./caps";
import { findSections } from "./sections";
import { countSkills, normalise } from "./skills-match";
import type { Cap, Issue, ModuleResult, ScoreInput } from "./types";

type Tier = "core" | "common" | "nice";
type Req = { label: string; skills: SkillId[]; weight: number; tier: Tier };
type Plan = { title: string; isAd: boolean; reqs: Req[]; tip?: string };

const MAX = 25;
const WEIGHT: Record<Tier, number> = { core: 3, common: 2, nice: 1 };

function toReq(item: Item, tier: Tier): Req {
  return typeof item === "string"
    ? { label: item, skills: [item], weight: WEIGHT[tier], tier }
    : { label: item.label, skills: item.anyOf, weight: WEIGHT[tier], tier };
}

function buildPlan({ level, applyingTo, role, jobAd }: ScoreInput): Plan | null {
  const hasAd = jobAd.trim().length > 0;

  // 1. A pasted job ad is the most accurate source
  if (hasAd) {
    const counts = countSkills(jobAd);
    if (counts.size >= 3) {
      const reqs = [...counts].map(([skill, n]): Req => {
        const tier: Tier = n >= 2 ? "core" : "common";
        return { label: skill, skills: [skill], weight: WEIGHT[tier], tier };
      });

      return {
        title: "this job ad",
        isAd: true,
        reqs,
        tip: "Scored against the skills we found in the job ad you pasted.",
      };
    }
  }

  // 2. Otherwise use the list for the chosen role
  const pack = ROLES.find((r) => r.id === role);
  if (!pack) return null;

  const list = pack[level];
  const all = [
    ...list.core.map((i) => toReq(i, "core")),
    ...list.common.map((i) => toReq(i, "common")),
    ...pack.market[applyingTo].map((i) => toReq(i, "common")),
    ...(list.nice ?? []).map((i) => toReq(i, "nice")),
  ];

  // Remove duplicates, keeping the first (highest) tier
  const seen = new Set<string>();
  const reqs: Req[] = [];

  for (const r of all) {
    if (seen.has(r.label)) continue;
    seen.add(r.label);
    reqs.push(r);
  }

  return {
    title: pack.title,
    isAd: false,
    reqs,
    tip: hasAd
      ? "We found few skills in the job ad, so we used the standard list for this role."
      : undefined,
  };
}

// Returns null when there is no role and no usable job ad
export function scoreKeywords(input: ScoreInput): ModuleResult | null {
  const plan = buildPlan(input);
  if (!plan) return null;

  const text = normalise(input.parsed.text);

  // Separate the Skills section from the rest, to check skills are shown in context
  const { bodies } = findSections(input.parsed.text);
  const skillsBody = normalise(bodies.get("skills") ?? "").trim();
  const outside = skillsBody ? text.replace(skillsBody, " ") : text;

  const anywhere = new Set(countSkills(text).keys());
  const inContext = new Set(countSkills(outside).keys());

  let earned = 0;
  let required = 0;
  let listOnlyLoss = 0;
  let matchedCount = 0;
  const missingCore: string[] = [];
  const missingCommon: string[] = [];
  const listOnly: string[] = [];

  for (const r of plan.reqs) {
    if (r.tier !== "nice") required += r.weight;

    const matched = r.skills.filter((s) => anywhere.has(s));

    if (matched.length === 0) {
      if (r.tier === "core") missingCore.push(r.label);
      else if (r.tier === "common") missingCommon.push(r.label);
      continue;
    }

    matchedCount++;

    if (matched.some((s) => inContext.has(s))) {
      earned += r.weight;
    } else {
      earned += r.weight * 0.6;
      listOnlyLoss += r.weight * 0.4;
      listOnly.push(matched[0]);
    }
  }

  const target = required * 0.7; // full marks at about 70% coverage
  if (target === 0) return null;

  const toPoints = (w: number) => Math.round(Math.min(1, w / target) * MAX);
  const points = toPoints(earned);
  const potential = toPoints(earned + listOnlyLoss);

  const issues: Issue[] = [];
  const passed: string[] = [];
  const tips: string[] = [];

  const missingLost = MAX - potential;
  const shown = [...missingCore.slice(0, 6), ...missingCommon.slice(0, 3)];

  if (missingLost > 0 && shown.length > 0) {
    const source = plan.isAd ? "in this job ad" : `for ${plan.title} roles`;

    issues.push({
      message: `Skills asked for ${source} that we couldn't find: ${shown.join(", ")}. Only add skills you genuinely have.`,
      lost: missingLost,
    });
  }

  const evidenceLost = potential - points;

  if (evidenceLost > 0) {
    issues.push({
      message: `${listOnly.length} skill${listOnly.length === 1 ? "" : "s"} appear only in your Skills list (${listOnly
        .slice(0, 4)
        .join(", ")}). Show them in a project or job bullet too, for example “Built a REST API with Node.js and PostgreSQL”.`,
      lost: evidenceLost,
    });
  }

  if (points === MAX) {
    passed.push(
      plan.isAd
        ? "Your resume covers the key skills in the job ad"
        : `Your resume covers the key skills for ${plan.title} roles`
    );
  } else if (matchedCount > 0) {
    passed.push(`${matchedCount} relevant skill${matchedCount === 1 ? "" : "s"} found`);
  }

  if (plan.tip) tips.push(plan.tip);

  const caps: Cap[] = [];

  if (required > 0 && earned / required < 0.3) {
    caps.push({
      max: CAP.majorGap,
      reason: plan.isAd
        ? "Your resume covers very few of the skills in this job ad."
        : `Your resume covers very few of the key skills for ${plan.title} roles.`,
    });
  }

  return {
    id: "keywords",
    label: "Keywords and skills",
    points,
    max: MAX,
    issues,
    passed,
    tips,
    caps,
  };
}