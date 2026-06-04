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
  }
};
