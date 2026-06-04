import { Router } from "express";
import type { CaseCategory, CaseRecord, Difficulty, Gender, ResourceType } from "@smart-care/shared";
import { filterCases, filterResources, scoreSimulation, summarizeEvaluation } from "@smart-care/shared";
import { analytics, cases, evaluationRules, fallScenario, resources, students } from "./seed";

interface SimulationSessionState {
  scenarioId: string;
  selections: Record<string, string>;
}

const sessions = new Map<string, SimulationSessionState>();

const validCategories = new Set<CaseCategory>(["healthy", "subhealthy", "chronic"]);
const validGenders = new Set<Gender>(["female", "male"]);

function uniqueValues(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeCaseRecord(input: Partial<CaseRecord>, index: number): CaseRecord | null {
  if (
    !input.category ||
    !validCategories.has(input.category) ||
    !input.name ||
    !input.gender ||
    !validGenders.has(input.gender) ||
    !input.ageRange ||
    !input.condition
  ) {
    return null;
  }

  return {
    id: input.id || `case-import-${Date.now()}-${index + 1}`,
    category: input.category,
    name: input.name,
    gender: input.gender,
    ageRange: input.ageRange,
    condition: input.condition,
    diseases: Array.isArray(input.diseases) ? input.diseases : [],
    tags: Array.isArray(input.tags) ? input.tags : [],
    summary: input.summary || ""
  };
}

export function createRoutes() {
  const router = Router();

  router.get("/overview", (_request, response) => {
    response.json({
      className: "智慧康养2301班",
      metrics: {
        caseCount: cases.length,
        resourceCount: resources.length,
        averageScore: 82,
        activeScenarioCount: 1
      },
      recentSimulation: {
        title: fallScenario.title,
        completion: 0.8
      }
    });
  });

  router.get("/cases", (request, response) => {
    const items = filterCases(cases, {
      category: request.query.category as CaseCategory | undefined,
      gender: request.query.gender as Gender | undefined,
      ageRange: request.query.ageRange as string | undefined,
      disease: request.query.disease as string | undefined,
      tag: request.query.tag as string | undefined,
      keyword: request.query.keyword as string | undefined
    });

    response.json({ items, total: items.length });
  });

  router.get("/cases/options", (_request, response) => {
    response.json({
      categories: uniqueValues(cases.map((item) => item.category)),
      genders: uniqueValues(cases.map((item) => item.gender)),
      ageRanges: uniqueValues(cases.map((item) => item.ageRange)),
      diseases: uniqueValues(cases.flatMap((item) => item.diseases)),
      tags: uniqueValues(cases.flatMap((item) => item.tags)),
      conditions: uniqueValues(cases.map((item) => item.condition))
    });
  });

  router.post("/cases/import", (request, response) => {
    const incoming = Array.isArray(request.body?.items) ? request.body.items : [];
    const imported = incoming
      .map((item: Partial<CaseRecord>, index: number) => normalizeCaseRecord(item, index))
      .filter((item: CaseRecord | null): item is CaseRecord => item !== null);

    for (const item of imported) {
      const existingIndex = cases.findIndex((candidate) => candidate.id === item.id);
      if (existingIndex >= 0) {
        cases[existingIndex] = item;
      } else {
        cases.push(item);
      }
    }

    response.status(201).json({
      importedCount: imported.length,
      rejectedCount: incoming.length - imported.length,
      total: cases.length,
      items: imported.slice(0, 5)
    });
  });

  router.get("/cases/:id", (request, response) => {
    const item = cases.find((candidate) => candidate.id === request.params.id);
    if (!item) {
      response.status(404).json({ message: "案例不存在" });
      return;
    }
    response.json(item);
  });

  router.get("/resources", (request, response) => {
    const items = filterResources(resources, {
      type: request.query.type as ResourceType | undefined,
      bodyPart: request.query.bodyPart as string | undefined,
      difficulty: request.query.difficulty as Difficulty | undefined
    });

    response.json({ items, total: items.length });
  });

  router.get("/resources/:id", (request, response) => {
    const item = resources.find((candidate) => candidate.id === request.params.id);
    if (!item) {
      response.status(404).json({ message: "资源不存在" });
      return;
    }
    response.json(item);
  });

  router.get("/scenarios/fall", (_request, response) => {
    response.json(fallScenario);
  });

  router.post("/simulations", (request, response) => {
    const scenarioId = request.body?.scenarioId;
    if (scenarioId !== fallScenario.id) {
      response.status(400).json({ message: "不支持的仿真场景" });
      return;
    }

    const sessionId = `session-${Date.now()}-${sessions.size + 1}`;
    sessions.set(sessionId, { scenarioId, selections: {} });
    response.status(201).json({ sessionId, scenarioId });
  });

  router.post("/simulations/:id/steps/:stepId", (request, response) => {
    const session = sessions.get(request.params.id);
    if (!session) {
      response.status(404).json({ message: "实训会话不存在" });
      return;
    }

    const step = fallScenario.steps.find((candidate) => candidate.id === request.params.stepId);
    if (!step) {
      response.status(404).json({ message: "实训步骤不存在" });
      return;
    }

    const optionId = request.body?.optionId;
    const option = step.options.find((candidate) => candidate.id === optionId);
    if (!option) {
      response.status(400).json({ message: "步骤选项不存在" });
      return;
    }

    session.selections[step.id] = option.id;
    const report = scoreSimulation(fallScenario, session.selections);

    response.json({
      stepId: step.id,
      stepScore: option.score,
      totalScore: report.totalScore,
      feedback: option.feedback,
      completedSteps: report.steps.length,
      totalSteps: fallScenario.steps.length
    });
  });

  router.get("/simulations/:id/report", (request, response) => {
    const session = sessions.get(request.params.id);
    if (!session) {
      response.status(404).json({ message: "实训会话不存在" });
      return;
    }

    const report = scoreSimulation(fallScenario, session.selections);
    response.json({
      ...report,
      evaluation: summarizeEvaluation(report, evaluationRules)
    });
  });

  router.get("/analytics/classroom", (_request, response) => {
    response.json({
      students,
      dimensions: analytics.dimensions,
      ability: analytics.ability
    });
  });

  router.get("/evaluations/rules", (_request, response) => {
    response.json({ rules: evaluationRules });
  });

  router.post("/import/cases/preview", (request, response) => {
    const rows = Array.isArray(request.body?.rows) ? request.body.rows : [];
    response.json({
      acceptedRows: rows.length,
      requiredFields: ["category", "name", "gender", "ageRange", "condition"],
      missingFields: [],
      preview: rows.slice(0, 5)
    });
  });

  return router;
}
