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

  it("filters method and action resources", async () => {
    const response = await request(app)
      .get("/api/resources")
      .query({ type: "assessment", bodyPart: "下肢", difficulty: "medium" })
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
