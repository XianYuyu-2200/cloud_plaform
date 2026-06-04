import { describe, expect, it } from "vitest";
import { scoreSimulation, summarizeEvaluation } from "./scoring";
import type { EvaluationRule, SimulationScenario } from "./types";

const scenario: SimulationScenario = {
  id: "fall-response",
  title: "老年人跌倒应急处置",
  steps: [
    {
      id: "environment",
      title: "环境判断",
      dimension: "safety",
      options: [
        {
          id: "check-danger",
          label: "先排除危险源",
          score: 20,
          feedback: "能先排除湿滑、障碍物等危险源。"
        }
      ]
    },
    {
      id: "call",
      title: "呼救转运",
      dimension: "communication",
      options: [
        {
          id: "call-120",
          label: "呼叫急救并通知家属",
          score: 18,
          feedback: "呼救对象和信息传达正确。"
        }
      ]
    }
  ]
};

const rules: EvaluationRule[] = [
  { dimension: "safety", label: "安全", weight: 0.6 },
  { dimension: "communication", label: "沟通", weight: 0.4 }
];

describe("scoreSimulation", () => {
  it("adds selected step scores and returns step feedback", () => {
    const report = scoreSimulation(scenario, {
      environment: "check-danger",
      call: "call-120"
    });

    expect(report.totalScore).toBe(38);
    expect(report.steps).toHaveLength(2);
    expect(report.steps[0].feedback).toContain("危险源");
  });
});

describe("summarizeEvaluation", () => {
  it("groups scored steps by evaluation dimension", () => {
    const report = scoreSimulation(scenario, {
      environment: "check-danger",
      call: "call-120"
    });

    expect(summarizeEvaluation(report, rules)).toEqual([
      { dimension: "safety", label: "安全", score: 20, weightedScore: 12 },
      { dimension: "communication", label: "沟通", score: 18, weightedScore: 7.2 }
    ]);
  });
});
