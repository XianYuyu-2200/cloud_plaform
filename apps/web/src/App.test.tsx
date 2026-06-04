import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function json(data: unknown) {
  return Promise.resolve(Response.json(data));
}

vi.stubGlobal(
  "fetch",
  vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.endsWith("/api/simulations") && init?.method === "POST") {
      return json({ sessionId: "session-test", scenarioId: "fall-response" });
    }

    if (url.includes("/api/simulations/session-test/steps/environment") && init?.method === "POST") {
      return json({
        stepId: "environment",
        stepScore: 20,
        totalScore: 20,
        feedback: "能先排除湿滑、障碍物等危险源。",
        completedSteps: 1,
        totalSteps: 5
      });
    }

    if (url.endsWith("/api/overview")) {
      return json({
        className: "智慧康养2301班",
        metrics: { caseCount: 6, resourceCount: 4, averageScore: 82, activeScenarioCount: 1 },
        recentSimulation: { title: "老年人跌倒应急处置", completion: 0.8 }
      });
    }

    if (url.includes("/api/cases")) {
      return json({
        items: [
          {
            id: "case-005",
            name: "高血压跌倒风险",
            summary: "适合应急处置",
            category: "chronic",
            diseases: ["高血压"],
            tags: ["跌倒"]
          }
        ]
      });
    }

    if (url.includes("/api/resources")) {
      return json({
        items: [
          {
            id: "resource-001",
            title: "平衡能力测评",
            bodyPart: "下肢",
            difficulty: "medium",
            keyPoints: ["扶稳"],
            cautions: ["防跌倒"]
          }
        ]
      });
    }

    if (url.includes("/api/analytics")) {
      return json({
        students: [{ id: "student-001", name: "沈峥宇", points: 1100 }],
        dimensions: [{ label: "安全", score: 92 }],
        ability: { knowledge: 86, practice: 78, standardization: 91, collaboration: 82 }
      });
    }

    if (url.includes("/api/evaluations")) {
      return json({ rules: [{ dimension: "safety", label: "安全", weight: 0.3 }] });
    }

    return json({
      id: "fall-response",
      title: "老年人跌倒应急处置",
      steps: [
        {
          id: "environment",
          title: "判断环境危险源",
          options: [{ id: "check-danger", label: "先排除危险源", score: 20 }]
        }
      ]
    });
  })
);

afterEach(() => {
  cleanup();
});

describe("App", () => {
  it("renders the teacher cockpit modules", async () => {
    render(<App />);

    expect(await screen.findByText("智慧康养教学云平台")).toBeInTheDocument();
    expect(await screen.findByText("案例库分类检索")).toBeInTheDocument();
    expect(await screen.findByText("应急处置场景仿真实训")).toBeInTheDocument();
    expect(await screen.findByText("测评方法库 / 动作库")).toBeInTheDocument();
    expect(await screen.findByText("学情分析")).toBeInTheDocument();
    expect(await screen.findByText("评价体系")).toBeInTheDocument();
  });

  it("submits a fall-response step and displays scoring feedback", async () => {
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "先排除危险源" }));

    expect(await screen.findByText("本次得分：20")).toBeInTheDocument();
    expect(await screen.findByText("能先排除湿滑、障碍物等危险源。")).toBeInTheDocument();
  });

  it("opens details from case, resource, student, and evaluation cards", async () => {
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "高血压跌倒风险 适合应急处置 高血压 · 跌倒" }));
    expect(await screen.findByText("已选案例：高血压跌倒风险")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "平衡能力测评 下肢 · medium 扶稳" }));
    expect(await screen.findByText("操作要点：扶稳")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "沈峥宇 1100" }));
    expect(await screen.findByText("当前画像：沈峥宇")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "安全 92" }));
    expect(await screen.findByText("当前评价维度：安全 92分")).toBeInTheDocument();
  });

  it("switches from cockpit to module pages", async () => {
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "案例库" }));
    expect(await screen.findByText("案例筛选结果")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "应急实训" }));
    expect(await screen.findByText("跌倒处置流程")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "方法动作库" }));
    expect(await screen.findByText("教学资源详情")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "学情分析" }));
    expect(await screen.findByText("班级能力画像")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "评价体系" }));
    expect(await screen.findByText("评价维度配置")).toBeInTheDocument();
  });
});
