import type { Level, Market } from "@/lib/types";
import type { ParsedResume } from "@/lib/parsers";

export type ScoreInput = {
  parsed: ParsedResume;
  level: Level;
  applyingTo: Market;
};

export type Issue = { message: string; lost: number };

export type ModuleResult = {
  id: string;
  label: string;
  points: number;
  max: number;
  issues: Issue[]; // problems, each with the points it cost
  passed: string[]; // things done well
  tips: string[]; // advice that doesn't change the score
};

export type CheckResult = {
  total: number; // 0 to 100
  band: "good" | "fair" | "poor";
  modules: ModuleResult[];
  topIssues: (Issue & { module: string })[]; // biggest losses first
};