import type { SkillId } from "./skills";

// A single skill, or a group where any one skill counts
export type Item = SkillId | { anyOf: SkillId[]; label: string };

export type LevelList = { core: Item[]; common: Item[]; nice?: SkillId[] };

export type RolePack = {
  id: string;
  title: string;
  fresher: LevelList;
  experienced: LevelList;
  // Extra skills that matter in one market. They are added as "common".
  market: { IN: SkillId[]; AE: SkillId[] };
};

const LANGUAGE: Item = {
  anyOf: ["java", "python", "javascript", "typescript", "c#", "c++", "golang", "php", "kotlin"],
  label: "a programming language",
};
const DATABASE: Item = {
  anyOf: ["sql", "mysql", "postgresql", "mongodb", "sql server", "oracle database"],
  label: "a database",
};
const FRAMEWORK: Item = {
  anyOf: ["react", "angular", "vue", "node.js", "express.js", "next.js", "spring boot", "django", "flask", ".net", "laravel"],
  label: "a framework",
};
const CLOUD: Item = { anyOf: ["aws", "azure", "google cloud"], label: "a cloud platform" };

const BI_TOOL: Item = {
  anyOf: ["power bi", "tableau", "looker studio"],
  label: "a BI tool (Power BI, Tableau)",
};
const PYTHON_OR_R: Item = { anyOf: ["python", "r programming"], label: "Python or R" };

const ACCOUNTING_SOFTWARE: Item = {
  anyOf: ["tally", "quickbooks", "zoho books", "sap"],
  label: "accounting software (Tally, QuickBooks, Zoho Books, SAP)",
};

const CRM_TOOL: Item = {
  anyOf: ["crm", "salesforce", "hubspot", "zoho crm"],
  label: "a CRM tool",
};

export const ROLES: RolePack[] = [
  {
    id: "software-developer",
    title: "Software Developer",
    experienced: {
      core: [LANGUAGE, "git", "rest api", DATABASE, FRAMEWORK],
      common: ["docker", "ci/cd", "unit testing", "microservices", CLOUD, "linux", "system design", "design patterns", "agile"],
      nice: ["kubernetes", "redis", "graphql", "kafka", "jira", "postman"],
    },
    fresher: {
      core: [LANGUAGE, "data structures", "git", DATABASE, "oop"],
      common: [FRAMEWORK, "rest api", "github", "debugging", "linux"],
      nice: ["docker", "unit testing", "aws", "agile"],
    },
    market: { IN: [], AE: [] },
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    experienced: {
      core: ["sql", "excel", BI_TOOL, "data visualization", PYTHON_OR_R],
      common: ["statistics", "data cleaning", "pandas", "etl", "pivot tables", "a/b testing", "google analytics"],
      nice: ["numpy", "business intelligence", "vlookup", "google sheets"],
    },
    fresher: {
      core: ["excel", "sql", BI_TOOL, PYTHON_OR_R, "data cleaning"],
      common: ["data visualization", "statistics", "pandas", "pivot tables", "vlookup"],
      nice: ["numpy", "etl", "google sheets"],
    },
    market: { IN: [], AE: [] },
  },
  {
    id: "accountant",
    title: "Accountant",
    experienced: {
      core: ["financial reporting", "reconciliation", "accounts payable", "accounts receivable", "excel", ACCOUNTING_SOFTWARE],
      common: ["financial statements", "journal entries", "general ledger", "trial balance", "audit", "budgeting", "payroll", "cash flow"],
      nice: ["erp", "mis reporting", "financial analysis"],
    },
    fresher: {
      core: ["bookkeeping", "journal entries", "excel", ACCOUNTING_SOFTWARE, "financial statements"],
      common: ["general ledger", "trial balance", "reconciliation", "accounts payable", "accounts receivable"],
      nice: ["taxation", "audit", "mis reporting"],
    },
    market: {
      IN: ["gst", "tds", "taxation"],
      AE: ["vat", "ifrs", "corporate tax"],
    },
  },
  {
    id: "sales-executive",
    title: "Sales Executive",
    experienced: {
      core: ["sales targets", "lead generation", "client relationship", "negotiation", "customer acquisition"],
      common: [CRM_TOOL, "pipeline management", "b2b sales", "cold calling", "presentations", "upselling", "market research", "proposals"],
      nice: ["customer retention", "linkedin sales navigator", "ms office"],
    },
    fresher: {
      core: ["lead generation", "negotiation", "cold calling", "presentations", "ms office"],
      common: ["market research", CRM_TOOL, "client relationship", "customer retention"],
      nice: ["b2b sales", "upselling", "sales targets"],
    },
    market: { IN: [], AE: [] },
  },
  {
    id: "digital-marketer",
    title: "Digital Marketer",
    experienced: {
      core: ["seo", "social media marketing", "google ads", "google analytics", "content marketing"],
      common: ["meta ads", "email marketing", "keyword research", "performance marketing", "conversion rate optimization", "copywriting", "marketing automation"],
      nice: ["semrush", "ahrefs", "google search console", "wordpress", "canva", "a/b testing", "influencer marketing", "lead generation"],
    },
    fresher: {
      core: ["seo", "social media marketing", "content marketing", "canva", "google analytics"],
      common: ["keyword research", "email marketing", "copywriting", "wordpress", "google ads", "meta ads"],
      nice: ["google search console", "semrush", "influencer marketing"],
    },
    market: { IN: [], AE: [] },
  },
];