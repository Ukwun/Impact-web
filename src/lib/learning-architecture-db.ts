import { CurriculumLevel, Programme, SubscriptionTierType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type LevelCode = "PRIMARY" | "JUNIOR_SECONDARY" | "SENIOR_SECONDARY" | "IMPACTUNI";

type ArchitecturePayload = {
  learningLayers: Array<{ id: string; purpose: string; typicalComponents: string[] }>;
  productHierarchy: Array<{ level: string; function: string }>;
  recommendedCmsFields: string[];
  subscriptionModes: Array<{ mode: string; primaryUser: string; requiredFeatures: string[] }>;
  deliveryBlend: {
    selfPacedPercent: number;
    liveClassPercent: number;
    projectAndCommunityPercent: number;
  };
  weeklyClassroomRhythm: Array<{
    stage: string;
    dayLabel: string;
    learnerExperience: string;
    systemFunction: string;
  }>;
  dashboardRequirements: {
    learner: string[];
    schoolParentAdmin: string[];
  };
  fourLevelCurriculumFramework: Array<{
    level: string;
    ageGroup: string;
    primaryOutcome: string;
    signatureShift: string;
  }>;
  levelStructures: Array<{
    level: string;
    ageGroup: string;
    purpose: string;
    coreOutcomes: string[];
    curriculumStrands: string[];
    termStructure: Array<{ term: string; focus: string; illustrativeTopics: string[] }>;
    signatureExperiences: string[];
    liveClassroomFormat: string;
  }>;
};

type JsonObject = Record<string, unknown>;

function parseJson<T>(value?: string | null, fallback?: T): T {
  if (!value) {
    return fallback as T;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback as T;
  }
}

async function upsertMetadata(params: {
  resourceType: string;
  resourceId: string;
  title: string;
  shortDescription?: string;
  longDescription?: JsonObject | string;
  contentType?: string;
  curriculumLevel?: CurriculumLevel;
  termOrCycle?: string;
}) {
  const existing = await prisma.contentMetadata.findFirst({
    where: {
      resourceType: params.resourceType,
      resourceId: params.resourceId,
    },
  });

  const longDescription =
    typeof params.longDescription === "string"
      ? params.longDescription
      : params.longDescription
        ? JSON.stringify(params.longDescription)
        : undefined;

  const payload = {
    title: params.title,
    shortDescription: params.shortDescription,
    longDescription,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    contentType: params.contentType ?? params.resourceType,
    curriculumLevel: params.curriculumLevel,
    termOrCycle: params.termOrCycle,
    isPublished: true,
    publishedAt: new Date(),
  };

  if (existing) {
    return prisma.contentMetadata.update({
      where: { id: existing.id },
      data: payload,
    });
  }

  return prisma.contentMetadata.create({
    data: payload,
  });
}

export async function seedLearningArchitectureCmsData() {
  const frameworkSeeds: Array<{
    level: CurriculumLevel;
    name: string;
    minAge: number;
    maxAge: number;
    durationWeeks: number;
    signatureShift: string;
    primaryOutcome: string;
    purpose: string;
    coreOutcomes: string[];
    curriculumStrands: string[];
    signatureExperiences: string[];
    liveClassroomFormat: string;
    terms: Array<{ term: string; focus: string; illustrativeTopics: string[] }>;
  }> = [
    {
      level: "PRIMARY",
      name: "Primary",
      minAge: 7,
      maxAge: 11,
      durationWeeks: 12,
      signatureShift: "From awareness to healthy daily money, behaviour, and teamwork habits",
      primaryOutcome: "Habit formation",
      purpose: "Build habits, values, awareness, and confidence.",
      coreOutcomes: [
        "Distinguish needs from wants",
        "Understand saving before spending",
        "Recognise simple buying and selling ideas",
        "Demonstrate honesty, responsibility, respect, and fairness",
        "Work with others and take simple initiative",
      ],
      curriculumStrands: [
        "My Money Habits",
        "My Ideas and Small Business Thinking",
        "My Leadership Habits",
        "My Values and Community",
      ],
      signatureExperiences: [
        "Class savings challenge",
        "Mini market day",
        "Story-based ethics circle",
        "Young leader recognition",
        "Family discussion prompt",
      ],
      liveClassroomFormat:
        "One live class per week, 45 minutes, visual and interactive with polls, role play, and guided discussion.",
      terms: [
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
    },
    {
      level: "JUNIOR_SECONDARY",
      name: "Junior Secondary",
      minAge: 12,
      maxAge: 14,
      durationWeeks: 12,
      signatureShift: "From understanding to budgeting, recording, and simple enterprise practice",
      primaryOutcome: "Practical application",
      purpose: "Build practical financial and enterprise habits.",
      coreOutcomes: [
        "Create a simple budget",
        "Keep basic spending and sales records",
        "Estimate cost and understand pricing",
        "Differentiate revenue, cost, and profit",
        "Practice responsibility, teamwork, and ethical decision making",
      ],
      curriculumStrands: [
        "Personal Money Management",
        "Enterprise Practice",
        "Leadership in Action",
        "Civic Responsibility and Ethics",
      ],
      signatureExperiences: [
        "Weekly budget journal",
        "Sales and cost record sheet",
        "Cost and price challenge",
        "School micro-business simulation",
        "Community problem-solving task",
      ],
      liveClassroomFormat:
        "One live class per week, 60 minutes, with moderator support, scenario work, and monthly simulations.",
      terms: [
        {
          term: "Term 1",
          focus: "Budgeting and Financial Discipline",
          illustrativeTopics: [
            "Income and allowance",
            "Budget basics",
            "Savings goals",
            "Record keeping",
            "Digital money awareness",
          ],
        },
        {
          term: "Term 2",
          focus: "Enterprise Basics",
          illustrativeTopics: [
            "Problem identification",
            "Creating an offer",
            "Cost estimation",
            "Pricing fundamentals",
            "Customer service",
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
    },
    {
      level: "SENIOR_SECONDARY",
      name: "Senior Secondary",
      minAge: 15,
      maxAge: 18,
      durationWeeks: 12,
      signatureShift: "From business ideas to planning, projections, pitching, and investment awareness",
      primaryOutcome: "Enterprise readiness",
      purpose: "Move learners from concept to venture-ready execution discipline.",
      coreOutcomes: [
        "Validate a business problem and customer segment",
        "Build lean business and financial projections",
        "Pitch with confidence to evaluators and peers",
        "Understand unit economics and risk trade-offs",
        "Operate with governance and ethical leadership",
      ],
      curriculumStrands: [
        "Market Discovery and Validation",
        "Business and Financial Modeling",
        "Pitching and Investor Readiness",
        "Leadership, Ethics, and Governance",
      ],
      signatureExperiences: [
        "Founders problem interview sprint",
        "Cap table and pricing lab",
        "Pitch day with panel scoring",
        "Venture simulation and risk scenario board",
        "Mentor office-hour clinics",
      ],
      liveClassroomFormat:
        "One live class per week, 75 minutes, featuring pitch rehearsal, boardroom simulations, and mentor critique loops.",
      terms: [
        {
          term: "Term 1",
          focus: "Validation and Venture Foundations",
          illustrativeTopics: [
            "Customer discovery interviews",
            "Problem-solution fit",
            "Value proposition design",
            "Early traction signals",
            "Ethical market entry",
          ],
        },
        {
          term: "Term 2",
          focus: "Financial Planning and Operations",
          illustrativeTopics: [
            "Revenue and cost architecture",
            "Cash flow planning",
            "Pricing strategy",
            "Operations and delivery model",
            "Compliance basics",
          ],
        },
        {
          term: "Term 3",
          focus: "Pitch and Growth Readiness",
          illustrativeTopics: [
            "Pitch deck development",
            "Investor storytelling",
            "Due diligence preparation",
            "Growth channel prioritisation",
            "Team accountability systems",
          ],
        },
      ],
    },
    {
      level: "IMPACTUNI",
      name: "ImpactUni",
      minAge: 18,
      maxAge: 35,
      durationWeeks: 12,
      signatureShift: "From readiness to venture building, employability, and institutional engagement",
      primaryOutcome: "Execution and capital awareness",
      purpose: "Deliver execution depth for venture, employability, and leadership outcomes.",
      coreOutcomes: [
        "Execute validated venture milestones",
        "Negotiate partnerships, funding, and contracts",
        "Build employability and portfolio credibility",
        "Use data to steer product and growth",
        "Lead teams and ecosystems responsibly",
      ],
      curriculumStrands: [
        "Venture Execution Studio",
        "Capital and Deal Readiness",
        "Career and Employability Acceleration",
        "Leadership and Ecosystem Impact",
      ],
      signatureExperiences: [
        "Live execution sprint with milestone review",
        "Investor memo and deal room simulation",
        "Portfolio showcase and hiring challenge",
        "Ecosystem capstone with partner institutions",
        "Founder and operator roundtable",
      ],
      liveClassroomFormat:
        "Two live touchpoints weekly (90-minute studio plus 45-minute clinic), with execution accountability and partner feedback.",
      terms: [
        {
          term: "Term 1",
          focus: "Execution Foundations",
          illustrativeTopics: [
            "Milestone planning",
            "Execution cadence",
            "Product and service validation",
            "Operational scorecards",
            "Team rituals",
          ],
        },
        {
          term: "Term 2",
          focus: "Capital, Deals, and Growth",
          illustrativeTopics: [
            "Funding pathways",
            "Deal structures",
            "Negotiation frameworks",
            "Growth economics",
            "Partnership strategy",
          ],
        },
        {
          term: "Term 3",
          focus: "Career and Ecosystem Impact",
          illustrativeTopics: [
            "Portfolio and credential signalling",
            "Leadership communication",
            "Institutional collaboration",
            "Impact measurement",
            "Scale and sustainability planning",
          ],
        },
      ],
    },
  ];

  const layers = [
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
  ];

  const hierarchy = [
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
  ];

  const cmsFields = [
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
  ];

  const weeklyStages = [
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
  ];

  const dashboardRequirements = {
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
  };

  const blend = {
    selfPacedPercent: 60,
    liveClassPercent: 25,
    projectAndCommunityPercent: 15,
  };

  const programmes = [
    {
      code: Programme.IMPACT_SCHOOL,
      title: "ImpactSchool",
      shortDescription: "Structured school and family learning experience.",
    },
    {
      code: Programme.IMPACT_UNI,
      title: "ImpactUni",
      shortDescription: "Execution and venture-focused learning for older learners.",
    },
  ];

  for (const programme of programmes) {
    await upsertMetadata({
      resourceType: "PROGRAMME",
      resourceId: String(programme.code),
      title: programme.title,
      shortDescription: programme.shortDescription,
      contentType: "PROGRAMME",
    });
  }

  for (const layer of layers) {
    await upsertMetadata({
      resourceType: "LEARNING_LAYER",
      resourceId: layer.id,
      title: layer.id,
      shortDescription: layer.purpose,
      longDescription: { typicalComponents: layer.typicalComponents },
      contentType: "LEARNING_LAYER",
    });
  }

  for (const node of hierarchy) {
    await upsertMetadata({
      resourceType: "PRODUCT_HIERARCHY",
      resourceId: node.level,
      title: node.level,
      shortDescription: node.function,
      contentType: "PRODUCT_HIERARCHY",
    });
  }

  for (const field of cmsFields) {
    await upsertMetadata({
      resourceType: "CMS_FIELD",
      resourceId: field.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: field,
      contentType: "CMS_FIELD",
    });
  }

  for (const stage of weeklyStages) {
    await upsertMetadata({
      resourceType: "WEEKLY_STAGE",
      resourceId: stage.stage,
      title: stage.dayLabel,
      shortDescription: stage.learnerExperience,
      longDescription: { systemFunction: stage.systemFunction, stage: stage.stage },
      contentType: "WEEKLY_STAGE",
    });
  }

  await upsertMetadata({
    resourceType: "DELIVERY_BLEND",
    resourceId: "DEFAULT_BLEND",
    title: "Delivery blend",
    longDescription: blend,
    contentType: "DELIVERY_BLEND",
  });

  await upsertMetadata({
    resourceType: "DASHBOARD_REQUIREMENT",
    resourceId: "LEARNER",
    title: "Learner dashboard requirements",
    longDescription: { items: dashboardRequirements.learner },
    contentType: "DASHBOARD_REQUIREMENT",
  });

  await upsertMetadata({
    resourceType: "DASHBOARD_REQUIREMENT",
    resourceId: "SCHOOL_PARENT_ADMIN",
    title: "School parent admin dashboard requirements",
    longDescription: { items: dashboardRequirements.schoolParentAdmin },
    contentType: "DASHBOARD_REQUIREMENT",
  });

  for (const seed of frameworkSeeds) {
    const framework = await prisma.curriculumFramework.upsert({
      where: { level: seed.level },
      update: {
        name: seed.name,
        signatureShift: seed.signatureShift,
        primaryOutcome: seed.primaryOutcome,
        minAge: seed.minAge,
        maxAge: seed.maxAge,
        durationWeeks: seed.durationWeeks,
      },
      create: {
        level: seed.level,
        name: seed.name,
        signatureShift: seed.signatureShift,
        primaryOutcome: seed.primaryOutcome,
        minAge: seed.minAge,
        maxAge: seed.maxAge,
        durationWeeks: seed.durationWeeks,
      },
    });

    await upsertMetadata({
      resourceType: "LEVEL",
      resourceId: seed.level,
      title: seed.name,
      shortDescription: `${seed.minAge}-${seed.maxAge}`,
      curriculumLevel: seed.level,
      longDescription: {
        purpose: seed.purpose,
        coreOutcomes: seed.coreOutcomes,
        curriculumStrands: seed.curriculumStrands,
        signatureExperiences: seed.signatureExperiences,
        liveClassroomFormat: seed.liveClassroomFormat,
      },
      contentType: "LEVEL",
    });

    for (let index = 0; index < seed.terms.length; index += 1) {
      const term = seed.terms[index];

      await upsertMetadata({
        resourceType: "TERM",
        resourceId: `${seed.level}_${index + 1}`,
        title: term.term,
        shortDescription: term.focus,
        curriculumLevel: seed.level,
        termOrCycle: term.term,
        longDescription: {
          focus: term.focus,
          illustrativeTopics: term.illustrativeTopics,
        },
        contentType: "TERM",
      });

      await prisma.curriculumModule.upsert({
        where: {
          frameworkId_order: {
            frameworkId: framework.id,
            order: index + 1,
          },
        },
        update: {
          title: `${term.term}: ${term.focus}`,
          description: term.illustrativeTopics.join(", "),
          subjectStrand: seed.curriculumStrands[0] ?? "General",
          estimatedWeeks: 4,
        },
        create: {
          frameworkId: framework.id,
          title: `${term.term}: ${term.focus}`,
          description: term.illustrativeTopics.join(", "),
          order: index + 1,
          subjectStrand: seed.curriculumStrands[0] ?? "General",
          estimatedWeeks: 4,
        },
      });
    }
  }
}

function normalizeModeFromTier(tier: SubscriptionTierType): "INDIVIDUAL" | "SCHOOL" | "INSTITUTIONAL_UNIVERSITY" {
  if (tier.startsWith("INDIVIDUAL")) {
    return "INDIVIDUAL";
  }
  if (tier.startsWith("SCHOOL")) {
    return "SCHOOL";
  }
  return "INSTITUTIONAL_UNIVERSITY";
}

export async function getLearningArchitecturePayload(): Promise<ArchitecturePayload> {
  await seedLearningArchitectureCmsData();

  const [
    layers,
    hierarchy,
    cmsFields,
    weeklyStages,
    blendMeta,
    learnerReq,
    schoolReq,
    levels,
    terms,
    frameworks,
    plans,
  ] = await Promise.all([
    prisma.contentMetadata.findMany({ where: { resourceType: "LEARNING_LAYER", isPublished: true }, orderBy: { title: "asc" } }),
    prisma.contentMetadata.findMany({ where: { resourceType: "PRODUCT_HIERARCHY", isPublished: true }, orderBy: { title: "asc" } }),
    prisma.contentMetadata.findMany({ where: { resourceType: "CMS_FIELD", isPublished: true }, orderBy: { title: "asc" } }),
    prisma.contentMetadata.findMany({ where: { resourceType: "WEEKLY_STAGE", isPublished: true }, orderBy: { createdAt: "asc" } }),
    prisma.contentMetadata.findFirst({ where: { resourceType: "DELIVERY_BLEND", resourceId: "DEFAULT_BLEND" } }),
    prisma.contentMetadata.findFirst({ where: { resourceType: "DASHBOARD_REQUIREMENT", resourceId: "LEARNER" } }),
    prisma.contentMetadata.findFirst({ where: { resourceType: "DASHBOARD_REQUIREMENT", resourceId: "SCHOOL_PARENT_ADMIN" } }),
    prisma.contentMetadata.findMany({ where: { resourceType: "LEVEL", isPublished: true }, orderBy: { createdAt: "asc" } }),
    prisma.contentMetadata.findMany({ where: { resourceType: "TERM", isPublished: true }, orderBy: [{ curriculumLevel: "asc" }, { createdAt: "asc" }] }),
    prisma.curriculumFramework.findMany({ orderBy: { minAge: "asc" } }),
    prisma.subscriptionPlan.findMany({ orderBy: { name: "asc" } }),
  ]);

  const levelStructures = levels.map((entry) => {
    const details = parseJson<{
      purpose?: string;
      coreOutcomes?: string[];
      curriculumStrands?: string[];
      signatureExperiences?: string[];
      liveClassroomFormat?: string;
    }>(entry.longDescription, {});

    const entryTerms = terms
      .filter((term) => term.curriculumLevel === entry.curriculumLevel)
      .map((term) => {
        const termDetails = parseJson<{ focus?: string; illustrativeTopics?: string[] }>(term.longDescription, {});
        return {
          term: term.termOrCycle ?? term.title,
          focus: termDetails.focus ?? term.shortDescription ?? "",
          illustrativeTopics: termDetails.illustrativeTopics ?? [],
        };
      });

    return {
      level: entry.resourceId,
      ageGroup: entry.shortDescription ?? "",
      purpose: details.purpose ?? "",
      coreOutcomes: details.coreOutcomes ?? [],
      curriculumStrands: details.curriculumStrands ?? [],
      termStructure: entryTerms,
      signatureExperiences: details.signatureExperiences ?? [],
      liveClassroomFormat: details.liveClassroomFormat ?? "",
    };
  });

  const groupedModes = new Map<string, { mode: string; requiredFeatures: Set<string> }>();
  for (const plan of plans) {
    const mode = normalizeModeFromTier(plan.tierType);
    if (!groupedModes.has(mode)) {
      groupedModes.set(mode, { mode, requiredFeatures: new Set<string>() });
    }
    const group = groupedModes.get(mode)!;

    group.requiredFeatures.add("Progress tracking");
    if (plan.canAccessAnalytics) group.requiredFeatures.add("Advanced analytics");
    if (plan.canManageFacilitators) group.requiredFeatures.add("Facilitator management");
    if (plan.canIntegrateSIS) group.requiredFeatures.add("SIS integration");
    if (plan.canExportReports) group.requiredFeatures.add("Exportable reporting");
    if (plan.maxUsers === null) group.requiredFeatures.add("Scalable user seats");
  }

  const deliveryBlend = parseJson<ArchitecturePayload["deliveryBlend"]>(blendMeta?.longDescription, {
    selfPacedPercent: 60,
    liveClassPercent: 25,
    projectAndCommunityPercent: 15,
  });

  const learnerItems = parseJson<{ items?: string[] }>(learnerReq?.longDescription, { items: [] });
  const schoolItems = parseJson<{ items?: string[] }>(schoolReq?.longDescription, { items: [] });

  return {
    learningLayers: layers.map((entry) => {
      const details = parseJson<{ typicalComponents?: string[] }>(entry.longDescription, {});
      return {
        id: entry.resourceId,
        purpose: entry.shortDescription ?? "",
        typicalComponents: details.typicalComponents ?? [],
      };
    }),
    productHierarchy: hierarchy.map((entry) => ({
      level: entry.resourceId,
      function: entry.shortDescription ?? "",
    })),
    recommendedCmsFields: cmsFields.map((entry) => entry.title),
    subscriptionModes: [
      {
        mode: "INDIVIDUAL",
        primaryUser: "Parent or learner",
        requiredFeatures: Array.from(groupedModes.get("INDIVIDUAL")?.requiredFeatures ?? ["Personal dashboard", "Progress tracking"]),
      },
      {
        mode: "SCHOOL",
        primaryUser: "School admin, teachers, and students",
        requiredFeatures: Array.from(groupedModes.get("SCHOOL")?.requiredFeatures ?? ["Cohort management", "Reporting"]),
      },
      {
        mode: "INSTITUTIONAL_UNIVERSITY",
        primaryUser: "Campus, department, student network, partner institution",
        requiredFeatures: Array.from(groupedModes.get("INSTITUTIONAL_UNIVERSITY")?.requiredFeatures ?? ["Cohort enrolment", "Advanced reporting"]),
      },
    ],
    deliveryBlend,
    weeklyClassroomRhythm: weeklyStages.map((entry) => {
      const details = parseJson<{ stage?: string; systemFunction?: string }>(entry.longDescription, {});
      return {
        stage: details.stage ?? entry.resourceId,
        dayLabel: entry.title,
        learnerExperience: entry.shortDescription ?? "",
        systemFunction: details.systemFunction ?? "",
      };
    }),
    dashboardRequirements: {
      learner: learnerItems.items ?? [],
      schoolParentAdmin: schoolItems.items ?? [],
    },
    fourLevelCurriculumFramework: frameworks.map((framework) => ({
      level: framework.level,
      ageGroup: `${framework.minAge}-${framework.maxAge}`,
      primaryOutcome: framework.primaryOutcome,
      signatureShift: framework.signatureShift,
    })),
    levelStructures,
  };
}
