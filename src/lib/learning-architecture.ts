export interface LearningLayer {
  id: "LEARN" | "APPLY" | "ENGAGE_LIVE" | "SHOW_PROGRESS";
  purpose: string;
  typicalComponents: string[];
}

export interface ProductHierarchyNode {
  level:
    | "PROGRAMME"
    | "LEVEL"
    | "CYCLE_TERM"
    | "MODULE"
    | "LESSON"
    | "ACTIVITY"
    | "LIVE_SESSION"
    | "ASSESSMENT"
    | "PROJECT_SHOWCASE"
    | "BADGE_CERTIFICATE";
  function: string;
}

export interface SubscriptionMode {
  mode: "INDIVIDUAL" | "SCHOOL" | "INSTITUTIONAL_UNIVERSITY";
  primaryUser: string;
  requiredFeatures: string[];
}

export interface WeeklyRhythmStage {
  stage: "MONDAY_LEARN" | "TUESDAY_PRACTICE" | "MIDWEEK_LIVE" | "FRIDAY_ASSESS" | "WEEKEND_REINFORCE";
  dayLabel: string;
  learnerExperience: string;
  systemFunction: string;
}

export interface CurriculumLevelFramework {
  level: "PRIMARY" | "JUNIOR_SECONDARY" | "SENIOR_SECONDARY" | "IMPACTUNI";
  ageGroup: string;
  primaryOutcome: string;
  signatureShift: string;
}

export interface TermFocus {
  term: string;
  focus: string;
  illustrativeTopics: string[];
}

export interface LevelStructure {
  level: "PRIMARY" | "JUNIOR_SECONDARY";
  ageGroup: string;
  purpose: string;
  coreOutcomes: string[];
  curriculumStrands: string[];
  termStructure: TermFocus[];
  signatureExperiences: string[];
  liveClassroomFormat: string;
}

export interface LearningArchitecturePayload {
  learningLayers: LearningLayer[];
  productHierarchy: ProductHierarchyNode[];
  recommendedCmsFields: string[];
  subscriptionModes: SubscriptionMode[];
  deliveryBlend: {
    selfPacedPercent: number;
    liveClassPercent: number;
    projectAndCommunityPercent: number;
  };
  weeklyClassroomRhythm: WeeklyRhythmStage[];
  dashboardRequirements: {
    learner: string[];
    schoolParentAdmin: string[];
  };
  fourLevelCurriculumFramework: CurriculumLevelFramework[];
  levelStructures: LevelStructure[];
}

export const LEARNING_ARCHITECTURE: LearningArchitecturePayload = {
  learningLayers: [
    {
      id: "LEARN",
      purpose: "Introduce concepts clearly in short structured units.",
      typicalComponents: ["Video lessons", "Story cards", "Explainers", "Readings", "Guided notes"],
    },
    {
      id: "APPLY",
      purpose: "Turn ideas into action through tasks and templates.",
      typicalComponents: ["Worksheets", "Journals", "Mini assignments", "Business tasks", "Reflection prompts"],
    },
    {
      id: "ENGAGE_LIVE",
      purpose: "Deepen learning through human interaction and guided practice.",
      typicalComponents: ["Facilitator-led classes", "Q&A", "Breakout sessions", "Simulations", "Clinics"],
    },
    {
      id: "SHOW_PROGRESS",
      purpose: "Make growth visible and motivating.",
      typicalComponents: ["Badges", "Attendance", "Scores", "Certificates", "Project showcases", "Learner portfolio"],
    },
  ],
  productHierarchy: [
    { level: "PROGRAMME", function: "ImpactSchool or ImpactUni" },
    { level: "LEVEL", function: "Primary, Junior Secondary, Senior Secondary, ImpactUni" },
    { level: "CYCLE_TERM", function: "Time-bound learning period within a level" },
    { level: "MODULE", function: "Cluster of lessons around a topic or competency" },
    { level: "LESSON", function: "Single content item or guided learning experience" },
    { level: "ACTIVITY", function: "Worksheet, task, quiz, reflection, or mini challenge" },
    { level: "LIVE_SESSION", function: "Scheduled facilitator-led classroom engagement" },
    { level: "ASSESSMENT", function: "Quiz, rubric task, project score, or attendance benchmark" },
    { level: "PROJECT_SHOWCASE", function: "Applied evidence of learning" },
    { level: "BADGE_CERTIFICATE", function: "Recognition triggered by performance or completion rules" },
  ],
  recommendedCmsFields: [
    "Title and short description",
    "Programme and level",
    "Age band",
    "Subject strand",
    "Term or cycle and module number",
    "Lesson type",
    "Learning objectives",
    "Core content body",
    "Facilitator notes",
    "Learner instructions",
    "Downloadable resources and worksheets",
    "Quiz items and answer rules",
    "Assignment submission type",
    "Live session reference and replay link",
    "Assessment weighting",
    "Badge trigger and certificate rule",
    "Prerequisite content",
    "Completion status",
  ],
  subscriptionModes: [
    {
      mode: "INDIVIDUAL",
      primaryUser: "Parent or learner",
      requiredFeatures: [
        "Personal dashboard",
        "Level access",
        "Live class booking",
        "Progress tracking",
        "Certificates",
      ],
    },
    {
      mode: "SCHOOL",
      primaryUser: "School admin, teachers, and students",
      requiredFeatures: [
        "Cohort management",
        "Attendance",
        "Reporting",
        "School dashboard",
        "Facilitator scheduling",
      ],
    },
    {
      mode: "INSTITUTIONAL_UNIVERSITY",
      primaryUser: "Campus, department, student network, partner institution",
      requiredFeatures: [
        "Cohort enrolment",
        "Advanced live sessions",
        "ImpactUni studio delivery",
        "Exportable reporting",
      ],
    },
  ],
  deliveryBlend: {
    selfPacedPercent: 60,
    liveClassPercent: 25,
    projectAndCommunityPercent: 15,
  },
  weeklyClassroomRhythm: [
    {
      stage: "MONDAY_LEARN",
      dayLabel: "Monday - Learn",
      learnerExperience: "New lesson content is released.",
      systemFunction: "Unlock module materials and notify learners.",
    },
    {
      stage: "TUESDAY_PRACTICE",
      dayLabel: "Tuesday - Practice",
      learnerExperience: "Learners complete worksheet, reflection, or practical task.",
      systemFunction: "Track submission or draft status.",
    },
    {
      stage: "MIDWEEK_LIVE",
      dayLabel: "Wednesday or Thursday - Live",
      learnerExperience: "Facilitator-led class deepens the topic.",
      systemFunction: "Capture attendance, polls, breakouts, and replay.",
    },
    {
      stage: "FRIDAY_ASSESS",
      dayLabel: "Friday - Assess",
      learnerExperience: "Quiz, short test, journal, or rubric challenge.",
      systemFunction: "Score and update progress dashboard.",
    },
    {
      stage: "WEEKEND_REINFORCE",
      dayLabel: "Weekend - Reinforce",
      learnerExperience: "Replay, peer challenge, family prompt, or extension activity.",
      systemFunction: "Maintain retention and continuous engagement.",
    },
  ],
  dashboardRequirements: {
    learner: [
      "Current programme and level",
      "Current term, module, and next lesson",
      "Next live classroom session",
      "Progress percentage and completion streak",
      "Badges earned and certificate status",
      "Unfinished activities and deadlines",
      "Project portfolio and showcase entries",
      "Announcements and cohort updates",
    ],
    schoolParentAdmin: [
      "Cohort attendance",
      "Assignment completion",
      "Behavioural and values-based recognition",
      "Monthly progress summaries",
    ],
  },
  fourLevelCurriculumFramework: [
    {
      level: "PRIMARY",
      ageGroup: "7-11",
      primaryOutcome: "Habit formation",
      signatureShift: "From awareness to healthy daily money, behaviour, and teamwork habits",
    },
    {
      level: "JUNIOR_SECONDARY",
      ageGroup: "12-14",
      primaryOutcome: "Practical application",
      signatureShift: "From understanding to budgeting, recording, and simple enterprise practice",
    },
    {
      level: "SENIOR_SECONDARY",
      ageGroup: "15-18",
      primaryOutcome: "Enterprise readiness",
      signatureShift: "From business ideas to planning, projections, pitching, and investment awareness",
    },
    {
      level: "IMPACTUNI",
      ageGroup: "18+",
      primaryOutcome: "Execution and capital awareness",
      signatureShift: "From readiness to venture building, employability, and institutional engagement",
    },
  ],
  levelStructures: [
    {
      level: "PRIMARY",
      ageGroup: "7-11",
      purpose: "Build habits, values, awareness, and confidence.",
      coreOutcomes: [
        "Distinguish needs from wants",
        "Understand saving before spending",
        "Recognise simple buying and selling ideas",
        "Show honesty, responsibility, respect, and fairness",
        "Work with others and take simple initiative",
      ],
      curriculumStrands: [
        "My Money Habits",
        "My Ideas and Small Business Thinking",
        "My Leadership Habits",
        "My Values and Community",
      ],
      termStructure: [
        {
          term: "Term 1",
          focus: "Money and Choices",
          illustrativeTopics: [
            "Needs vs wants",
            "What money is",
            "Saving before spending",
            "Delayed gratification",
            "Planning small spending choices",
          ],
        },
        {
          term: "Term 2",
          focus: "Ideas, Work, and Value",
          illustrativeTopics: [
            "What a business is",
            "Goods and services",
            "Solving simple problems",
            "Customer basics",
            "Honesty in selling",
          ],
        },
        {
          term: "Term 3",
          focus: "Leadership and Civil Values",
          illustrativeTopics: [
            "Confidence",
            "Respect",
            "Kindness",
            "Responsibility",
            "Doing the right thing",
            "Community helper project",
          ],
        },
      ],
      signatureExperiences: [
        "Class savings challenge",
        "Mini market day",
        "Story-based ethics circle",
        "Young leader recognition",
        "Family discussion prompt",
      ],
      liveClassroomFormat:
        "One live class per week, 45 minutes, visual and highly interactive with polls, role play, guided discussion, and simple practical prompts.",
    },
    {
      level: "JUNIOR_SECONDARY",
      ageGroup: "12-14",
      purpose: "Build practical financial and enterprise habits.",
      coreOutcomes: [
        "Create a simple budget",
        "Keep basic spending and sales records",
        "Estimate cost and understand price",
        "Recognise the difference between revenue, cost, and profit",
        "Practice responsibility, teamwork, and ethical decision making",
      ],
      curriculumStrands: [
        "Personal Money Management",
        "Enterprise Practice",
        "Leadership in Action",
        "Civic Responsibility and Ethics",
      ],
      termStructure: [
        {
          term: "Term 1",
          focus: "Budgeting and Financial Discipline",
          illustrativeTopics: [
            "Income and allowance",
            "Budget basics",
            "Savings goals",
            "Record keeping",
            "Digital money awareness",
            "Avoiding waste",
          ],
        },
        {
          term: "Term 2",
          focus: "Enterprise Basics",
          illustrativeTopics: [
            "Problem identification",
            "Creating an offer",
            "Cost estimation",
            "Pricing basics",
            "Customer service",
            "Profit awareness",
          ],
        },
        {
          term: "Term 3",
          focus: "Leadership and Community Action",
          illustrativeTopics: [
            "Team roles",
            "Accountability",
            "Ethical choices",
            "Conflict resolution",
            "Group micro-enterprise challenge",
          ],
        },
      ],
      signatureExperiences: [
        "Weekly budget journal",
        "Sales and cost record sheet",
        "Cost-and-price challenge",
        "School micro-business simulation",
        "Community problem-solving task",
      ],
      liveClassroomFormat:
        "One live class per week, 60 minutes, with moderator support, chat engagement, scenario work, and at least one monthly simulation session.",
    },
  ],
};
