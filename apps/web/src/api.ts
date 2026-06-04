import type { CaseCategory, CaseRecord, LearningResource } from "@smart-care/shared";

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
  students: Array<{ id: string; name: string; points: number }>;
  dimensions: Array<{ label: string; score: number }>;
  ability: {
    knowledge: number;
    practice: number;
    standardization: number;
    collaboration: number;
  };
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

export function getCases(filters: { category?: CaseCategory } = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  const query = params.toString();
  return getJson<{ items: CaseRecord[] }>(`/api/cases${query ? `?${query}` : ""}`);
}

export function getResources() {
  return getJson<{ items: LearningResource[] }>("/api/resources");
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
