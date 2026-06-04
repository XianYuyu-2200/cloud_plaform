import {
  Activity,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Database,
  Gauge,
  PlayCircle,
  Search,
  ShieldCheck,
  Video
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import type {
  CaseCategory,
  CaseFilters,
  CaseRecord,
  Gender,
  LearningResource,
  ResourceFilters
} from "@smart-care/shared";
import {
  createSimulation,
  getAnalytics,
  getCaseOptions,
  getCases,
  getEvaluationRules,
  getFallScenario,
  getOverview,
  getResourceOptions,
  getResources,
  getSimulationReport,
  importCases,
  submitSimulationStep,
  type CaseOptions,
  type ClassroomAnalytics,
  type EvaluationRulesResponse,
  type FallScenario,
  type Overview,
  type ResourceOptions,
  type SimulationReport
} from "./api";
import { parseCaseImportText } from "./caseImport";
import "./styles.css";

type Page = "cockpit" | "cases" | "simulation" | "resources" | "analytics" | "evaluation";

const categoryLabels: Array<{ value: CaseCategory; label: string }> = [
  { value: "healthy", label: "健康" },
  { value: "subhealthy", label: "亚健康" },
  { value: "chronic", label: "慢性病" }
];

const genderLabels = {
  female: "女",
  male: "男"
};

const difficultyLabels = {
  easy: "基础",
  medium: "进阶",
  hard: "挑战"
};

const resourceTypeLabels = {
  assessment: "测评方法",
  exercise: "训练动作"
};

const navItems: Array<{ page: Page; label: string; icon: ReactNode }> = [
  { page: "cockpit", label: "工作台", icon: <Gauge size={16} /> },
  { page: "cases", label: "案例库", icon: <Database size={16} /> },
  { page: "simulation", label: "应急实训", icon: <ShieldCheck size={16} /> },
  { page: "resources", label: "方法动作库", icon: <BookOpen size={16} /> },
  { page: "analytics", label: "学情分析", icon: <BarChart3 size={16} /> },
  { page: "evaluation", label: "评价体系", icon: <ClipboardCheck size={16} /> }
];

interface StepResultState {
  stepId: string;
  score: number;
  feedback: string;
  totalScore: number;
  completedSteps: number;
  totalSteps: number;
}

function defaultAnalytics(): ClassroomAnalytics {
  return {
    metrics: { completionRate: 0, simulationCount: 0, activeStudentCount: 0, weakStepCount: 0 },
    students: [],
    dimensions: [],
    ability: { knowledge: 0, practice: 0, standardization: 0, collaboration: 0 },
    trends: [],
    weakSteps: [],
    recommendations: []
  };
}

function defaultCaseOptions(): CaseOptions {
  return {
    categories: ["healthy", "subhealthy", "chronic"],
    genders: ["female", "male"],
    ageRanges: [],
    diseases: [],
    tags: [],
    conditions: []
  };
}

function defaultResourceOptions(): ResourceOptions {
  return {
    types: ["assessment", "exercise"],
    bodyParts: [],
    difficulties: ["easy", "medium", "hard"],
    audiences: [],
    equipment: []
  };
}

function readFileText(file: File): Promise<string> {
  if (typeof file.text === "function") {
    return file.text();
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export default function App() {
  const [page, setPage] = useState<Page>("cockpit");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [caseOptions, setCaseOptions] = useState<CaseOptions>(defaultCaseOptions);
  const [caseFilters, setCaseFilters] = useState<Omit<CaseFilters, "category">>({});
  const [caseImportStatus, setCaseImportStatus] = useState<string | null>(null);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [resourceOptions, setResourceOptions] = useState<ResourceOptions>(defaultResourceOptions);
  const [resourceFilters, setResourceFilters] = useState<ResourceFilters>({});
  const [scenario, setScenario] = useState<FallScenario | null>(null);
  const [analytics, setAnalytics] = useState<ClassroomAnalytics>(defaultAnalytics);
  const [rules, setRules] = useState<EvaluationRulesResponse["rules"]>([]);
  const [evaluationLevels, setEvaluationLevels] = useState<EvaluationRulesResponse["levels"]>([]);
  const [deductionRules, setDeductionRules] = useState<EvaluationRulesResponse["deductions"]>([]);
  const [activeCategory, setActiveCategory] = useState<CaseCategory>("chronic");
  const [simulationSessionId, setSimulationSessionId] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepResult, setStepResult] = useState<StepResultState | null>(null);
  const [stepResults, setStepResults] = useState<Record<string, StepResultState>>({});
  const [simulationReport, setSimulationReport] = useState<SimulationReport | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ClassroomAnalytics["students"][number] | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<ClassroomAnalytics["dimensions"][number] | null>(null);

  useEffect(() => {
    void Promise.all([
      getOverview().then(setOverview),
      getFallScenario().then(setScenario),
      getAnalytics().then(setAnalytics),
      getEvaluationRules().then((data) => {
        setRules(data.rules);
        setEvaluationLevels(data.levels ?? []);
        setDeductionRules(data.deductions ?? []);
      }),
      getCaseOptions().then(setCaseOptions),
      getResourceOptions().then(setResourceOptions)
    ]);
  }, []);

  useEffect(() => {
    void getCases({ category: activeCategory, ...caseFilters }).then((data) => setCases(data.items));
  }, [activeCategory, caseFilters.ageRange, caseFilters.disease, caseFilters.gender, caseFilters.keyword, caseFilters.tag]);

  useEffect(() => {
    void getResources(resourceFilters).then((data) => {
      setResources(data.items);
      setSelectedResource((current) => {
        if (current && data.items.some((item) => item.id === current.id)) return current;
        return data.items[0] ?? null;
      });
    });
  }, [
    resourceFilters.audience,
    resourceFilters.bodyPart,
    resourceFilters.difficulty,
    resourceFilters.equipment,
    resourceFilters.keyword,
    resourceFilters.type
  ]);

  async function handleSimulationOption(stepId: string, optionId: string) {
    if (!scenario) return;
    let sessionId = simulationSessionId;
    if (!sessionId) {
      const created = await createSimulation(scenario.id);
      sessionId = created.sessionId;
      setSimulationSessionId(sessionId);
    }
    const result = await submitSimulationStep(sessionId, stepId, optionId);
    const nextResult: StepResultState = {
      stepId,
      score: result.stepScore,
      feedback: result.feedback,
      totalScore: result.totalScore,
      completedSteps: result.completedSteps,
      totalSteps: result.totalSteps
    };
    setStepResult(nextResult);
    setStepResults((current) => ({ ...current, [stepId]: nextResult }));

    if (result.completedSteps >= result.totalSteps) {
      const report = await getSimulationReport(sessionId);
      setSimulationReport(report);
      return;
    }

    const currentIndex = scenario.steps.findIndex((step) => step.id === stepId);
    setActiveStepIndex(Math.min(currentIndex + 1, scenario.steps.length - 1));
  }

  function restartSimulation() {
    setSimulationSessionId(null);
    setActiveStepIndex(0);
    setStepResult(null);
    setStepResults({});
    setSimulationReport(null);
  }

  function selectDemoDefaults() {
    const demoCase = selectedCase ?? cases[0] ?? null;
    const demoResource = selectedResource ?? resources[0] ?? null;
    if (demoCase) setSelectedCase(demoCase);
    if (demoResource) setSelectedResource(demoResource);
  }

  function openTeachingModule(targetPage: Page) {
    selectDemoDefaults();
    setPage(targetPage);
  }

  function startTeachingDemo() {
    selectDemoDefaults();
    setSimulationSessionId(null);
    setActiveStepIndex(0);
    setStepResult(null);
    setStepResults({});
    setSimulationReport(null);
    setPage("simulation");
  }

  function openSimulationFromCase(item: CaseRecord) {
    setSelectedCase(item);
    setPage("simulation");
    setSimulationSessionId(null);
    setActiveStepIndex(0);
    setStepResult(null);
    setStepResults({});
    setSimulationReport(null);
  }

  function updateCaseFilter<Key extends keyof Omit<CaseFilters, "category">>(
    key: Key,
    value: Omit<CaseFilters, "category">[Key] | undefined
  ) {
    setCaseFilters((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value
    }));
  }

  function resetCaseFilters() {
    setCaseFilters({});
    setActiveCategory("chronic");
  }

  function updateResourceFilter<Key extends keyof ResourceFilters>(key: Key, value: ResourceFilters[Key] | undefined) {
    setResourceFilters((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value
    }));
  }

  function resetResourceFilters() {
    setResourceFilters({});
  }

  async function handleCaseFileImport(file: File) {
    const importedItems = parseCaseImportText(await readFileText(file), file.name);
    if (!importedItems.length) {
      setCaseImportStatus("未识别到有效案例，请检查表头和必填字段。");
      return;
    }

    const result = await importCases(importedItems);
    setCaseImportStatus(`导入成功：${result.importedCount}条`);
    const [caseData, optionData, overviewData] = await Promise.all([
      getCases({ category: activeCategory, ...caseFilters }),
      getCaseOptions(),
      getOverview()
    ]);
    setCases(caseData.items);
    setCaseOptions(optionData);
    setOverview(overviewData);
  }

  const shellProps = {
    overview,
    cases,
    caseOptions,
    caseFilters,
    caseImportStatus,
    resources,
    resourceOptions,
    resourceFilters,
    scenario,
    analytics,
    rules,
    evaluationLevels,
    deductionRules,
    activeCategory,
    activeStepIndex,
    stepResult,
    stepResults,
    simulationReport,
    selectedCase,
    selectedResource,
    selectedStudent,
    selectedDimension,
    setActiveCategory,
    setSelectedCase,
    setSelectedResource,
    setSelectedStudent,
    setSelectedDimension,
    updateCaseFilter,
    resetCaseFilters,
    updateResourceFilter,
    resetResourceFilters,
    handleCaseFileImport,
    setActiveStepIndex,
    openTeachingModule,
    restartSimulation,
    startTeachingDemo,
    openSimulationFromCase,
    handleSimulationOption
  };

  return (
    <main className="platform-shell">
      <header className="topbar">
        <div className="weather">南京　晴 7-15°C</div>
        <h1>智慧康养教学云平台</h1>
        <div className="clock">2026.6.4　星期四</div>
      </header>

      <section className="class-strip">
        <div className="class-tag">班级：{overview?.className ?? "智慧康养2301班"}</div>
        <div className="strip-title">方案 2：全栈演示平台 / 预留正式云平台扩展口</div>
        <div className="class-tag">教师端 · 课堂实训</div>
      </section>

      <nav className="module-nav" aria-label="功能模块导航">
        {navItems.map((item) => (
          <button
            aria-label={item.label}
            className={item.page === page ? "active" : ""}
            key={item.page}
            onClick={() => setPage(item.page)}
            type="button"
          >
            {item.icon}
            <span aria-hidden="true" data-label={item.label} />
          </button>
        ))}
      </nav>

      {page === "cockpit" ? <CockpitView {...shellProps} /> : null}
      {page === "cases" ? <CasesPage {...shellProps} /> : null}
      {page === "simulation" ? <SimulationPage {...shellProps} /> : null}
      {page === "resources" ? <ResourcesPage {...shellProps} /> : null}
      {page === "analytics" ? <AnalyticsPage {...shellProps} /> : null}
      {page === "evaluation" ? <EvaluationPage {...shellProps} /> : null}
    </main>
  );
}

interface ViewProps {
  overview: Overview | null;
  cases: CaseRecord[];
  caseOptions: CaseOptions;
  caseFilters: Omit<CaseFilters, "category">;
  caseImportStatus: string | null;
  resources: LearningResource[];
  resourceOptions: ResourceOptions;
  resourceFilters: ResourceFilters;
  scenario: FallScenario | null;
  analytics: ClassroomAnalytics;
  rules: EvaluationRulesResponse["rules"];
  evaluationLevels: EvaluationRulesResponse["levels"];
  deductionRules: EvaluationRulesResponse["deductions"];
  activeCategory: CaseCategory;
  activeStepIndex: number;
  stepResult: StepResultState | null;
  stepResults: Record<string, StepResultState>;
  simulationReport: SimulationReport | null;
  selectedCase: CaseRecord | null;
  selectedResource: LearningResource | null;
  selectedStudent: ClassroomAnalytics["students"][number] | null;
  selectedDimension: ClassroomAnalytics["dimensions"][number] | null;
  setActiveCategory: (category: CaseCategory) => void;
  setSelectedCase: (item: CaseRecord) => void;
  setSelectedResource: (item: LearningResource) => void;
  setSelectedStudent: (item: ClassroomAnalytics["students"][number]) => void;
  setSelectedDimension: (item: ClassroomAnalytics["dimensions"][number]) => void;
  updateCaseFilter: <Key extends keyof Omit<CaseFilters, "category">>(
    key: Key,
    value: Omit<CaseFilters, "category">[Key] | undefined
  ) => void;
  resetCaseFilters: () => void;
  updateResourceFilter: <Key extends keyof ResourceFilters>(key: Key, value: ResourceFilters[Key] | undefined) => void;
  resetResourceFilters: () => void;
  handleCaseFileImport: (file: File) => Promise<void>;
  setActiveStepIndex: (index: number) => void;
  openTeachingModule: (page: Page) => void;
  restartSimulation: () => void;
  startTeachingDemo: () => void;
  openSimulationFromCase: (item: CaseRecord) => void;
  handleSimulationOption: (stepId: string, optionId: string) => Promise<void>;
}

function CockpitView(props: ViewProps) {
  return (
    <section className="cockpit-grid">
      <TeachingFlowPanel {...props} />

      <aside className="stack">
        <CaseLibraryPanel {...props} compact />
        <ResourceLibraryPanel {...props} compact />
      </aside>

      <SimulationPanel {...props} />

      <aside className="stack">
        <AnalyticsPanel {...props} />
        <EvaluationPanel {...props} />
      </aside>
    </section>
  );
}

function TeachingFlowPanel(props: ViewProps) {
  const demoCase = props.selectedCase ?? props.cases[0] ?? null;
  const demoResource = props.selectedResource ?? props.resources[0] ?? null;
  const completionRate = Math.round(props.analytics.metrics.completionRate * 100);
  const primaryDimension = props.selectedDimension ?? props.analytics.dimensions[0] ?? null;

  const flowSteps = [
    {
      title: "1 选定真实案例",
      value: demoCase?.name ?? "等待案例数据",
      detail: demoCase ? `${demoCase.ageRange} · ${demoCase.condition}` : "从案例库进入课堂任务",
      action: "查看案例筛选",
      page: "cases" as Page
    },
    {
      title: "2 匹配测评/动作",
      value: demoResource?.title ?? "等待资源数据",
      detail: demoResource ? `${resourceTypeLabels[demoResource.type]} · ${demoResource.bodyPart}` : "关联测评方法与训练动作",
      action: "查看资源匹配",
      page: "resources" as Page
    },
    {
      title: "3 进入应急实训",
      value: props.scenario?.title ?? "跌倒处置场景",
      detail: `任务步骤 ${props.scenario?.steps.length ?? 0} 步，分步骤评分`,
      action: "开始课堂演示",
      page: "simulation" as Page
    },
    {
      title: "4 回流学情分析",
      value: `${completionRate}% 完成率`,
      detail: `${props.analytics.metrics.activeStudentCount}名学生 · ${props.analytics.metrics.weakStepCount}个薄弱步骤`,
      action: "查看学情分析",
      page: "analytics" as Page
    },
    {
      title: "5 生成评价闭环",
      value: primaryDimension ? `${primaryDimension.label} ${primaryDimension.score}分` : "等待评价维度",
      detail: `规则 ${props.rules.length} 维 · 等级 ${props.evaluationLevels.length} 档`,
      action: "查看评价体系",
      page: "evaluation" as Page
    }
  ];

  return (
    <Panel className="teaching-flow-panel" icon={<Activity size={20} />} title="课堂演示闭环">
      <div className="flow-summary">
        <div>
          <span>演示主线</span>
          <strong>案例 → 资源 → 实训 → 学情 → 评价</strong>
        </div>
        <button aria-label="一键开始课堂演示" onClick={props.startTeachingDemo} type="button">开始课堂演示</button>
      </div>
      <div className="flow-steps">
        {flowSteps.map((step) => (
          <button
            aria-label={step.action}
            className={step.page === "simulation" ? "flow-step primary" : "flow-step"}
            key={step.title}
            onClick={() => {
              if (step.page === "simulation") {
                props.startTeachingDemo();
                return;
              }
              props.openTeachingModule(step.page);
            }}
            type="button"
          >
            <span>{step.title}</span>
            <strong>{step.value}</strong>
            <small>{step.detail}</small>
            <em>{step.action}</em>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function CasesPage(props: ViewProps) {
  const active = props.selectedCase ?? props.cases[0] ?? null;
  const caseTotalText = `当前结果：${props.cases.length}个案例`;

  return (
    <ModulePage
      eyebrow="案例库分类检索"
      icon={<Database size={22} />}
      title="案例筛选结果"
      summary="围绕健康、亚健康、慢性病三个模块，按性别、年龄、身体状况、疾病种类与课堂标签快速定位真实案例。"
    >
      <div className="module-layout">
        <CaseLibraryPanel {...props} />
        <Panel icon={<Search size={20} />} title="标签筛选">
          <div className="import-card">
            <div>
              <strong>批量导入案例</strong>
              <span>支持 CSV / JSON，字段包含分类、性别、年龄、疾病、标签、摘要。</span>
            </div>
            <label className="upload-button" htmlFor="case-import-file">批量导入案例</label>
            <input
              accept=".csv,.json"
              id="case-import-file"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) void props.handleCaseFileImport(file);
                event.currentTarget.value = "";
              }}
              type="file"
            />
          </div>
          {props.caseImportStatus ? <div className="selection-note">{props.caseImportStatus}</div> : null}
          <label className="keyword-field">
            <span>关键词</span>
            <input
              aria-label="案例关键词"
              onChange={(event) => props.updateCaseFilter("keyword", event.target.value || undefined)}
              placeholder="输入案例名称、疾病或标签"
              type="search"
              value={props.caseFilters.keyword ?? ""}
            />
          </label>
          <div className="filter-board">
            <FilterTagGroup
              activeValue={props.caseFilters.gender}
              label="性别"
              options={props.caseOptions.genders.map((gender) => ({ label: genderLabels[gender], value: gender }))}
              onSelect={(value) => props.updateCaseFilter("gender", value as Gender)}
            />
            <FilterTagGroup
              activeValue={props.caseFilters.ageRange}
              label="年龄"
              options={props.caseOptions.ageRanges.map((ageRange) => ({ label: ageRange, value: ageRange }))}
              onSelect={(value) => props.updateCaseFilter("ageRange", value)}
            />
            <FilterTagGroup
              activeValue={props.activeCategory}
              label="身体状况"
              options={categoryLabels.map((item) => ({ label: item.label, value: item.value }))}
              onSelect={(value) => props.setActiveCategory(value as CaseCategory)}
            />
            <FilterTagGroup
              activeValue={props.caseFilters.disease}
              label="疾病种类"
              options={props.caseOptions.diseases.map((disease) => ({ label: disease, value: disease }))}
              onSelect={(value) => props.updateCaseFilter("disease", value)}
            />
            <FilterTagGroup
              activeValue={props.caseFilters.tag}
              label="课堂标签"
              options={props.caseOptions.tags.map((tag) => ({ label: tag, value: tag }))}
              onSelect={(value) => props.updateCaseFilter("tag", value)}
            />
          </div>
          <div className="filter-actions">
            <span>{caseTotalText}</span>
            <button onClick={props.resetCaseFilters} type="button">清空筛选</button>
          </div>
          <div className="detail-card">
            <strong>{active?.name ?? "等待选择案例"}</strong>
            <span>{active?.summary ?? "教师可在左侧选定案例用于课堂讲解。"}</span>
            {active ? <span>性别 {genderLabels[active.gender]} · 年龄 {active.ageRange} · 状态 {active.condition}</span> : null}
            {active?.tags.includes("跌倒") ? (
              <button className="inline-action" onClick={() => props.openSimulationFromCase(active)} type="button">
                进入应急实训
              </button>
            ) : null}
          </div>
        </Panel>
      </div>
    </ModulePage>
  );
}

function SimulationPage(props: ViewProps) {
  return (
    <ModulePage
      eyebrow="应急处置场景仿真实训"
      icon={<ShieldCheck size={22} />}
      title="跌倒处置流程"
      summary="把老年人跌倒场景拆成环境判断、意识判断、疼痛询问、生命体征检查、呼救转运五个步骤，支持分步评分。"
    >
      <div className="module-layout wide-main">
        <SimulationPanel {...props} />
        <Panel icon={<ClipboardCheck size={20} />} title="步骤评分汇总">
          <div className="process-list">
            {(props.scenario?.steps ?? []).map((step, index) => (
              <div className="process-item" key={step.id}>
                <b>{index + 1}</b>
                <span>{step.title}</span>
                <strong>{Math.max(...step.options.map((option) => option.score))}分</strong>
              </div>
            ))}
          </div>
          {props.stepResult ? (
            <div className="detail-card positive">
              <strong>当前步骤得分 {props.stepResult.score}</strong>
              <span>{props.stepResult.feedback}</span>
            </div>
          ) : null}
        </Panel>
      </div>
    </ModulePage>
  );
}

function ResourcesPage(props: ViewProps) {
  const active = props.selectedResource ?? props.resources[0] ?? null;

  return (
    <ModulePage
      eyebrow="测评方法库 / 动作库"
      icon={<BookOpen size={22} />}
      title="教学资源详情"
      summary="导入测评方法、训练动作与教学微课，按种类、部位、难度筛选，点选后查看视频、操作要点与注意事项。"
    >
      <div className="module-layout wide-main">
        <ResourceLibraryPanel {...props} />
        <Panel icon={<Video size={20} />} title="微课播放与要点">
          <div className="video-stage">
            <Video size={42} />
            <strong>{active?.title ?? "请选择教学资源"}</strong>
            <span>{active ? `${resourceTypeLabels[active.type]} · ${active.bodyPart} · ${difficultyLabels[active.difficulty]}` : "支持接入正式视频地址"}</span>
            {active ? <small>适用：{active.audience} · 器械：{active.equipment}</small> : null}
            {active?.mediaUrl ? <small>视频地址：{active.mediaUrl}</small> : null}
          </div>
          <div className="two-column-notes">
            <InfoList title="操作要点" items={active?.keyPoints ?? []} />
            <InfoList title="注意事项" items={active?.cautions ?? []} />
          </div>
        </Panel>
      </div>
    </ModulePage>
  );
}

function AnalyticsPage(props: ViewProps) {
  const completionRate = Math.round(props.analytics.metrics.completionRate * 100);
  const topWeakStep = props.analytics.weakSteps[0] ?? null;
  const topRecommendation = props.analytics.recommendations[0] ?? null;

  return (
    <ModulePage
      eyebrow="学情分析"
      icon={<BarChart3 size={22} />}
      title="班级能力画像"
      summary="把学生积分、综合能力与安全、质量、时效、规范、沟通等维度聚合成课堂画像，支撑教师课中调整。"
    >
      <div className="module-layout wide-main">
        <AnalyticsPanel {...props} />
        <Panel icon={<Activity size={20} />} title="学情诊断与教学建议">
          <div className="analytics-summary">
            <div>
              <span>完成率：{completionRate}%</span>
              <strong>{props.analytics.metrics.activeStudentCount}</strong>
              <small>活跃学生</small>
            </div>
            <div>
              <span>实训次数：{props.analytics.metrics.simulationCount}</span>
              <strong>{props.analytics.metrics.weakStepCount}</strong>
              <small>薄弱步骤</small>
            </div>
          </div>
          <div className="ability-grid">
            <Metric label="知识掌握" value={props.analytics.ability.knowledge} />
            <Metric label="实操能力" value={props.analytics.ability.practice} />
            <Metric label="规范程度" value={props.analytics.ability.standardization} />
            <Metric label="协作沟通" value={props.analytics.ability.collaboration} />
          </div>
          <div className="trend-strip">
            {props.analytics.trends.map((item) => (
              <div key={item.date}>
                <i style={{ height: `${item.score}%` }} />
                <span>{item.date}</span>
              </div>
            ))}
          </div>
          <div className="weak-step-list">
            {props.analytics.weakSteps.map((item) => (
              <div className="weak-step-item" key={item.step}>
                <strong>薄弱步骤：{item.step}</strong>
                <span>错因占比 {Math.round(item.mistakeRate * 100)}% · {item.suggestion}</span>
              </div>
            ))}
          </div>
          {topRecommendation ? (
            <div className="detail-card positive">
              <strong>推荐训练：{topRecommendation.title}</strong>
              <span>{topRecommendation.target} · {topRecommendation.reason}</span>
            </div>
          ) : null}
          <div className="detail-card">
            <strong>{props.selectedStudent?.name ?? "班级整体"}</strong>
            <span>当前均分 {props.selectedStudent?.averageScore ?? props.overview?.metrics.averageScore ?? 82}，可继续下钻到个人训练记录和错因分析。</span>
            {props.selectedStudent?.latestSimulation ? (
              <span>
                最近实训：{props.selectedStudent.latestSimulation.title} {props.selectedStudent.latestSimulation.score}分
              </span>
            ) : null}
            {topWeakStep ? <span>优先复训：{topWeakStep.step}</span> : null}
          </div>
        </Panel>
      </div>
    </ModulePage>
  );
}

function EvaluationPage(props: ViewProps) {
  const firstRule = props.rules[0] ?? null;

  return (
    <ModulePage
      eyebrow="评价体系"
      icon={<ClipboardCheck size={22} />}
      title="评价维度配置"
      summary="围绕安全、质量、时效、规范、沟通构建评分权重，后续可扩展为教师自定义量表与实训记录归档。"
    >
      <div className="module-layout">
        <EvaluationPanel {...props} />
        <Panel icon={<ShieldCheck size={20} />} title="权重设置">
          {firstRule ? (
            <div className="evaluation-summary">
              <span>{firstRule.label}权重：{Math.round(firstRule.weight * 100)}%</span>
              <strong>评分总则</strong>
              <small>分步评分结果按权重汇总为综合评价。</small>
            </div>
          ) : null}
          <div className="rule-grid">
            {props.rules.map((rule) => (
              <div className="rule-item" key={rule.dimension}>
                <span>{rule.label}</span>
                <div><i style={{ width: `${rule.weight * 100}%` }} /></div>
                <strong>{Math.round(rule.weight * 100)}%</strong>
              </div>
            ))}
          </div>
          <div className="level-grid">
            {props.evaluationLevels.map((level) => (
              <div className="level-item" key={level.name}>
                <strong>评分等级：{level.name} {level.minScore}分及以上</strong>
                <span>{level.description}</span>
              </div>
            ))}
          </div>
          <div className="deduction-list">
            {props.deductionRules.map((rule) => (
              <div className="deduction-item" key={rule.id}>
                <strong>扣分规则：{rule.mistake} -{rule.deduction}分</strong>
                <span>{rule.step} · {rule.suggestion}</span>
              </div>
            ))}
          </div>
          <div className="detail-card">
            <strong>{props.selectedDimension?.label ?? props.rules[0]?.label ?? "评价规则"}</strong>
            <span>分步评分结果会汇总到维度得分，用于课堂评价、课后复盘和学习档案。</span>
          </div>
        </Panel>
      </div>
    </ModulePage>
  );
}

function CaseLibraryPanel({
  activeCategory,
  cases,
  compact = false,
  selectedCase,
  setActiveCategory,
  setSelectedCase
}: ViewProps & { compact?: boolean }) {
  return (
    <Panel icon={<Database size={20} />} title="案例库分类检索">
      <div className="segmented">
        {categoryLabels.map((category) => (
          <button
            className={category.value === activeCategory ? "active" : ""}
            key={category.value}
            onClick={() => setActiveCategory(category.value)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className={compact ? "case-list" : "case-list expanded"}>
        {cases.map((item) => (
          <button className="case-item" key={item.id} onClick={() => setSelectedCase(item)} type="button">
            <strong>{item.name}</strong>
            <span>{item.summary}</span>
            <small>{[...item.diseases, ...item.tags].join(" · ") || item.condition}</small>
          </button>
        ))}
      </div>
      {selectedCase ? <div className="selection-note">已选案例：{selectedCase.name}</div> : null}
    </Panel>
  );
}

function ResourceLibraryPanel({
  compact = false,
  resourceFilters,
  resourceOptions,
  resources,
  resetResourceFilters,
  selectedResource,
  setSelectedResource,
  updateResourceFilter
}: ViewProps & { compact?: boolean }) {
  const visibleResources = compact ? resources.slice(0, 4) : resources;

  return (
    <Panel icon={<BookOpen size={20} />} title="测评方法库 / 动作库">
      {!compact ? (
        <div className="filter-stack resource-filters">
          <div className="search-field">
            <Search size={16} />
            <input
              onChange={(event) => updateResourceFilter("keyword", event.target.value || undefined)}
              placeholder="搜索方法、动作、要点"
              type="search"
              value={resourceFilters.keyword ?? ""}
            />
          </div>
          <FilterTagGroup
            activeValue={resourceFilters.type}
            label="资源种类"
            options={resourceOptions.types.map((type) => ({ label: resourceTypeLabels[type], value: type }))}
            onSelect={(value) => updateResourceFilter("type", value as ResourceFilters["type"])}
          />
          <FilterTagGroup
            activeValue={resourceFilters.bodyPart}
            label="训练部位"
            options={resourceOptions.bodyParts.map((bodyPart) => ({ label: bodyPart, value: bodyPart }))}
            onSelect={(value) => updateResourceFilter("bodyPart", value)}
          />
          <FilterTagGroup
            activeValue={resourceFilters.difficulty}
            label="难度"
            options={resourceOptions.difficulties.map((difficulty) => ({
              label: difficultyLabels[difficulty],
              value: difficulty
            }))}
            onSelect={(value) => updateResourceFilter("difficulty", value as ResourceFilters["difficulty"])}
          />
          <FilterTagGroup
            activeValue={resourceFilters.audience}
            label="适用人群"
            options={resourceOptions.audiences.map((audience) => ({ label: audience, value: audience }))}
            onSelect={(value) => updateResourceFilter("audience", value)}
          />
          <FilterTagGroup
            activeValue={resourceFilters.equipment}
            label="器械"
            options={resourceOptions.equipment.map((equipment) => ({ label: equipment, value: equipment }))}
            onSelect={(value) => updateResourceFilter("equipment", value)}
          />
          <div className="filter-actions">
            <span>资源匹配：{resources.length}项</span>
            <button onClick={resetResourceFilters} type="button">清空筛选</button>
          </div>
        </div>
      ) : null}
      <div className={compact ? "resource-grid" : "resource-grid expanded"}>
        {visibleResources.map((item) => (
          <button className="resource-item" key={item.id} onClick={() => setSelectedResource(item)} type="button">
            <strong>{item.title}</strong>
            <span>
              {item.bodyPart} · {item.difficulty}
            </span>
            <small>{item.keyPoints[0]}</small>
          </button>
        ))}
      </div>
      {!visibleResources.length ? <div className="empty-state">暂无匹配资源</div> : null}
      {selectedResource ? <div className="selection-note">操作要点：{selectedResource.keyPoints.join("、")}</div> : null}
    </Panel>
  );
}

function SimulationPanel({
  activeStepIndex,
  handleSimulationOption,
  overview,
  restartSimulation,
  scenario,
  selectedCase,
  setActiveStepIndex,
  simulationReport,
  stepResult,
  stepResults
}: ViewProps) {
  const steps = scenario?.steps ?? [];
  const activeStep = steps[activeStepIndex] ?? steps[0];
  const completedCount = Object.keys(stepResults).length;
  const totalCount = steps.length;

  return (
    <Panel className="simulation-panel" icon={<PlayCircle size={20} />} title="应急处置场景仿真实训">
      {selectedCase ? <div className="scenario-case">当前案例：{selectedCase.name}</div> : null}
      <div className="scenario-tabs">
        {steps.map((step, index) => (
          <button
            className={`${index === activeStepIndex ? "active" : ""} ${stepResults[step.id] ? "completed" : ""}`}
            key={step.id}
            onClick={() => setActiveStepIndex(index)}
            type="button"
          >
            {step.title}
          </button>
        ))}
      </div>
      <div className="simulation-progress">
        <span>流程进度：{completedCount}/{totalCount || 0}</span>
        <div><i style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : "0%" }} /></div>
      </div>
      <div className="simulation-body">
        <div className="scene-stage">
          <div className="fallen-person" />
        </div>
        <div className="step-list">
          {steps.slice(0, 5).map((step, index) => (
            <div className={`step-row ${index === activeStepIndex ? "active" : ""} ${stepResults[step.id] ? "completed" : ""}`} key={step.id}>
              <b>{index + 1}</b>
              <span>{step.title}</span>
              <strong>{stepResults[step.id]?.score ?? step.options[0]?.score ?? 0}</strong>
            </div>
          ))}
        </div>
      </div>
      {!simulationReport ? (
        <div className="option-bank">
          {(activeStep?.options ?? []).map((option) => (
            <button
              className="option-button"
              key={option.id}
              onClick={() => void handleSimulationOption(activeStep.id, option.id)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      {stepResult ? (
        <div className="feedback-box">
          <strong>本次得分：{stepResult.score}</strong>
          <span>{stepResult.feedback}</span>
        </div>
      ) : null}
      {simulationReport ? (
        <div className="simulation-report">
          <div>
            <strong>实训总分：{simulationReport.totalScore}</strong>
            <span>已完成：{simulationReport.steps.length}/{totalCount || simulationReport.steps.length}</span>
          </div>
          <div className="report-dimensions">
            {simulationReport.evaluation.map((item) => (
              <span key={item.dimension}>{item.label} {item.score}分</span>
            ))}
          </div>
          <button onClick={restartSimulation} type="button">重新实训</button>
        </div>
      ) : null}
      <div className="metric-row">
        <Metric label="案例数" value={overview?.metrics.caseCount ?? 0} />
        <Metric label="资源数" value={overview?.metrics.resourceCount ?? 0} />
        <Metric label="均分" value={overview?.metrics.averageScore ?? 0} />
        <Metric label="场景" value={overview?.metrics.activeScenarioCount ?? 0} />
      </div>
    </Panel>
  );
}

function AnalyticsPanel({ analytics, overview, selectedStudent, setSelectedStudent }: ViewProps) {
  const completionRate = Math.round(analytics.metrics.completionRate * 100);

  return (
    <Panel icon={<BarChart3 size={20} />} title="学情分析">
      <div className="ability-ring">
        <div>
          {overview?.metrics.averageScore ?? 82}分
          <br />
          综合能力
        </div>
      </div>
      <div className="analytics-mini">
        <span>完成率 {completionRate}%</span>
        <span>实训 {analytics.metrics.simulationCount}次</span>
      </div>
      <div className="student-list">
        {analytics.students.map((student) => (
          <button className="student-row" key={student.id} onClick={() => setSelectedStudent(student)} type="button">
            <span>{student.name}</span>
            <strong>{student.points}</strong>
          </button>
        ))}
      </div>
      {selectedStudent ? <div className="selection-note">当前画像：{selectedStudent.name}</div> : null}
    </Panel>
  );
}

function EvaluationPanel({ analytics, rules, selectedDimension, setSelectedDimension }: ViewProps) {
  return (
    <Panel icon={<ClipboardCheck size={20} />} title="评价体系">
      <div className="score-bars">
        {analytics.dimensions.map((dimension) => (
          <button className="score-bar" key={dimension.label} onClick={() => setSelectedDimension(dimension)} type="button">
            <span>{dimension.label}</span>
            <div><i style={{ width: `${dimension.score}%` }} /></div>
            <strong>{dimension.score}</strong>
          </button>
        ))}
      </div>
      {selectedDimension ? (
        <div className="selection-note">
          当前评价维度：{selectedDimension.label} {selectedDimension.score}分
        </div>
      ) : null}
      <div className="rules-note">
        <Activity size={16} />
        <span>规则维度：{rules.map((rule) => rule.label).join(" / ")}</span>
      </div>
    </Panel>
  );
}

function ModulePage({
  children,
  eyebrow,
  icon,
  summary,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  icon: ReactNode;
  summary: string;
  title: string;
}) {
  return (
    <section className="module-page">
      <div className="module-header">
        <div className="module-title">
          {icon}
          <div>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
          </div>
        </div>
        <p>{summary}</p>
      </div>
      {children}
    </section>
  );
}

function Panel({
  children,
  className = "",
  icon,
  title
}: {
  children: ReactNode;
  className?: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <h2>
        {icon}
        {title}
      </h2>
      <div className="panel-content">{children}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FilterTagGroup({
  activeValue,
  label,
  onSelect,
  options
}: {
  activeValue?: string;
  label: string;
  onSelect: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="tag-group">
      <strong>{label}</strong>
      <div>
        {options.map((option) => (
          <button
            className={activeValue === option.value ? "active" : ""}
            key={option.value}
            onClick={() => onSelect(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="info-list">
      <strong>{title}</strong>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <span>暂无数据</span>
      )}
    </div>
  );
}
