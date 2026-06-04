import type { CaseCategory, CaseFilters, CaseRecord, Difficulty, Gender, LearningResource, ResourceFilters, ResourceType } from "@smart-care/shared";

export interface Overview {
  className: string;
  metrics: {
    caseCount: number;
    resourceCount: number;
    averageScore: number;
    activeScenarioCount: number;
  };
  recentSimulation: {
    title: string;
    completion: number;
  };
}

export interface ClassroomAnalytics {
  metrics: {
    completionRate: number;
    simulationCount: number;
    activeStudentCount: number;
    weakStepCount: number;
  };
  students: Array<{
    id: string;
    name: string;
    points: number;
    completionRate?: number;
    averageScore?: number;
    latestSimulation?: { title: string; score: number; date: string };
  }>;
  dimensions: Array<{ label: string; score: number }>;
  ability: {
    knowledge: number;
    practice: number;
    standardization: number;
    collaboration: number;
  };
  trends: Array<{ date: string; score: number }>;
  weakSteps: Array<{ step: string; mistakeRate: number; suggestion: string }>;
  recommendations: Array<{ title: string; target: string; reason: string }>;
}

export interface EvaluationRulesResponse {
  rules: Array<{ dimension: string; label: string; weight: number }>;
}

export interface FallScenario {
  id: string;
  title: string;
  steps: Array<{
    id: string;
    title: string;
    options: Array<{ id: string; label: string; score: number }>;
  }>;
}

export interface SimulationReport {
  totalScore: number;
  steps: Array<{
    stepId: string;
    title: string;
    dimension: string;
    optionId: string;
    optionLabel: string;
    score: number;
    feedback: string;
  }>;
  evaluation: Array<{
    dimension: string;
    label: string;
    score: number;
    weightedScore: number;
  }>;
}

export interface CaseOptions {
  categories: CaseCategory[];
  genders: Gender[];
  ageRanges: string[];
  diseases: string[];
  tags: string[];
  conditions: string[];
}

export interface ResourceOptions {
  types: ResourceType[];
  bodyParts: string[];
  difficulties: Difficulty[];
  audiences: string[];
  equipment: string[];
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getOverview() {
  return getJson<Overview>("/api/overview");
}

export function getCases(filters: CaseFilters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.ageRange) params.set("ageRange", filters.ageRange);
  if (filters.disease) params.set("disease", filters.disease);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.keyword) params.set("keyword", filters.keyword);
  const query = params.toString();
  return getJson<{ items: CaseRecord[] }>(`/api/cases${query ? `?${query}` : ""}`);
}

export function getCaseOptions() {
  return getJson<CaseOptions>("/api/cases/options");
}

export async function importCases(items: CaseRecord[]) {
  const response = await fetch("/api/cases/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<{
    importedCount: number;
    rejectedCount: number;
    total: number;
    items: CaseRecord[];
  }>;
}

export function getResources(filters: ResourceFilters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.bodyPart) params.set("bodyPart", filters.bodyPart);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.audience) params.set("audience", filters.audience);
  if (filters.equipment) params.set("equipment", filters.equipment);
  if (filters.keyword) params.set("keyword", filters.keyword);
  const query = params.toString();
  return getJson<{ items: LearningResource[]; total?: number }>(`/api/resources${query ? `?${query}` : ""}`);
}

export function getResourceOptions() {
  return getJson<ResourceOptions>("/api/resources/options");
}

export function getFallScenario() {
  return getJson<FallScenario>("/api/scenarios/fall");
}

export function getAnalytics() {
  return getJson<ClassroomAnalytics>("/api/analytics/classroom");
}

export function getEvaluationRules() {
  return getJson<EvaluationRulesResponse>("/api/evaluations/rules");
}

export async function createSimulation(scenarioId: string) {
  const response = await fetch("/api/simulations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenarioId })
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<{ sessionId: string; scenarioId: string }>;
}

export async function submitSimulationStep(sessionId: string, stepId: string, optionId: string) {
  const response = await fetch(`/api/simulations/${sessionId}/steps/${stepId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionId })
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<{
    stepId: string;
    stepScore: number;
    totalScore: number;
    feedback: string;
    completedSteps: number;
    totalSteps: number;
  }>;
}

export function getSimulationReport(sessionId: string) {
  return getJson<SimulationReport>(`/api/simulations/${sessionId}/report`);
}
