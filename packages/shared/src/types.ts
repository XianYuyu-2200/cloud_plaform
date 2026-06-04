export type CaseCategory = "healthy" | "subhealthy" | "chronic";
export type Gender = "female" | "male";
export type ResourceType = "assessment" | "exercise";
export type Difficulty = "easy" | "medium" | "hard";
export type EvaluationDimension =
  | "safety"
  | "quality"
  | "timeliness"
  | "standardization"
  | "communication";

export interface CaseRecord {
  id: string;
  category: CaseCategory;
  name: string;
  gender: Gender;
  ageRange: string;
  condition: string;
  diseases: string[];
  tags: string[];
  summary: string;
}

export interface CaseFilters {
  category?: CaseCategory;
  gender?: Gender;
  ageRange?: string;
  disease?: string;
  tag?: string;
  keyword?: string;
}

export interface LearningResource {
  id: string;
  type: ResourceType;
  title: string;
  bodyPart: string;
  difficulty: Difficulty;
  audience: string;
  equipment: string;
  mediaUrl: string;
  keyPoints: string[];
  cautions: string[];
}

export interface ResourceFilters {
  type?: ResourceType;
  bodyPart?: string;
  difficulty?: Difficulty;
  audience?: string;
  equipment?: string;
  keyword?: string;
}

export interface SimulationOption {
  id: string;
  label: string;
  score: number;
  feedback: string;
}

export interface SimulationStep {
  id: string;
  title: string;
  dimension: EvaluationDimension;
  options: SimulationOption[];
}

export interface SimulationScenario {
  id: string;
  title: string;
  steps: SimulationStep[];
}

export interface EvaluationRule {
  dimension: EvaluationDimension;
  label: string;
  weight: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string;
  points: number;
  className: string;
}
