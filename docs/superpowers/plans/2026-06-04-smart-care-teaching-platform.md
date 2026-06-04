# Smart Care Teaching Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable full-stack demo platform for smart elder-care teaching with a high-fidelity digital-workshop UI, API-backed case/resource search, fall-response simulation, learning analytics, and evaluation scoring.

**Architecture:** Create a monorepo with `apps/api`, `apps/web`, and `packages/shared`. Shared TypeScript models and pure functions define the platform contract; the API serves seed data and simulation state; the web app consumes the API and presents the teacher-facing cockpit.

**Tech Stack:** Node.js, npm workspaces, TypeScript, Vite, React, Vitest, Express, Supertest, CSS modules or plain CSS, local seed JSON.

---

## File Structure

- Create `package.json`: root workspace scripts for install, dev, build, and test.
- Create `tsconfig.base.json`: shared TypeScript compiler options.
- Create `packages/shared/package.json`: shared package metadata.
- Create `packages/shared/src/types.ts`: domain types and enums.
- Create `packages/shared/src/filters.ts`: case/resource filtering helpers.
- Create `packages/shared/src/scoring.ts`: simulation and evaluation scoring helpers.
- Create `packages/shared/src/index.ts`: shared exports.
- Create `packages/shared/src/*.test.ts`: unit tests for pure logic.
- Create `apps/api/package.json`: API package metadata and scripts.
- Create `apps/api/src/seed.ts`: demo data for cases, resources, students, analytics, scenarios, and rules.
- Create `apps/api/src/routes.ts`: Express routes.
- Create `apps/api/src/server.ts`: app factory and local server entry.
- Create `apps/api/src/routes.test.ts`: API contract tests.
- Create `apps/web/package.json`: web package metadata and scripts.
- Create `apps/web/index.html`: Vite HTML entry.
- Create `apps/web/src/main.tsx`: React bootstrap.
- Create `apps/web/src/api.ts`: API client.
- Create `apps/web/src/App.tsx`: page shell and orchestration.
- Create `apps/web/src/App.test.tsx`: smoke and interaction tests.
- Create `apps/web/src/styles.css`: digital-workshop visual system.

## Task 1: Workspace Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `packages/shared/package.json`
- Create: `packages/shared/src/index.ts`
- Create: `apps/api/package.json`
- Create: `apps/web/package.json`

- [ ] **Step 1: Write package metadata**

Create root `package.json`:

```json
{
  "name": "smart-care-teaching-platform",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm-run-all --parallel dev:api dev:web",
    "dev:api": "npm --workspace @smart-care/api run dev",
    "dev:web": "npm --workspace @smart-care/web run dev",
    "build": "npm --workspaces run build",
    "test": "npm --workspaces run test",
    "test:run": "npm --workspaces run test:run"
  },
  "devDependencies": {
    "npm-run-all": "^4.1.5",
    "typescript": "^5.8.3",
    "vitest": "^3.2.0"
  }
}
```

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

Create `packages/shared/package.json`:

```json
{
  "name": "@smart-care/shared",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest --run",
    "test:run": "vitest --run"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "vitest": "^3.2.0"
  }
}
```

Create `apps/api/package.json`:

```json
{
  "name": "@smart-care/api",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "test": "vitest --run",
    "test:run": "vitest --run"
  },
  "dependencies": {
    "@smart-care/shared": "0.1.0",
    "cors": "^2.8.5",
    "express": "^4.19.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/supertest": "^6.0.2",
    "supertest": "^7.0.0",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vitest": "^3.2.0"
  }
}
```

Create `apps/web/package.json`:

```json
{
  "name": "@smart-care/web",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -p tsconfig.json && vite build",
    "test": "vitest --run",
    "test:run": "vitest --run"
  },
  "dependencies": {
    "@smart-care/shared": "0.1.0",
    "@vitejs/plugin-react": "^4.5.0",
    "vite": "^6.3.5",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "lucide-react": "^0.511.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.6",
    "@types/react-dom": "^19.1.5",
    "jsdom": "^26.1.0",
    "typescript": "^5.8.3",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
npm install
```

Expected: npm creates `package-lock.json` and installs all workspace dependencies without dependency resolution errors.

- [ ] **Step 3: Commit scaffold**

Run:

```bash
git add package.json package-lock.json tsconfig.base.json packages/shared/package.json apps/api/package.json apps/web/package.json
git commit -m "chore: scaffold smart care platform workspaces"
```

Expected: if the workspace is not a Git repository, record that commit is unavailable and continue without destructive Git setup.

## Task 2: Shared Domain Logic

**Files:**
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/filters.ts`
- Create: `packages/shared/src/scoring.ts`
- Modify: `packages/shared/src/index.ts`
- Test: `packages/shared/src/filters.test.ts`
- Test: `packages/shared/src/scoring.test.ts`

- [ ] **Step 1: Write failing filter tests**

Create `packages/shared/src/filters.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { filterCases, filterResources } from "./filters";
import type { CaseRecord, LearningResource } from "./types";

const cases: CaseRecord[] = [
  { id: "c1", category: "healthy", name: "健康步态案例", gender: "female", ageRange: "65-75", condition: "健康", diseases: [], tags: ["步态"], summary: "适合平衡训练" },
  { id: "c2", category: "chronic", name: "高血压跌倒风险", gender: "male", ageRange: "75-85", condition: "慢性病", diseases: ["高血压"], tags: ["跌倒"], summary: "适合应急处置" }
];

const resources: LearningResource[] = [
  { id: "r1", type: "assessment", title: "平衡能力测评", bodyPart: "下肢", difficulty: "medium", audience: "老年人", equipment: "无", mediaUrl: "/media/balance.mp4", keyPoints: ["扶稳"], cautions: ["防跌倒"] },
  { id: "r2", type: "exercise", title: "肩颈放松训练", bodyPart: "肩颈", difficulty: "easy", audience: "亚健康", equipment: "无", mediaUrl: "/media/neck.mp4", keyPoints: ["慢速"], cautions: ["避免疼痛"] }
];

describe("filterCases", () => {
  it("filters cases by category, gender, age range, and disease", () => {
    expect(filterCases(cases, { category: "chronic", gender: "male", ageRange: "75-85", disease: "高血压" })).toEqual([cases[1]]);
  });
});

describe("filterResources", () => {
  it("filters resources by type, body part, and difficulty", () => {
    expect(filterResources(resources, { type: "assessment", bodyPart: "下肢", difficulty: "medium" })).toEqual([resources[0]]);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm --workspace @smart-care/shared run test:run
```

Expected: FAIL because `./filters` and shared types do not exist.

- [ ] **Step 3: Implement shared types and filters**

Create `packages/shared/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false,
    "declaration": true,
    "emitDeclarationOnly": false
  },
  "include": ["src"]
}
```

Create `packages/shared/src/types.ts`:

```ts
export type CaseCategory = "healthy" | "subhealthy" | "chronic";
export type Gender = "female" | "male";
export type ResourceType = "assessment" | "exercise";
export type Difficulty = "easy" | "medium" | "hard";

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

export type EvaluationDimension = "safety" | "quality" | "timeliness" | "standardization" | "communication";

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
```

Create `packages/shared/src/filters.ts`:

```ts
import type { CaseFilters, CaseRecord, LearningResource, ResourceFilters } from "./types";

export function filterCases(cases: CaseRecord[], filters: CaseFilters): CaseRecord[] {
  return cases.filter((item) => {
    if (filters.category && item.category !== filters.category) return false;
    if (filters.gender && item.gender !== filters.gender) return false;
    if (filters.ageRange && item.ageRange !== filters.ageRange) return false;
    if (filters.disease && !item.diseases.includes(filters.disease)) return false;
    if (filters.tag && !item.tags.includes(filters.tag)) return false;
    return true;
  });
}

export function filterResources(resources: LearningResource[], filters: ResourceFilters): LearningResource[] {
  return resources.filter((item) => {
    if (filters.type && item.type !== filters.type) return false;
    if (filters.bodyPart && item.bodyPart !== filters.bodyPart) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    return true;
  });
}
```

- [ ] **Step 4: Write failing scoring tests**

Create `packages/shared/src/scoring.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { scoreSimulation, summarizeEvaluation } from "./scoring";
import type { EvaluationRule, SimulationScenario } from "./types";

const scenario: SimulationScenario = {
  id: "fall",
  title: "老年人跌倒应急处置",
  steps: [
    { id: "scene", title: "环境判断", dimension: "safety", options: [{ id: "safe", label: "先排除危险源", score: 20, feedback: "正确" }] },
    { id: "call", title: "呼救转运", dimension: "communication", options: [{ id: "call-120", label: "呼叫急救", score: 18, feedback: "正确" }] }
  ]
};

const rules: EvaluationRule[] = [
  { dimension: "safety", label: "安全", weight: 0.6 },
  { dimension: "communication", label: "沟通", weight: 0.4 }
];

describe("scoreSimulation", () => {
  it("adds selected step scores and returns feedback", () => {
    expect(scoreSimulation(scenario, { scene: "safe", call: "call-120" }).totalScore).toBe(38);
  });
});

describe("summarizeEvaluation", () => {
  it("groups scored steps by evaluation dimension", () => {
    const report = scoreSimulation(scenario, { scene: "safe", call: "call-120" });
    expect(summarizeEvaluation(report, rules)).toEqual([
      { dimension: "safety", label: "安全", score: 20, weightedScore: 12 },
      { dimension: "communication", label: "沟通", score: 18, weightedScore: 7.2 }
    ]);
  });
});
```

- [ ] **Step 5: Run tests and verify failure**

Run:

```bash
npm --workspace @smart-care/shared run test:run
```

Expected: FAIL because `./scoring` does not exist.

- [ ] **Step 6: Implement scoring and exports**

Create `packages/shared/src/scoring.ts`:

```ts
import type { EvaluationRule, SimulationScenario } from "./types";

export interface ScoredStep {
  stepId: string;
  title: string;
  dimension: EvaluationRule["dimension"];
  optionId: string;
  optionLabel: string;
  score: number;
  feedback: string;
}

export interface SimulationReport {
  totalScore: number;
  steps: ScoredStep[];
}

export function scoreSimulation(scenario: SimulationScenario, selections: Record<string, string>): SimulationReport {
  const steps = scenario.steps.flatMap((step) => {
    const optionId = selections[step.id];
    const option = step.options.find((candidate) => candidate.id === optionId);
    if (!option) return [];
    return [{
      stepId: step.id,
      title: step.title,
      dimension: step.dimension,
      optionId: option.id,
      optionLabel: option.label,
      score: option.score,
      feedback: option.feedback
    }];
  });

  return {
    totalScore: steps.reduce((sum, step) => sum + step.score, 0),
    steps
  };
}

export function summarizeEvaluation(report: SimulationReport, rules: EvaluationRule[]) {
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
```

Modify `packages/shared/src/index.ts`:

```ts
export * from "./types";
export * from "./filters";
export * from "./scoring";
```

- [ ] **Step 7: Run shared tests**

Run:

```bash
npm --workspace @smart-care/shared run test:run
```

Expected: PASS for filter and scoring tests.

## Task 3: API Service

**Files:**
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/src/seed.ts`
- Create: `apps/api/src/routes.ts`
- Create: `apps/api/src/server.ts`
- Test: `apps/api/src/routes.test.ts`

- [ ] **Step 1: Write failing API contract tests**

Create `apps/api/src/routes.test.ts`:

```ts
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./server";

const app = createApp();

describe("platform API", () => {
  it("returns dashboard overview", async () => {
    const response = await request(app).get("/api/overview").expect(200);
    expect(response.body.metrics.caseCount).toBeGreaterThan(0);
    expect(response.body.metrics.resourceCount).toBeGreaterThan(0);
  });

  it("filters chronic cases by disease", async () => {
    const response = await request(app).get("/api/cases?category=chronic&disease=高血压").expect(200);
    expect(response.body.items.every((item: { diseases: string[] }) => item.diseases.includes("高血压"))).toBe(true);
  });

  it("submits a fall simulation step and reports score", async () => {
    const created = await request(app).post("/api/simulations").send({ scenarioId: "fall-response" }).expect(201);
    const response = await request(app)
      .post(`/api/simulations/${created.body.sessionId}/steps/environment`)
      .send({ optionId: "check-danger" })
      .expect(200);
    expect(response.body.stepScore).toBe(20);
  });
});
```

- [ ] **Step 2: Run API tests and verify failure**

Run:

```bash
npm --workspace @smart-care/api run test:run
```

Expected: FAIL because API files do not exist.

- [ ] **Step 3: Implement seed data and routes**

Create `apps/api/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false
  },
  "include": ["src"]
}
```

Create `apps/api/src/seed.ts` with at least six cases, four resources, four students, one fall scenario, and five evaluation rules. Include a chronic case with disease `高血压` and a scenario step `environment` with option `check-danger` worth `20`.

Create `apps/api/src/server.ts`:

```ts
import cors from "cors";
import express from "express";
import { createRoutes } from "./routes";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use("/api", createRoutes());
  return app;
}

if (process.env.NODE_ENV !== "test") {
  const port = Number(process.env.PORT ?? 4000);
  createApp().listen(port, () => {
    console.log(`Smart care API running on http://localhost:${port}`);
  });
}
```

Create `apps/api/src/routes.ts` with routes for overview, cases, resources, fall scenario, simulation session creation, simulation step submission, simulation report, analytics, evaluation rules, and import preview. Use shared `filterCases`, `filterResources`, and `scoreSimulation`.

- [ ] **Step 4: Run API tests**

Run:

```bash
npm --workspace @smart-care/api run test:run
```

Expected: PASS for all API contract tests.

## Task 4: Web App Shell and API Client

**Files:**
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/api.ts`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Test: `apps/web/src/App.test.tsx`

- [ ] **Step 1: Write failing web smoke test**

Create `apps/web/src/App.test.tsx`:

```tsx
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

vi.stubGlobal("fetch", vi.fn(async (url: string) => {
  if (url.endsWith("/overview")) {
    return Response.json({ metrics: { caseCount: 6, resourceCount: 4, averageScore: 82 }, className: "智慧康养2301班" });
  }
  if (url.includes("/cases")) {
    return Response.json({ items: [{ id: "c1", name: "高血压跌倒风险", summary: "适合应急处置", diseases: ["高血压"], tags: ["跌倒"] }] });
  }
  if (url.includes("/resources")) {
    return Response.json({ items: [{ id: "r1", title: "平衡能力测评", bodyPart: "下肢", difficulty: "medium", keyPoints: ["扶稳"], cautions: ["防跌倒"] }] });
  }
  if (url.includes("/analytics")) {
    return Response.json({ students: [{ id: "s1", name: "沈峥宇", points: 1100 }], dimensions: [{ label: "安全", score: 92 }] });
  }
  if (url.includes("/evaluations")) {
    return Response.json({ rules: [{ label: "安全", weight: 0.3 }] });
  }
  return Response.json({ id: "fall-response", title: "老年人跌倒应急处置", steps: [] });
}));

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
});
```

- [ ] **Step 2: Run web test and verify failure**

Run:

```bash
npm --workspace @smart-care/web run test:run
```

Expected: FAIL because Vite config and React files do not exist.

- [ ] **Step 3: Implement app shell and client**

Create Vite config with React plugin and jsdom test environment. Create `api.ts` with `getOverview`, `getCases`, `getResources`, `getScenario`, `getAnalytics`, and `getEvaluationRules`, all using `fetch("/api/...")`.

Create `App.tsx` with the cockpit sections named in the smoke test. Use loaded API data for counts, case/resource lists, student ranking, dimension bars, and fall simulation steps.

- [ ] **Step 4: Run web test**

Run:

```bash
npm --workspace @smart-care/web run test:run
```

Expected: PASS for the smoke test.

## Task 5: Digital Workshop Styling and Interactions

**Files:**
- Create: `apps/web/src/styles.css`
- Modify: `apps/web/src/App.tsx`
- Test: `apps/web/src/App.test.tsx`

- [ ] **Step 1: Add failing interaction test**

Add this test to `apps/web/src/App.test.tsx`:

```tsx
import userEvent from "@testing-library/user-event";

it("changes visible case filter to chronic disease", async () => {
  render(<App />);
  await userEvent.click(await screen.findByRole("button", { name: "慢性病" }));
  expect(await screen.findByText("高血压跌倒风险")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run web test and verify failure**

Run:

```bash
npm --workspace @smart-care/web run test:run
```

Expected: FAIL because filter buttons are not wired.

- [ ] **Step 3: Implement interactive filter buttons and styles**

Modify `App.tsx` so category buttons call `getCases({ category })` and update the visible case list. Create `styles.css` using deep blue background, cyan borders, angular header bars, segmented filters, step list, metric tiles, ring chart, and horizontal score bars. Keep cards at 8px radius or less.

- [ ] **Step 4: Run web tests**

Run:

```bash
npm --workspace @smart-care/web run test:run
```

Expected: PASS for smoke and interaction tests.

## Task 6: Integration, Proxy, and Browser Verification

**Files:**
- Modify: `apps/web/vite.config.ts`
- Modify: `README.md`

- [ ] **Step 1: Configure API proxy**

Modify `apps/web/vite.config.ts`:

```ts
server: {
  proxy: {
    "/api": "http://127.0.0.1:4000"
  }
}
```

- [ ] **Step 2: Add run documentation**

Create `README.md` with:

```md
# 智慧康养教学云平台

## 本地运行

```bash
npm install
npm run dev
```

API: http://127.0.0.1:4000  
Web: http://127.0.0.1:5173
```

- [ ] **Step 3: Run full verification**

Run:

```bash
npm run test:run
npm run build
```

Expected: all workspace tests pass and all packages build.

- [ ] **Step 4: Start dev server**

Run:

```bash
npm run dev
```

Expected: API listens on `http://127.0.0.1:4000` and Vite serves web on `http://127.0.0.1:5173`.

- [ ] **Step 5: Verify in browser**

Open `http://127.0.0.1:5173`. Confirm:

- Header shows `智慧康养教学云平台`.
- Five modules are visible without incoherent overlap at 1280x720.
- Case category buttons update the case list.
- Resource library displays method/action entries.
- Analytics and evaluation panels display numeric scores.

## Self-Review

Spec coverage:

- Case library search: Task 2 filtering, Task 3 `/api/cases`, Task 4/5 case UI.
- Fall-response simulation: Task 2 scoring, Task 3 simulation endpoints, Task 4 central simulation UI.
- Method/action library: Task 2 resource filtering, Task 3 `/api/resources`, Task 4 resource UI.
- Learning analytics: Task 3 analytics endpoint, Task 4 analytics panel.
- Evaluation system: Task 2 evaluation model, Task 3 rules endpoint, Task 4 evaluation panel.
- Visual style: Task 5 CSS and Task 6 browser verification.
- Full-stack extensibility: Task 1 monorepo structure and shared package boundary.

Placeholder scan:

- No TBD, TODO, "implement later", or unspecified edge handling remains in this plan.

Type consistency:

- `CaseRecord`, `LearningResource`, `SimulationScenario`, `SimulationStep`, `EvaluationRule`, and `StudentProfile` are introduced in Task 2 and reused by API/web tasks.
