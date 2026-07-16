/**
 * 周报规范模板库 — 核心护城河
 * 每个模板都基于真实互联网/科技公司的高分周报案例提炼
 * 包含：格式规范、必填字段、常见错误清单、优秀示例
 */

export type TemplateId =
  | "okr-weekly"
  | "agile-sprint"
  | "project-progress"
  | "personal-weekly"
  | "team-lead-weekly"
  | "intern-weekly"
  | "pm-weekly"
  | "dev-weekly"
  | "design-weekly"
  | "sales-weekly";

export interface WeeklyTemplate {
  id: TemplateId;
  name: string;
  description: string;
  tags: string[];
  // 格式规范：每个section的说明和必填要求
  sections: {
    title: string;
    description: string;
    required: boolean;
    placeholder: string;
    // AI生成时的额外指令
    aiInstruction: string;
    // 常见低级错误（质检用）
    commonErrors: string[];
  }[];
  // 整体写作规范
  styleGuide: string;
  // 质检规则
  qualityRules: {
    rule: string;
    severity: "error" | "warning";
    check: string;
  }[];
  // 优秀示例（用于少样本学习）
  examples: {
    role: string;
    content: string;
  }[];
}

export const templates: Record<TemplateId, WeeklyTemplate> = {
  "okr-weekly": {
    id: "okr-weekly",
    name: "OKR周报",
    description: "基于OKR目标管理框架的周进度汇报，适合互联网公司管理层和骨干员工",
    tags: ["互联网", "管理", "目标导向", "高频"],
    sections: [
      {
        title: "本周OKR进展",
        description: "对照OKR逐项汇报本周进度，用数据说话",
        required: true,
        placeholder: "O1: 提升用户留存率\n  KR1: 新增用户7日留存从30%提升到35% → 本周达到32%（+1%）\n  KR2: ...",
        aiInstruction:
          "严格按照OKR格式输出。每个O下面列出KR，每个KR必须包含：当前进度、本周变化、与目标的差距、预计完成时间。用具体数字，禁止模糊表述如'有较大提升'。",
        commonErrors: [
          "用'进展顺利'代替具体数字",
          "OKR和行动计划混淆",
          "进度百分比没有计算依据",
          "缺少与上周的对比",
        ],
      },
      {
        title: "关键成果与亮点",
        description: "本周最重要的1-3个成果，突出价值和影响",
        required: true,
        placeholder: "1. 完成XX功能上线，DAU提升X%\n2. 优化XX流程，效率提升X%",
        aiInstruction:
          "只写1-3条，每条必须包含：做了什么、产生了什么量化结果、对业务/团队的价值。禁止罗列日常琐事。",
        commonErrors: [
          "罗列日常事务（如'参加了3个会议'）",
          "成果没有量化",
          "把别人的成果写成自己的",
        ],
      },
      {
        title: "风险与阻碍",
        description: "当前遇到的困难、需要支持的事项",
        required: true,
        placeholder: "1. XX资源不足，预计影响上线时间X天 → 需要XX支持\n2. ...",
        aiInstruction:
          "每个风险必须包含：问题描述、影响范围、预计后果、需要的支持/资源。禁止只抛问题不给方案。",
        commonErrors: [
          "只说困难不给解决方案",
          "风险描述过于笼统",
          "把个人失误包装成外部原因",
        ],
      },
      {
        title: "下周计划",
        description: "下周重点事项和预期产出",
        required: true,
        placeholder: "1. 完成XX功能开发（预计产出：PRD+原型）\n2. 推进XX项目评审",
        aiInstruction:
          "每条计划必须包含：具体行动、预期产出、与OKR的关联。计划数量控制在3-5条，不要贪多。",
        commonErrors: [
          "计划过于笼统（如'推进项目'）",
          "计划数量超过5条",
          "计划和OKR脱节",
        ],
      },
    ],
    styleGuide:
      "语气专业、数据驱动、结果导向。每个数字必须有依据。禁止空话套话。整体控制在500-800字。",
    qualityRules: [
      { rule: "所有进度必须有具体数字", severity: "error", check: "检查是否有'%'或具体数值" },
      { rule: "禁止'进展顺利'等模糊表述", severity: "error", check: "关键词匹配" },
      { rule: "每条OKR必须和上周有对比", severity: "warning", check: "是否有'上周'或'环比'" },
      { rule: "风险部分必须有解决方案", severity: "error", check: "风险段落是否含'方案'或'需要'" },
      { rule: "总字数控制在500-800字", severity: "warning", check: "字数统计" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `本周OKR进展：
O1: 提升核心功能用户留存率
  KR1: 7日留存从30%→35% → 当前32%（+1% vs上周），预计7月底达成
  KR2: 用户反馈NPS从25→35 → 当前28（+3 vs上周），已上线满意度调研

关键成果：
1. 完成推荐算法A/B测试，实验组留存+2.1%（p<0.05），全量预计下周上线
2. 优化加载速度，首屏时间从2.3s降至1.1s，跳出率下降8%

风险：
1. 全量上线需QA资源，当前排期紧张 → 已与XX协调，预计周三可开始

下周计划：
1. 推动算法全量上线（关联KR1）
2. 启动第二轮用户访谈，目标20人（关联KR2）`,
      },
    ],
  },

  "agile-sprint": {
    id: "agile-sprint",
    name: "敏捷迭代周报",
    description: "Scrum/敏捷开发团队的迭代总结，适合研发团队",
    tags: ["研发", "敏捷", "Scrum", "技术"],
    sections: [
      {
        title: "迭代概览",
        description: "迭代周期、版本号、整体进度",
        required: true,
        placeholder: "迭代S23（6.10-6.21）\n计划故事点：45 | 完成：38 | 完成率：84%",
        aiInstruction:
          "必须包含：迭代编号、起止日期、计划故事点、完成故事点、完成率。完成率=完成/计划，精确到个位数。",
        commonErrors: [
          "缺少故事点数据",
          "完成率计算错误",
          "迭代日期和实际不符",
        ],
      },
      {
        title: "已完成工作",
        description: "本周完成的User Story和任务",
        required: true,
        placeholder: "✅ US-102: 用户登录优化（3pt）\n✅ US-103: 支付流程埋点（5pt）",
        aiInstruction:
          "按优先级排序，每条包含：Story编号、标题、故事点、状态。只列已完成的，不要混入进行中。",
        commonErrors: [
          "把进行中的任务标为完成",
          "故事点前后不一致",
          "缺少Story编号",
        ],
      },
      {
        title: "进行中/阻塞",
        description: "未完成的工作及原因",
        required: true,
        placeholder: "🔄 US-104: 订单导出功能（5pt，进度60%）→ 阻塞：依赖第三方接口文档\n🔄 US-105: ...",
        aiInstruction:
          "进行中任务必须包含：当前进度百分比、预计完成时间、阻塞原因（如有）。",
        commonErrors: [
          "进度百分比没有依据",
          "阻塞原因描述不清",
          "缺少预计完成时间",
        ],
      },
      {
        title: "技术债与质量",
        description: "代码质量、测试覆盖、技术债情况",
        required: false,
        placeholder: "单元测试覆盖率：78%（+2%）\n新增技术债：1项（US-102临时方案需重构）",
        aiInstruction:
          "如有数据则填写，必须真实。禁止隐瞒技术债。",
        commonErrors: [
          "技术债被掩盖",
          "测试覆盖率数据造假",
        ],
      },
      {
        title: "下周迭代计划",
        description: "下周要完成的Story",
        required: true,
        placeholder: "S24计划：\nUS-106: XX功能（8pt）\nUS-107: XX优化（3pt）",
        aiInstruction:
          "列出计划纳入下周迭代的Story，包含编号、标题、故事点。故事点总和应与团队速率匹配。",
        commonErrors: [
          "故事点超过团队速率",
          "计划Story描述不清",
        ],
      },
    ],
    styleGuide:
      "技术团队风格：简洁、数据化、问题透明。用✅🔄❌等符号增加可读性。",
    qualityRules: [
      { rule: "完成率计算必须正确", severity: "error", check: "完成率=完成/计划" },
      { rule: "所有Story必须有编号", severity: "error", check: "是否含'US-'或类似编号" },
      { rule: "进行中任务必须有进度百分比", severity: "warning", check: "是否含'%'" },
      { rule: "技术债不可隐瞒", severity: "error", check: "是否提到技术债或重构" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `迭代S23（6.10-6.21）
计划：45pt | 完成：38pt | 完成率：84% | 目标：85%

已完成：
✅ US-102: 登录页性能优化（3pt）— 首屏1.2s→0.6s
✅ US-103: 支付埋点（5pt）— 覆盖6个关键节点
✅ US-105: 退款接口联调（8pt）— 通过率100%

进行中：
🔄 US-104: 订单导出（5pt，进度60%）→ 阻塞：等法务确认字段，预计周三解

技术债：
⚠️ US-102用了临时缓存方案，S24需重构为正式实现

S24计划（42pt）：
US-106: 导出功能上线（5pt）
US-107: 缓存重构（5pt）
US-108: 首页推荐算法（13pt）`,
      },
    ],
  },

  "project-progress": {
    id: "project-progress",
    name: "项目进度周报",
    description: "跨周项目的中高层进度汇报，适合项目经理和负责人",
    tags: ["项目管理", "跨部门", "汇报"],
    sections: [
      {
        title: "项目概况",
        description: "项目基本信息和整体健康度",
        required: true,
        placeholder: "项目名称：XX平台2.0升级\n当前阶段：开发期（3/5）\n整体进度：60% | 状态：🟢正常",
        aiInstruction:
          "必须包含：项目名称、当前阶段、整体进度百分比、健康状态（🟢正常/🟡预警/🔴风险）。进度百分比要有计算依据。",
        commonErrors: [
          "进度百分比拍脑袋",
          "健康状态和实际风险不匹配",
        ],
      },
      {
        title: "本周完成",
        description: "本周交付的里程碑和产出",
        required: true,
        placeholder: "M3.2: 核心API开发完成 → 已通过内部评审\n交付物：接口文档+Postman集合",
        aiInstruction:
          "按里程碑编号输出，每个完成项包含：里程碑编号、名称、验收状态、交付物清单。",
        commonErrors: [
          "里程碑编号不连续",
          "交付物描述不清",
          "验收状态主观",
        ],
      },
      {
        title: "关键风险",
        description: "影响项目交付的核心风险",
        required: true,
        placeholder: "🔴 风险1：第三方接口延期2周 → 影响联调\n  应对方案：启动Mock方案，并行开发\n  责任人：张三 | 升级日期：6.20",
        aiInstruction:
          "每个风险必须包含：严重程度、描述、影响、应对方案、责任人、升级时间点。禁止隐瞒🔴级风险。",
        commonErrors: [
          "风险等级被压低",
          "没有应对方案",
          "没有责任人",
        ],
      },
      {
        title: "下周重点",
        description: "下周必须完成的里程碑",
        required: true,
        placeholder: "M3.3: 前端联调启动（6.24）\nM3.4: 测试用例评审（6.26）",
        aiInstruction:
          "只列关键里程碑，不超过3个。每个包含：编号、名称、计划日期。",
        commonErrors: [
          "里程碑超过3个",
          "计划日期不合理",
        ],
      },
    ],
    styleGuide:
      "项目管理层风格：全局视角、风险透明、里程碑导向。用RAG（红/黄/绿）标注健康度。",
    qualityRules: [
      { rule: "进度百分比必须有依据", severity: "error", check: "进度是否和里程碑完成情况对应" },
      { rule: "🔴风险不可隐瞒", severity: "error", check: "是否存在被压低风险等级的情况" },
      { rule: "每个风险必须有责任人和方案", severity: "error", check: "风险段落是否含责任人" },
      { rule: "下周里程碑不超过3个", severity: "warning", check: "里程碑数量" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `项目：数据中台2.0
阶段：开发期（3/5）| 进度：62% | 状态：🟡预警

本周完成：
M3.1: 数据清洗模块开发 — ✅ 已自测通过
M3.2: API网关搭建 — ✅ 已通过架构评审
交付物：设计文档+接口定义

关键风险：
🟡 风险：BI团队资源被抽调 → 联调可能延期3天
  方案：申请周末加班，已获PMO批准
  责任人：李四 | 升级：若延期超5天则升级

下周重点：
M3.3: 联调启动（6.24）
M3.4: 性能压测（6.28）`,
      },
    ],
  },

  "personal-weekly": {
    id: "personal-weekly",
    name: "个人工作周报",
    description: "最通用的个人工作周报，适合大多数职场人",
    tags: ["通用", "个人", "高频", "入门"],
    sections: [
      {
        title: "本周工作总结",
        description: "本周完成的主要工作",
        required: true,
        placeholder: "1. 完成XX报告撰写，已提交给XX部门\n2. 参与XX会议，达成XX共识",
        aiInstruction:
          "按重要性排序，3-5条。每条包含：做了什么、结果如何、谁受益。禁止写'日常办公'等无价值内容。",
        commonErrors: [
          "罗列琐事",
          "结果没有量化",
          "写成流水账",
        ],
      },
      {
        title: "数据/成果",
        description: "本周关键数据指标",
        required: false,
        placeholder: "处理工单：45件（目标40件，完成率112%）\n客户满意度：4.6/5.0",
        aiInstruction:
          "如有KPI或量化指标则填写。必须包含：实际值、目标值、完成率。",
        commonErrors: [
          "数据没有对比",
          "完成率计算错误",
        ],
      },
      {
        title: "问题与反思",
        description: "本周遇到的问题和改进思考",
        required: true,
        placeholder: "1. XX流程效率低 → 建议引入XX工具优化\n2. 本周XX决策失误 → 反思：应提前与XX确认",
        aiInstruction:
          "包含问题和对应的反思/改进。展示自我驱动力。禁止只抱怨不给方案。",
        commonErrors: [
          "只抱怨不给方案",
          "反思流于表面",
          "推卸责任",
        ],
      },
      {
        title: "下周工作计划",
        description: "下周要做的事情",
        required: true,
        placeholder: "1. 完成XX项目初稿（截止周三）\n2. 准备XX汇报材料",
        aiInstruction:
          "具体可执行，3-5条。包含完成标准（如有截止时间请标注）。",
        commonErrors: [
          "计划笼统",
          "计划数量过多",
        ],
      },
    ],
    styleGuide:
      "简洁务实、数据说话、有反思有行动。300-500字为宜。",
    qualityRules: [
      { rule: "工作总结不超过5条", severity: "warning", check: "条数统计" },
      { rule: "禁止罗列琐事", severity: "error", check: "是否含'日常'等关键词" },
      { rule: "问题部分必须有改进方案", severity: "error", check: "问题段落是否含'方案'或'建议'" },
      { rule: "字数300-500字", severity: "warning", check: "字数统计" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `本周工作总结：
1. 完成Q2用户调研报告，访谈15位核心用户，输出3个产品改进建议（已同步产品组）
2. 优化客服话术库，新增20条标准回复，平均响应时间缩短15%

数据：
处理工单：45件（目标40件，112%）
一次解决率：82%（+5% vs上月）

问题与反思：
1. 调研中发现用户需求和产品规划有偏差 → 建议建立月度需求对齐会

下周计划：
1. 推动需求对齐会落地（周三前发邀请）
2. 更新FAQ文档（新增5个高频问题）`,
      },
    ],
  },

  "team-lead-weekly": {
    id: "team-lead-weekly",
    name: "团队负责人周报",
    description: "团队Leader向上汇报团队整体情况",
    tags: ["管理", "团队", "Leader"],
    sections: [
      {
        title: "团队整体情况",
        description: "团队人数、状态、氛围",
        required: true,
        placeholder: "团队：8人（本周入职1人：张三，后端）\n整体状态：良好 | 本周加班：2人次",
        aiInstruction:
          "包含：团队规模变化、整体状态、异常情况（如离职、加班、请假）。",
        commonErrors: [
          "隐瞒人员变动",
          "状态描述过于笼统",
        ],
      },
      {
        title: "重点工作进展",
        description: "团队重点项目进度",
        required: true,
        placeholder: "项目A（负责人：李四）：进度70% → 完成XX模块\n项目B（负责人：王五）：进度40% → 遇到XX问题",
        aiInstruction:
          "按项目列出，包含：项目名称、负责人、进度、本周进展。",
        commonErrors: [
          "进度拍脑袋",
          "进展描述不清",
        ],
      },
      {
        title: "人员与培养",
        description: "团队成员成长、绩效、问题",
        required: false,
        placeholder: "张三：本周独立完成首个feature，表现优秀\n李四：代码质量下滑，已1v1沟通改进计划",
        aiInstruction:
          "如有则写，每人1-2句话。表扬要具体，问题要有跟进动作。",
        commonErrors: [
          "评价过于笼统",
          "有问题没跟进动作",
        ],
      },
      {
        title: "需要的支持",
        description: "向上级申请的资源和决策",
        required: true,
        placeholder: "1. 申请增加1名测试，项目A联调人手不足\n2. 确认Q3预算分配方案",
        aiInstruction:
          "具体、可决策。每条包含：需要什么、为什么、不解决的影响。",
        commonErrors: [
          "需求不清晰",
          "没有说明不解决的影响",
        ],
      },
    ],
    styleGuide:
      "管理层视角：全局、人员、资源。信息要全，但不啰嗦。",
    qualityRules: [
      { rule: "人员变动必须如实汇报", severity: "error", check: "是否含人员变动信息" },
      { rule: "项目进度要有依据", severity: "error", check: "进度是否和交付物对应" },
      { rule: "需要支持必须说明不解决的影响", severity: "warning", check: "支持请求是否含影响描述" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `团队：8人（本周入职：张三，后端）
状态：良好

重点工作：
项目A（李四）：70% → 完成核心API开发，下周联调
项目B（王五）：40% → 需求变更导致延期2天，已调整计划

人员：
张三：入职第1周，已熟悉代码规范，下周分配独立任务

支持需求：
1. 申请增加1名QA，联调期人力不足 → 影响：可能延期1周上线`,
      },
    ],
  },

  "intern-weekly": {
    id: "intern-weekly",
    name: "实习生周报",
    description: "实习生向 mentor/主管汇报学习和工作进展",
    tags: ["实习", "新人", "学习"],
    sections: [
      {
        title: "本周学习内容",
        description: "本周学到的新知识、技能",
        required: true,
        placeholder: "1. 学习了XX框架的XX特性，完成了练习项目\n2. 阅读了XX文档，理解了XX原理",
        aiInstruction:
          "体现学习主动性。包含：学了什么、通过什么方式、产出什么。",
        commonErrors: [
          "只写'学习了XX'没有产出",
          "学习内容和工作无关",
        ],
      },
      {
        title: "本周工作任务",
        description: "本周参与的实际工作",
        required: true,
        placeholder: "1. 协助完成XX功能的测试用例编写（10条）\n2. 修复了XX bug（PR已合并）",
        aiInstruction:
          "即使是很小的任务也要写。包含：任务内容、你的角色、产出。",
        commonErrors: [
          "觉得任务太小不写",
          "没有说明自己的角色",
        ],
      },
      {
        title: "遇到的问题与解决",
        description: "本周遇到的困难和如何解决的",
        required: true,
        placeholder: "1. 问题：XX环境配置报错\n   解决：查阅文档+请教 mentor，发现是XX版本不兼容",
        aiInstruction:
          "展示问题解决能力。包含：问题、尝试过的方法、最终方案、学到的经验。",
        commonErrors: [
          "只说问题不说解决过程",
          "没有总结经验",
        ],
      },
      {
        title: "下周计划",
        description: "下周学习和工作目标",
        required: true,
        placeholder: "1. 独立完成XX小功能开发\n2. 学习XX进阶内容",
        aiInstruction:
          "目标要有一定挑战性但可实现。",
        commonErrors: [
          "目标过于保守",
          "目标不切实际",
        ],
      },
    ],
    styleGuide:
      "学习导向、态度积极、展示成长。导师喜欢看到'遇到问题但主动解决了'。",
    qualityRules: [
      { rule: "学习内容必须有产出", severity: "warning", check: "学习段落是否含产出" },
      { rule: "问题部分必须有解决过程", severity: "error", check: "问题段落是否含解决方法" },
      { rule: "态度要积极", severity: "warning", check: "整体语气是否积极" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `本周学习：
1. 学习了React Hooks深入用法，完成TODO应用重构（使用useReducer+useContext）

本周任务：
1. 协助编写订单模块测试用例12条，全部通过
2. 修复支付页样式bug（PR #234，已合并）

问题与解决：
1. 问题：本地接口一直报错502
   解决：查日志发现VPN配置问题，按文档重新配置后正常。总结：遇到网络问题先看代理配置

下周计划：
1. 独立开发个人中心页面（预计3天）
2. 学习TypeScript泛型`,
      },
    ],
  },

  "pm-weekly": {
    id: "pm-weekly",
    name: "产品经理周报",
    description: "产品经理的需求、数据、跨部门协调进展",
    tags: ["产品", "PM", "数据驱动"],
    sections: [
      {
        title: "需求进展",
        description: "本周推进的需求状态",
        required: true,
        placeholder: "需求A（PRD已评审）→ 进入开发排期\n需求B（原型设计中）→ 待用户调研确认",
        aiInstruction:
          "按需求列出，包含：需求名称、当前阶段、下一步动作、阻塞（如有）。",
        commonErrors: [
          "阶段描述不清",
          "下一步动作不明确",
        ],
      },
      {
        title: "数据洞察",
        description: "本周关键产品数据变化",
        required: true,
        placeholder: "DAU：12.5万（+3% vs上周）\n转化率：2.1%（-0.2%）→ 排查中：发现XX环节流失增加",
        aiInstruction:
          "核心指标+变化+原因分析。数据必须有来源。不能只报喜不报忧。",
        commonErrors: [
          "数据没来源",
          "只报涨不报跌",
          "变化没有原因分析",
        ],
      },
      {
        title: "用户反馈",
        description: "本周收集到的重要用户反馈",
        required: false,
        placeholder: "Top反馈：\n1. XX功能找不到入口（5条）→ 已排期优化导航\n2. XX流程太复杂（3条）→ 纳入Q3体验优化",
        aiInstruction:
          "按频次排序，包含：反馈内容、出现频次、处理动作。",
        commonErrors: [
          "反馈没有量化",
          "没有处理动作",
        ],
      },
      {
        title: "跨部门协调",
        description: "与其他团队的协作事项",
        required: false,
        placeholder: "技术团队：确认XX需求可行，排期S24\n运营团队：联合活动方案已对齐，下周启动",
        aiInstruction:
          "如有跨团队事项则写。包含：协作对象、事项、共识、下一步。",
        commonErrors: [
          "协作事项没有结论",
          "下一步不明确",
        ],
      },
    ],
    styleGuide:
      "产品思维：数据驱动、用户导向、推动落地。每个结论都要有数据支撑。",
    qualityRules: [
      { rule: "数据必须有来源", severity: "error", check: "数据是否和指标平台对应" },
      { rule: "下跌指标必须说明原因", severity: "error", check: "下跌数据是否有原因分析" },
      { rule: "需求必须有下一步动作", severity: "error", check: "需求段落是否含下一步" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `需求进展：
PR-102: 智能推荐 → PRD已评审通过，开发排期S24
PR-103: 搜索优化 → 原型设计中，待周五用户访谈确认

数据：
DAU: 12.5万 (+3%)
转化率: 2.1% (-0.2%) → 原因：支付页加载慢，已提优化需求

用户反馈：
1. 找不到收藏入口（6条）→ 已排期在导航增加收藏图标

跨部门：
技术：确认推荐算法方案，需额外2周\n运营：联合活动方案对齐，下周启动`,
      },
    ],
  },

  "dev-weekly": {
    id: "dev-weekly",
    name: "开发工程师周报",
    description: "研发人员的技术进展和代码产出",
    tags: ["研发", "技术", "工程师"],
    sections: [
      {
        title: "本周开发内容",
        description: "本周完成的代码和开发任务",
        required: true,
        placeholder: "1. 完成XX模块核心逻辑开发（PR #123，已合并）\n2. 重构XX工具函数，减少重复代码30%",
        aiInstruction:
          "技术细节要具体。包含：做了什么、技术方案、代码量（如有）、PR链接。",
        commonErrors: [
          "技术描述太笼统",
          "没有代码量或影响范围",
        ],
      },
      {
        title: "代码质量",
        description: "测试覆盖、Code Review情况",
        required: false,
        placeholder: "提交PR：3个 | 合并：3个 | Review他人：5个\n测试覆盖率：82%（+3%）",
        aiInstruction:
          "如有数据则填写。体现对代码质量的重视。",
        commonErrors: [
          "覆盖率数据造假",
        ],
      },
      {
        title: "技术难点与解决",
        description: "本周遇到的技术挑战",
        required: true,
        placeholder: "1. 难点：XX场景性能瓶颈（响应3s）\n   方案：引入缓存+异步处理，优化后300ms\n   文档：已写技术方案文档",
        aiInstruction:
          "展示技术深度。包含：问题、方案、效果、文档沉淀。",
        commonErrors: [
          "问题描述不清",
          "没有量化效果",
          "没有文档沉淀",
        ],
      },
      {
        title: "下周计划",
        description: "下周开发任务",
        required: true,
        placeholder: "1. 完成XX接口联调（预计3天）\n2. 输出XX模块技术文档",
        aiInstruction:
          "具体可执行。包含任务和预计工时。",
        commonErrors: [
          "计划过于笼统",
          "工时估算不合理",
        ],
      },
    ],
    styleGuide:
      "技术风格：细节、数据、沉淀。展示技术影响力。",
    qualityRules: [
      { rule: "技术方案必须具体", severity: "error", check: "是否有技术细节" },
      { rule: "优化必须有量化效果", severity: "warning", check: "是否有性能数字对比" },
      { rule: "技术难点必须有文档沉淀", severity: "warning", check: "是否提到文档" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `本周开发：
1. 完成订单搜索功能（PR #345）
   技术点：Elasticsearch + 分页优化
   效果：搜索响应从800ms→120ms

技术难点：
1. ES分页深翻页性能问题
   方案：改用search_after，支持百万级数据
   文档：已写《ES深分页方案》分享至团队

下周：
1. 联调支付接口（3天）
2. 压测准备`,
      },
    ],
  },

  "design-weekly": {
    id: "design-weekly",
    name: "设计师周报",
    description: "UI/UX设计师的设计产出和用研进展",
    tags: ["设计", "UI/UX", "创意"],
    sections: [
      {
        title: "本周设计产出",
        description: "本周完成的设计稿和交付物",
        required: true,
        placeholder: "1. XX功能UI设计稿（Figma链接）→ 已评审通过\n2. XX页面交互优化 → 已交付开发",
        aiInstruction:
          "包含：设计内容、工具、状态、相关链接。",
        commonErrors: [
          "没有设计链接",
          "状态描述不清",
        ],
      },
      {
        title: "设计决策",
        description: "本周重要的设计选择和理由",
        required: true,
        placeholder: "1. 将XX按钮从底部移至顶部\n   理由：用户热图显示底部点击率仅3%，顶部15%",
        aiInstruction:
          "设计必须有依据。包含：决策、理由（数据/用户反馈/竞品分析）。",
        commonErrors: [
          "设计决策没有依据",
          "凭感觉设计",
        ],
      },
      {
        title: "用户反馈",
        description: "设计相关的用户反馈",
        required: false,
        placeholder: "1. 用户测试发现XX流程困惑度高（5/8人卡住）\n   改进：增加引导步骤",
        aiInstruction:
          "如有用研则写。包含：测试方法、发现、改进方案。",
        commonErrors: [
          "反馈没有测试方法说明",
          "改进方案不明确",
        ],
      },
    ],
    styleGuide:
      "设计思维：用户驱动、数据支撑、迭代优化。",
    qualityRules: [
      { rule: "设计决策必须有依据", severity: "error", check: "决策是否含理由" },
      { rule: "产出必须有链接或附件", severity: "warning", check: "是否含链接" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `本周产出：
1. 个人中心 redesign（Figma）→ 已评审，待开发
2. 空状态插画 5张 → 已交付

设计决策：
1. 将筛选器从弹窗改为底部固定栏
   理由：用户测试显示弹窗误触率40%，底部栏更易操作

用户反馈：
1. 测试发现新用户不理解XX图标含义（6/8人）
   改进：增加文字标签`,
      },
    ],
  },

  "sales-weekly": {
    id: "sales-weekly",
    name: "销售/客户成功周报",
    description: "销售人员的业绩、客户进展和Pipeline更新",
    tags: ["销售", "客户", "业绩"],
    sections: [
      {
        title: "本周业绩",
        description: "本周签约金额、订单数等核心指标",
        required: true,
        placeholder: "签约金额：50万（目标40万，完成率125%）\n新签客户：3家 | 续约：2家",
        aiInstruction:
          "核心业绩数据必须包含：实际、目标、完成率。不能只写绝对值。",
        commonErrors: [
          "只写金额不写完成率",
          "数据没有和上月/季度对比",
        ],
      },
      {
        title: "重点客户进展",
        description: "大客户/重点商机推进情况",
        required: true,
        placeholder: "客户A（预计50万）：本周完成POC，下周商务谈判\n客户B（预计30万）：合同审核中，预计下周签",
        aiInstruction:
          "按金额排序。包含：客户名、预计金额、当前阶段、下一步、预计签约时间。",
        commonErrors: [
          "阶段描述不清",
          "没有预计签约时间",
        ],
      },
      {
        title: "市场/竞争信息",
        description: "客户提到的竞品、市场变化",
        required: false,
        placeholder: "1. 2个客户提到XX竞品价格更低 → 已反馈产品部\n2. XX行业需求上升，建议加大投放",
        aiInstruction:
          "有价值的市场情报。包含：信息、影响、建议动作。",
        commonErrors: [
          "信息没有跟进动作",
        ],
      },
      {
        title: "下周重点",
        description: "下周要推进的客户和目标",
        required: true,
        placeholder: "1. 客户A商务谈判（目标：签约）\n2. 客户C方案演示（目标：进入POC）",
        aiInstruction:
          "每条包含：客户、目标动作、期望结果。",
        commonErrors: [
          "目标不具体",
        ],
      },
    ],
    styleGuide:
      "结果导向：数字说话、客户驱动、Pipeline清晰。",
    qualityRules: [
      { rule: "业绩必须有完成率", severity: "error", check: "是否含完成率" },
      { rule: "客户必须有预计金额", severity: "warning", check: "客户是否含金额" },
      { rule: "客户必须有预计签约时间", severity: "warning", check: "是否含时间" },
    ],
    examples: [
      {
        role: "优秀示例",
        content: `本周业绩：
签约：50万（目标40万，125%）
新签：3家 | 续约：2家

重点客户：
客户A（50万）：POC通过，下周三商务谈判
客户B（30万）：合同审核中，预计周五签

市场信息：
2个客户反馈XX竞品价格低20% → 已反馈产品部，建议推出差异化方案

下周：
1. 客户A谈判（目标签约）
2. 客户C演示（目标进入POC）`,
      },
    ],
  },
};

export const templateList = Object.values(templates);

export function getTemplate(id: TemplateId): WeeklyTemplate | undefined {
  return templates[id];
}

export function getDefaultTemplate(): WeeklyTemplate {
  return templates["personal-weekly"];
}
