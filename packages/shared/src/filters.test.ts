import { describe, expect, it } from "vitest";
import { filterCases, filterResources } from "./filters";
import type { CaseRecord, LearningResource } from "./types";

const cases: CaseRecord[] = [
  {
    id: "case-healthy-gait",
    category: "healthy",
    name: "健康步态案例",
    gender: "female",
    ageRange: "65-75",
    condition: "健康",
    diseases: [],
    tags: ["步态", "平衡"],
    summary: "适合平衡训练"
  },
  {
    id: "case-hypertension-fall",
    category: "chronic",
    name: "高血压跌倒风险",
    gender: "male",
    ageRange: "75-85",
    condition: "慢性病",
    diseases: ["高血压"],
    tags: ["跌倒", "应急"],
    summary: "适合应急处置"
  }
];

const resources: LearningResource[] = [
  {
    id: "resource-balance",
    type: "assessment",
    title: "平衡能力测评",
    bodyPart: "下肢",
    difficulty: "medium",
    audience: "老年人",
    equipment: "无",
    mediaUrl: "/media/balance.mp4",
    keyPoints: ["扶稳", "观察步态"],
    cautions: ["防跌倒"]
  },
  {
    id: "resource-neck",
    type: "exercise",
    title: "肩颈放松训练",
    bodyPart: "肩颈",
    difficulty: "easy",
    audience: "亚健康",
    equipment: "无",
    mediaUrl: "/media/neck.mp4",
    keyPoints: ["慢速"],
    cautions: ["避免疼痛"]
  }
];

describe("filterCases", () => {
  it("filters cases by category, gender, age range, and disease", () => {
    expect(
      filterCases(cases, {
        category: "chronic",
        gender: "male",
        ageRange: "75-85",
        disease: "高血压"
      })
    ).toEqual([cases[1]]);
  });

  it("filters cases by tag and keyword across searchable fields", () => {
    expect(
      filterCases(cases, {
        tag: "应急",
        keyword: "跌倒"
      })
    ).toEqual([cases[1]]);
  });
});

describe("filterResources", () => {
  it("filters resources by type, body part, and difficulty", () => {
    expect(
      filterResources(resources, {
        type: "assessment",
        bodyPart: "下肢",
        difficulty: "medium"
      })
    ).toEqual([resources[0]]);
  });

  it("filters resources by audience, equipment, and keyword", () => {
    expect(
      filterResources(resources, {
        audience: "老年人",
        equipment: "无",
        keyword: "步态"
      })
    ).toEqual([resources[0]]);
  });
});
