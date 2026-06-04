import type {
  CaseRecord,
  EvaluationRule,
  LearningResource,
  SimulationScenario,
  StudentProfile
} from "@smart-care/shared";

export const cases: CaseRecord[] = [
  {
    id: "case-001",
    category: "healthy",
    name: "健康步态案例",
    gender: "female",
    ageRange: "65-75",
    condition: "健康",
    diseases: [],
    tags: ["步态", "平衡"],
    summary: "日常活动能力良好，适合课堂进行基础步态观察。"
  },
  {
    id: "case-002",
    category: "healthy",
    name: "社区健身参与案例",
    gender: "male",
    ageRange: "60-70",
    condition: "健康",
    diseases: [],
    tags: ["体适能", "运动处方"],
    summary: "每周规律运动，可用于训练计划制定。"
  },
  {
    id: "case-003",
    category: "subhealthy",
    name: "肩颈不适亚健康案例",
    gender: "female",
    ageRange: "55-65",
    condition: "亚健康",
    diseases: [],
    tags: ["肩颈", "疲劳"],
    summary: "长期伏案后肩颈紧张，适合动作库资源筛选。"
  },
  {
    id: "case-004",
    category: "subhealthy",
    name: "睡眠质量下降案例",
    gender: "male",
    ageRange: "65-75",
    condition: "亚健康",
    diseases: [],
    tags: ["睡眠", "心理"],
    summary: "睡眠质量下降但无明确慢性病诊断。"
  },
  {
    id: "case-005",
    category: "chronic",
    name: "高血压跌倒风险",
    gender: "male",
    ageRange: "75-85",
    condition: "慢性病",
    diseases: ["高血压"],
    tags: ["跌倒", "应急"],
    summary: "服用降压药后偶发头晕，居家跌倒风险较高。"
  },
  {
    id: "case-006",
    category: "chronic",
    name: "糖尿病足部护理案例",
    gender: "female",
    ageRange: "70-80",
    condition: "慢性病",
    diseases: ["糖尿病"],
    tags: ["足部", "护理"],
    summary: "血糖控制不稳定，需要足部风险评估与健康教育。"
  }
];

export const resources: LearningResource[] = [
  {
    id: "resource-001",
    type: "assessment",
    title: "平衡能力测评",
    bodyPart: "下肢",
    difficulty: "medium",
    audience: "老年人",
    equipment: "秒表",
    mediaUrl: "/media/balance.mp4",
    keyPoints: ["站立前确认地面防滑", "记录完成时间", "观察躯干晃动"],
    cautions: ["教师需站在保护位", "不适时立即停止"]
  },
  {
    id: "resource-002",
    type: "assessment",
    title: "步态观察",
    bodyPart: "下肢",
    difficulty: "easy",
    audience: "老年人",
    equipment: "标志线",
    mediaUrl: "/media/gait.mp4",
    keyPoints: ["观察步幅和步速", "记录左右差异"],
    cautions: ["保持通道清空"]
  },
  {
    id: "resource-003",
    type: "exercise",
    title: "肩颈放松训练",
    bodyPart: "肩颈",
    difficulty: "easy",
    audience: "亚健康",
    equipment: "无",
    mediaUrl: "/media/neck.mp4",
    keyPoints: ["动作缓慢", "配合呼吸"],
    cautions: ["避免过度后伸"]
  },
  {
    id: "resource-004",
    type: "exercise",
    title: "弹力带抗阻训练",
    bodyPart: "上肢",
    difficulty: "medium",
    audience: "慢性病稳定期",
    equipment: "弹力带",
    mediaUrl: "/media/band.mp4",
    keyPoints: ["保持腕部中立", "控制回放速度"],
    cautions: ["血压异常时暂停"]
  }
];

export const students: StudentProfile[] = [
  { id: "student-001", name: "沈峥宇", avatar: "/avatars/student-001.png", points: 1100, className: "智慧康养2301班" },
  { id: "student-002", name: "周雨洁", avatar: "/avatars/student-002.png", points: 1050, className: "智慧康养2301班" },
  { id: "student-003", name: "李俊杰", avatar: "/avatars/student-003.png", points: 1000, className: "智慧康养2301班" },
  { id: "student-004", name: "王悦", avatar: "/avatars/student-004.png", points: 960, className: "智慧康养2301班" }
];

export const evaluationRules: EvaluationRule[] = [
  { dimension: "safety", label: "安全", weight: 0.3 },
  { dimension: "quality", label: "质量", weight: 0.22 },
  { dimension: "timeliness", label: "时效", weight: 0.16 },
  { dimension: "standardization", label: "规范", weight: 0.2 },
  { dimension: "communication", label: "沟通", weight: 0.12 }
];

export const evaluationLevels = [
  { name: "优秀", minScore: 90, description: "流程完整，关键风险判断准确，可作为课堂示范。" },
  { name: "良好", minScore: 80, description: "主要步骤完成，存在少量细节遗漏。" },
  { name: "合格", minScore: 70, description: "能完成基础处置，但需要教师提醒关键节点。" },
  { name: "待提升", minScore: 0, description: "关键步骤缺失，需要课后复训和个别辅导。" }
];

export const deductionRules = [
  {
    id: "deduct-environment",
    step: "判断环境危险源",
    dimension: "safety",
    mistake: "未先排除危险源",
    deduction: 16,
    suggestion: "进入处置前先观察湿滑、障碍物、电源等二次风险。"
  },
  {
    id: "deduct-consciousness",
    step: "判断意识状态",
    dimension: "quality",
    mistake: "跳过意识判断",
    deduction: 16,
    suggestion: "通过呼唤、观察反应判断意识状态后再进入下一步。"
  },
  {
    id: "deduct-transfer",
    step: "呼救与转运决策",
    dimension: "timeliness",
    mistake: "延误呼救或等待课堂结束",
    deduction: 18,
    suggestion: "疑似骨折、出血或意识异常时及时呼叫急救。"
  }
];

export const fallScenario: SimulationScenario = {
  id: "fall-response",
  title: "老年人跌倒应急处置",
  steps: [
    {
      id: "environment",
      title: "判断环境危险源",
      dimension: "safety",
      options: [
        {
          id: "check-danger",
          label: "先排除湿滑、障碍物等危险源",
          score: 20,
          feedback: "能先排除湿滑、障碍物等危险源。"
        },
        {
          id: "lift-now",
          label: "立即扶起老人",
          score: 4,
          feedback: "未先判断风险，可能造成二次伤害。"
        }
      ]
    },
    {
      id: "consciousness",
      title: "判断意识状态",
      dimension: "quality",
      options: [
        {
          id: "ask-response",
          label: "呼唤并观察意识反应",
          score: 18,
          feedback: "能正确判断意识反应。"
        },
        {
          id: "skip-check",
          label: "跳过意识判断",
          score: 2,
          feedback: "缺少关键评估。"
        }
      ]
    },
    {
      id: "pain",
      title: "询问疼痛与禁忌",
      dimension: "communication",
      options: [
        {
          id: "ask-pain",
          label: "询问疼痛部位和既往病史",
          score: 16,
          feedback: "沟通信息完整。"
        },
        {
          id: "move-limb",
          label: "直接活动患肢",
          score: 3,
          feedback: "可能加重损伤。"
        }
      ]
    },
    {
      id: "vitals",
      title: "检查生命体征",
      dimension: "standardization",
      options: [
        {
          id: "check-vitals",
          label: "检查呼吸、脉搏、面色和出血",
          score: 18,
          feedback: "检查项目较完整。"
        },
        {
          id: "only-ask",
          label: "仅询问是否舒服",
          score: 6,
          feedback: "评估不够规范。"
        }
      ]
    },
    {
      id: "transfer",
      title: "呼救与转运决策",
      dimension: "timeliness",
      options: [
        {
          id: "call-120",
          label: "疑似骨折或意识异常时呼叫急救",
          score: 18,
          feedback: "转运决策及时。"
        },
        {
          id: "wait-class",
          label: "等待课堂结束后处理",
          score: 0,
          feedback: "延误处置。"
        }
      ]
    }
  ]
};

export const analytics = {
  metrics: {
    completionRate: 0.86,
    simulationCount: 128,
    activeStudentCount: 38,
    weakStepCount: 3
  },
  students: [
    {
      id: "student-001",
      name: "沈峥宇",
      points: 1100,
      completionRate: 0.96,
      averageScore: 90,
      latestSimulation: { title: "跌倒处置流程", score: 90, date: "2026-06-04" }
    },
    {
      id: "student-002",
      name: "周雨洁",
      points: 1050,
      completionRate: 0.91,
      averageScore: 86,
      latestSimulation: { title: "平衡能力测评", score: 88, date: "2026-06-03" }
    },
    {
      id: "student-003",
      name: "李俊杰",
      points: 1000,
      completionRate: 0.84,
      averageScore: 80,
      latestSimulation: { title: "步态观察", score: 82, date: "2026-06-02" }
    },
    {
      id: "student-004",
      name: "王悦",
      points: 960,
      completionRate: 0.78,
      averageScore: 76,
      latestSimulation: { title: "跌倒处置流程", score: 74, date: "2026-06-01" }
    }
  ],
  dimensions: [
    { label: "安全", score: 92 },
    { label: "质量", score: 85 },
    { label: "时效", score: 76 },
    { label: "规范", score: 88 },
    { label: "沟通", score: 84 }
  ],
  ability: {
    knowledge: 86,
    practice: 78,
    standardization: 91,
    collaboration: 82
  },
  trends: [
    { date: "06-01", score: 76 },
    { date: "06-02", score: 79 },
    { date: "06-03", score: 82 },
    { date: "06-04", score: 86 }
  ],
  weakSteps: [
    {
      step: "呼救与转运决策",
      mistakeRate: 0.31,
      suggestion: "加强疑似骨折、意识异常时的呼救判断。"
    },
    {
      step: "检查生命体征",
      mistakeRate: 0.24,
      suggestion: "复训呼吸、脉搏、面色和出血检查顺序。"
    },
    {
      step: "询问疼痛与禁忌",
      mistakeRate: 0.18,
      suggestion: "增加沟通话术和禁忌动作辨析。"
    }
  ],
  recommendations: [
    {
      title: "跌倒处置复盘案例",
      target: "呼救转运薄弱学生",
      reason: "匹配当前最高错因步骤，可用于课后分层练习。"
    },
    {
      title: "生命体征检查微课",
      target: "规范程度待提升学生",
      reason: "强化检查顺序与记录规范。"
    }
  ]
};
