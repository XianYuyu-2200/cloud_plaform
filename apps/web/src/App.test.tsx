import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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

    if (url.endsWith("/api/cases/import") && init?.method === "POST") {
      return json({ importedCount: 1, total: 7, items: [] });
    }

    if (url.endsWith("/api/cases/options")) {
      return json({
        categories: ["healthy", "subhealthy", "chronic"],
        genders: ["male", "female"],
        ageRanges: ["60-70", "75-85"],
        diseases: ["高血压", "糖尿病"],
        tags: ["跌倒", "应急"],
        conditions: ["健康", "亚健康", "慢性病"]
      });
    }

    if (url.includes("/api/simulations/session-test/steps/environment") && init?.method === "POST") {
      return json({
        stepId: "environment",
        stepScore: 20,
        totalScore: 20,
        feedback: "能先排除湿滑、障碍物等危险源。",
        completedSteps: 1,
        totalSteps: 2
      });
    }

    if (url.includes("/api/simulations/session-test/steps/consciousness") && init?.method === "POST") {
      return json({
        stepId: "consciousness",
        stepScore: 18,
        totalScore: 38,
        feedback: "能通过呼唤和观察判断意识状态。",
        completedSteps: 2,
        totalSteps: 2
      });
    }

    if (url.endsWith("/api/simulations/session-test/report")) {
      return json({
        totalScore: 38,
        steps: [
          {
            stepId: "environment",
            title: "判断环境危险源",
            dimension: "safety",
            optionId: "check-danger",
            optionLabel: "先排除危险源",
            score: 20,
            feedback: "能先排除湿滑、障碍物等危险源。"
          },
          {
            stepId: "consciousness",
            title: "判断意识状态",
            dimension: "quality",
            optionId: "ask-response",
            optionLabel: "呼唤并观察意识反应",
            score: 18,
            feedback: "能通过呼唤和观察判断意识状态。"
          }
        ],
        evaluation: [
          { dimension: "safety", label: "安全", score: 20, weightedScore: 6 },
          { dimension: "quality", label: "质量", score: 18, weightedScore: 3.96 }
        ]
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
            gender: "male",
            ageRange: "75-85",
            condition: "慢性病",
            diseases: ["高血压"],
            tags: ["跌倒"]
          }
        ]
      });
    }

    if (url.endsWith("/api/resources/options")) {
      return json({
        types: ["assessment", "exercise"],
        bodyParts: ["下肢", "肩颈"],
        difficulties: ["easy", "medium"],
        audiences: ["老年人", "亚健康"],
        equipment: ["秒表", "无"]
      });
    }

    if (url.includes("/api/resources")) {
      const filtered = url.includes("type=assessment") || url.includes("keyword=");
      return json({
        items: filtered
          ? [
              {
                id: "resource-001",
                title: "平衡能力测评",
                type: "assessment",
                bodyPart: "下肢",
                difficulty: "medium",
                audience: "老年人",
                equipment: "秒表",
                mediaUrl: "/media/balance.mp4",
                keyPoints: ["扶稳"],
                cautions: ["防跌倒"]
              }
            ]
          : [
              {
                id: "resource-001",
                title: "平衡能力测评",
                type: "assessment",
                bodyPart: "下肢",
                difficulty: "medium",
                audience: "老年人",
                equipment: "秒表",
                mediaUrl: "/media/balance.mp4",
                keyPoints: ["扶稳"],
                cautions: ["防跌倒"]
              },
              {
                id: "resource-002",
                title: "肩颈放松训练",
                type: "exercise",
                bodyPart: "肩颈",
                difficulty: "easy",
                audience: "亚健康",
                equipment: "无",
                mediaUrl: "/media/neck.mp4",
                keyPoints: ["慢速"],
                cautions: ["避免疼痛"]
              }
            ],
        total: filtered ? 1 : 2
      });
    }

    if (url.includes("/api/analytics")) {
      return json({
        metrics: { completionRate: 0.86, simulationCount: 128, activeStudentCount: 38, weakStepCount: 3 },
        students: [
          {
            id: "student-001",
            name: "沈峥宇",
            points: 1100,
            completionRate: 0.96,
            averageScore: 90,
            latestSimulation: { title: "跌倒处置流程", score: 90, date: "2026-06-04" }
          }
        ],
        dimensions: [{ label: "安全", score: 92 }],
        ability: { knowledge: 86, practice: 78, standardization: 91, collaboration: 82 },
        trends: [{ date: "06-04", score: 86 }],
        weakSteps: [{ step: "呼救与转运决策", mistakeRate: 0.31, suggestion: "加强呼救判断。" }],
        recommendations: [{ title: "跌倒处置复盘案例", target: "呼救转运薄弱学生", reason: "匹配当前最高错因步骤。" }]
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
        },
        {
          id: "consciousness",
          title: "判断意识状态",
          options: [{ id: "ask-response", label: "呼唤并观察意识反应", score: 18 }]
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

  it("completes multiple fall-response steps and displays a total report", async () => {
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "应急实训" }));
    await userEvent.click(await screen.findByRole("button", { name: "先排除危险源" }));
    await userEvent.click(await screen.findByRole("button", { name: "呼唤并观察意识反应" }));

    expect(await screen.findByText("实训总分：38")).toBeInTheDocument();
    expect(await screen.findByText("已完成：2/2")).toBeInTheDocument();
    expect(await screen.findByText("安全 20分")).toBeInTheDocument();
    expect(await screen.findByText("质量 18分")).toBeInTheDocument();
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

  it("filters the case library with multiple conditions", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "案例库" }));
    await screen.findByText("案例筛选结果");

    await userEvent.click(await screen.findByRole("button", { name: "男" }));
    await userEvent.click(await screen.findByRole("button", { name: "75-85" }));
    await userEvent.click(await screen.findByRole("button", { name: "高血压" }));
    await userEvent.click(await screen.findByRole("button", { name: "跌倒" }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) => {
          const url = String(input);
          return (
            url.includes("/api/cases?") &&
            url.includes("category=chronic") &&
            url.includes("gender=male") &&
            url.includes("ageRange=75-85") &&
            url.includes("disease=%E9%AB%98%E8%A1%80%E5%8E%8B") &&
            url.includes("tag=%E8%B7%8C%E5%80%92")
          );
        })
      ).toBe(true);
    });
  });

  it("filters the method and action library with resource conditions", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "方法动作库" }));
    expect(await screen.findByText("资源匹配：2项")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "测评方法" }));
    await userEvent.click(await screen.findByRole("button", { name: "下肢" }));
    await userEvent.click(await screen.findByRole("button", { name: "老年人" }));
    await userEvent.click(await screen.findByRole("button", { name: "秒表" }));
    await userEvent.type(screen.getByPlaceholderText("搜索方法、动作、要点"), "防滑");

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input]) => {
          const url = String(input);
          return (
            url.includes("/api/resources?") &&
            url.includes("type=assessment") &&
            url.includes("bodyPart=%E4%B8%8B%E8%82%A2") &&
            url.includes("audience=%E8%80%81%E5%B9%B4%E4%BA%BA") &&
            url.includes("equipment=%E7%A7%92%E8%A1%A8") &&
            url.includes("keyword=%E9%98%B2%E6%BB%91")
          );
        })
      ).toBe(true);
    });
    expect(await screen.findByText("资源匹配：1项")).toBeInTheDocument();
    expect(await screen.findByText("适用：老年人 · 器械：秒表")).toBeInTheDocument();
  });

  it("shows class learning analytics, weak steps, and student insight", async () => {
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "学情分析" }));

    expect(await screen.findByText("完成率：86%")).toBeInTheDocument();
    expect(await screen.findByText("实训次数：128")).toBeInTheDocument();
    expect(await screen.findByText("薄弱步骤：呼救与转运决策")).toBeInTheDocument();
    expect(await screen.findByText("推荐训练：跌倒处置复盘案例")).toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: "沈峥宇 1100" }));
    expect(await screen.findByText("最近实训：跌倒处置流程 90分")).toBeInTheDocument();
  });

  it("uploads a batch case file and reports import feedback", async () => {
    const fetchMock = vi.mocked(fetch);
    render(<App />);

    await userEvent.click(await screen.findByRole("button", { name: "案例库" }));
    const file = new File(
      [
        "category,name,gender,ageRange,condition,diseases,tags,summary\n" +
          "subhealthy,导入肩颈案例,female,60-70,亚健康,肩周炎,课堂导入|肩颈,批量导入案例"
      ],
      "cases.csv",
      { type: "text/csv" }
    );

    await userEvent.upload(await screen.findByLabelText("批量导入案例"), file);

    expect(await screen.findByText("导入成功：1条")).toBeInTheDocument();
    expect(
      fetchMock.mock.calls.some(([input, init]) => String(input).endsWith("/api/cases/import") && init?.method === "POST")
    ).toBe(true);
  });
});
