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
import type { CaseCategory, CaseRecord, LearningResource } from "@smart-care/shared";
import {
  createSimulation,
  getAnalytics,
  getCases,
  getEvaluationRules,
  getFallScenario,
  getOverview,
  getResources,
  submitSimulationStep,
  type ClassroomAnalytics,
  type EvaluationRulesResponse,
  type FallScenario,
  type Overview
} from "./api";
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

function defaultAnalytics(): ClassroomAnalytics {
  return {
    students: [],
    dimensions: [],
    ability: { knowledge: 0, practice: 0, standardization: 0, collaboration: 0 }
  };
}

export default function App() {
  const [page, setPage] = useState<Page>("cockpit");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [scenario, setScenario] = useState<FallScenario | null>(null);
  const [analytics, setAnalytics] = useState<ClassroomAnalytics>(defaultAnalytics);
  const [rules, setRules] = useState<EvaluationRulesResponse["rules"]>([]);
  const [activeCategory, setActiveCategory] = useState<CaseCategory>("chronic");
  const [simulationSessionId, setSimulationSessionId] = useState<string | null>(null);
  const [stepResult, setStepResult] = useState<{ score: number; feedback: string } | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [selectedResource, setSelectedResource] = useState<LearningResource | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ClassroomAnalytics["students"][number] | null>(null);
  const [selectedDimension, setSelectedDimension] = useState<ClassroomAnalytics["dimensions"][number] | null>(null);

  useEffect(() => {
    void Promise.all([
      getOverview().then(setOverview),
      getCases({ category: activeCategory }).then((data) => setCases(data.items)),
      getResources().then((data) => setResources(data.items)),
      getFallScenario().then(setScenario),
      getAnalytics().then(setAnalytics),
      getEvaluationRules().then((data) => setRules(data.rules))
    ]);
  }, [activeCategory]);

  async function handleSimulationOption(stepId: string, optionId: string) {
    if (!scenario) return;
    let sessionId = simulationSessionId;
    if (!sessionId) {
      const created = await createSimulation(scenario.id);
      sessionId = created.sessionId;
      setSimulationSessionId(sessionId);
    }
    const result = await submitSimulationStep(sessionId, stepId, optionId);
    setStepResult({ score: result.stepScore, feedback: result.feedback });
  }

  const shellProps = {
    overview,
    cases,
    resources,
    scenario,
    analytics,
    rules,
    activeCategory,
    stepResult,
    selectedCase,
    selectedResource,
    selectedStudent,
    selectedDimension,
    setActiveCategory,
    setSelectedCase,
    setSelectedResource,
    setSelectedStudent,
    setSelectedDimension,
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
  resources: LearningResource[];
  scenario: FallScenario | null;
  analytics: ClassroomAnalytics;
  rules: EvaluationRulesResponse["rules"];
  activeCategory: CaseCategory;
  stepResult: { score: number; feedback: string } | null;
  selectedCase: CaseRecord | null;
  selectedResource: LearningResource | null;
  selectedStudent: ClassroomAnalytics["students"][number] | null;
  selectedDimension: ClassroomAnalytics["dimensions"][number] | null;
  setActiveCategory: (category: CaseCategory) => void;
  setSelectedCase: (item: CaseRecord) => void;
  setSelectedResource: (item: LearningResource) => void;
  setSelectedStudent: (item: ClassroomAnalytics["students"][number]) => void;
  setSelectedDimension: (item: ClassroomAnalytics["dimensions"][number]) => void;
  handleSimulationOption: (stepId: string, optionId: string) => Promise<void>;
}

function CockpitView(props: ViewProps) {
  return (
    <section className="cockpit-grid">
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

function CasesPage(props: ViewProps) {
  const active = props.selectedCase ?? props.cases[0] ?? null;

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
          <div className="filter-board">
            <TagGroup label="性别" values={["女", "男", "不限"]} />
            <TagGroup label="年龄" values={["55-65", "65-75", "75-85"]} />
            <TagGroup label="身体状况" values={categoryLabels.map((item) => item.label)} />
            <TagGroup label="疾病种类" values={["高血压", "糖尿病", "跌倒风险", "肩颈不适"]} />
          </div>
          <div className="detail-card">
            <strong>{active?.name ?? "等待选择案例"}</strong>
            <span>{active?.summary ?? "教师可在左侧选定案例用于课堂讲解。"}</span>
            {active ? <span>性别 {genderLabels[active.gender]} · 年龄 {active.ageRange} · 状态 {active.condition}</span> : null}
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
  return (
    <ModulePage
      eyebrow="学情分析"
      icon={<BarChart3 size={22} />}
      title="班级能力画像"
      summary="把学生积分、综合能力与安全、质量、时效、规范、沟通等维度聚合成课堂画像，支撑教师课中调整。"
    >
      <div className="module-layout">
        <AnalyticsPanel {...props} />
        <Panel icon={<Activity size={20} />} title="能力雷达数据">
          <div className="ability-grid">
            <Metric label="知识掌握" value={props.analytics.ability.knowledge} />
            <Metric label="实操能力" value={props.analytics.ability.practice} />
            <Metric label="规范程度" value={props.analytics.ability.standardization} />
            <Metric label="协作沟通" value={props.analytics.ability.collaboration} />
          </div>
          <div className="detail-card">
            <strong>{props.selectedStudent?.name ?? "班级整体"}</strong>
            <span>当前均分 {props.overview?.metrics.averageScore ?? 82}，可继续下钻到个人训练记录和错因分析。</span>
          </div>
        </Panel>
      </div>
    </ModulePage>
  );
}

function EvaluationPage(props: ViewProps) {
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
          <div className="rule-grid">
            {props.rules.map((rule) => (
              <div className="rule-item" key={rule.dimension}>
                <span>{rule.label}</span>
                <div><i style={{ width: `${rule.weight * 100}%` }} /></div>
                <strong>{Math.round(rule.weight * 100)}%</strong>
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
  resources,
  selectedResource,
  setSelectedResource
}: ViewProps & { compact?: boolean }) {
  const visibleResources = compact ? resources.slice(0, 4) : resources;

  return (
    <Panel icon={<BookOpen size={20} />} title="测评方法库 / 动作库">
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
      {selectedResource ? <div className="selection-note">操作要点：{selectedResource.keyPoints.join("、")}</div> : null}
    </Panel>
  );
}

function SimulationPanel({ handleSimulationOption, overview, scenario, stepResult }: ViewProps) {
  return (
    <Panel className="simulation-panel" icon={<PlayCircle size={20} />} title="应急处置场景仿真实训">
      <div className="scenario-tabs">
        {(scenario?.steps ?? []).map((step, index) => (
          <button className={index === 0 ? "active" : ""} key={step.id} type="button">
            {step.title}
          </button>
        ))}
      </div>
      <div className="simulation-body">
        <div className="scene-stage">
          <div className="fallen-person" />
        </div>
        <div className="step-list">
          {(scenario?.steps ?? []).slice(0, 5).map((step, index) => (
            <div className="step-row" key={step.id}>
              <b>{index + 1}</b>
              <span>{step.title}</span>
              <strong>{step.options[0]?.score ?? 0}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="option-bank">
        {(scenario?.steps[0]?.options ?? []).map((option) => (
          <button
            className="option-button"
            key={option.id}
            onClick={() => void handleSimulationOption(scenario!.steps[0].id, option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      {stepResult ? (
        <div className="feedback-box">
          <strong>本次得分：{stepResult.score}</strong>
          <span>{stepResult.feedback}</span>
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
  return (
    <Panel icon={<BarChart3 size={20} />} title="学情分析">
      <div className="ability-ring">
        <div>
          {overview?.metrics.averageScore ?? 82}分
          <br />
          综合能力
        </div>
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

function TagGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="tag-group">
      <strong>{label}</strong>
      <div>
        {values.map((value) => (
          <button key={value} type="button">{value}</button>
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
