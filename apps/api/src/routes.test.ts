import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./server";

const app = createApp();

describe("platform API", () => {
  it("returns dashboard overview", async () => {
    const response = await request(app).get("/api/overview").expect(200);

    expect(response.body.className).toBe("智慧康养2301班");
    expect(response.body.metrics.caseCount).toBeGreaterThan(0);
    expect(response.body.metrics.resourceCount).toBeGreaterThan(0);
    expect(response.body.metrics.averageScore).toBeGreaterThan(0);
  });

  it("filters chronic cases by disease", async () => {
    const response = await request(app).get("/api/cases?category=chronic&disease=高血压").expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].name).toContain("高血压");
    expect(response.body.items.every((item: { diseases: string[] }) => item.diseases.includes("高血压"))).toBe(true);
  });

  it("imports cases in batch and returns them through multi-condition filters", async () => {
    const imported = await request(app)
      .post("/api/cases/import")
      .send({
        items: [
          {
            id: "case-imported-001",
            category: "subhealthy",
            name: "导入肩颈疼痛案例",
            gender: "female",
            ageRange: "60-70",
            condition: "亚健康",
            diseases: ["肩周炎"],
            tags: ["肩颈", "课堂导入"],
            summary: "从批量导入进入案例库"
          }
        ]
      })
      .expect(201);

    expect(imported.body.importedCount).toBe(1);
    expect(imported.body.total).toBeGreaterThan(6);

    const filtered = await request(app)
      .get("/api/cases")
      .query({
        category: "subhealthy",
        gender: "female",
        ageRange: "60-70",
        disease: "肩周炎",
        tag: "课堂导入",
        keyword: "肩颈"
      })
      .expect(200);

    expect(filtered.body.items).toHaveLength(1);
    expect(filtered.body.items[0].id).toBe("case-imported-001");
  });

  it("filters method and action resources", async () => {
    const response = await request(app)
      .get("/api/resources")
      .query({ type: "assessment", bodyPart: "下肢", difficulty: "medium" })
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].title).toBe("平衡能力测评");
  });

  it("returns resource filter options and applies advanced resource filters", async () => {
    const options = await request(app).get("/api/resources/options").expect(200);

    expect(options.body.bodyParts).toContain("下肢");
    expect(options.body.audiences).toContain("老年人");
    expect(options.body.equipment).toContain("秒表");

    const response = await request(app)
      .get("/api/resources")
      .query({ audience: "老年人", equipment: "秒表", keyword: "地面防滑" })
      .expect(200);

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].title).toBe("平衡能力测评");
  });

  it("submits a fall simulation step and reports score", async () => {
    const created = await request(app).post("/api/simulations").send({ scenarioId: "fall-response" }).expect(201);

    const response = await request(app)
      .post(`/api/simulations/${created.body.sessionId}/steps/environment`)
      .send({ optionId: "check-danger" })
      .expect(200);

    expect(response.body.stepScore).toBe(20);
    expect(response.body.totalScore).toBe(20);
    expect(response.body.feedback).toContain("危险源");
  });

  it("returns class analytics and evaluation rules", async () => {
    const analytics = await request(app).get("/api/analytics/classroom").expect(200);
    const rules = await request(app).get("/api/evaluations/rules").expect(200);

    expect(analytics.body.students[0].name).toBe("沈峥宇");
    expect(rules.body.rules.map((rule: { label: string }) => rule.label)).toContain("安全");
  });
});
