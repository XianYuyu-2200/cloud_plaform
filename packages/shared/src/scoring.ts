import type { EvaluationDimension, EvaluationRule, SimulationScenario } from "./types";

export interface ScoredStep {
  stepId: string;
  title: string;
  dimension: EvaluationDimension;
  optionId: string;
  optionLabel: string;
  score: number;
  feedback: string;
}

export interface SimulationReport {
  totalScore: number;
  steps: ScoredStep[];
}

export interface EvaluationSummary {
  dimension: EvaluationDimension;
  label: string;
  score: number;
  weightedScore: number;
}

export function scoreSimulation(scenario: SimulationScenario, selections: Record<string, string>): SimulationReport {
  const steps = scenario.steps.flatMap((step) => {
    const selectedOptionId = selections[step.id];
    const option = step.options.find((candidate) => candidate.id === selectedOptionId);
    if (!option) return [];

    return [
      {
        stepId: step.id,
        title: step.title,
        dimension: step.dimension,
        optionId: option.id,
        optionLabel: option.label,
        score: option.score,
        feedback: option.feedback
      }
    ];
  });

  return {
    totalScore: steps.reduce((sum, step) => sum + step.score, 0),
    steps
  };
}

export function summarizeEvaluation(report: SimulationReport, rules: EvaluationRule[]): EvaluationSummary[] {
  return rules.map((rule) => {
    const score = report.steps
      .filter((step) => step.dimension === rule.dimension)
      .reduce((sum, step) => sum + step.score, 0);

    return {
      dimension: rule.dimension,
      label: rule.label,
      score,
      weightedScore: Number((score * rule.weight).toFixed(2))
    };
  });
}
