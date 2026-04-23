import { PrismaClient, CurriculumLevel, PublishStatus, Programme } from "@prisma/client";

type SeedSummary = {
  frameworks: number;
  courses: number;
  curriculumModules: number;
  courseModules: number;
  lessons: number;
  activities: number;
  metadataRecords: number;
  enrollments: number;
};

type ArtifactBlueprint = {
  id: string;
  title: string;
  description: string;
  activityType: string;
  instructions: string;
  rubric: Array<{ criterion: string; points: number; description: string }>;
  maxPoints: number;
  dueOffsetDays: number;
  workflowSlug: string;
};

type LessonBlueprint = {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  learningObjectives: string[];
  learningLayer?: string;
  artifact?: ArtifactBlueprint;
};

type ModuleBlueprint = {
  id: string;
  title: string;
  description: string;
  order: number;
  subjectStrand: string;
  estimatedWeeks: number;
  competencies: string[];
  learningObjectives: string[];
  lessons: LessonBlueprint[];
};

type FrameworkBlueprint = {
  level: CurriculumLevel;
  name: string;
  description: string;
  signatureShift: string;
  primaryOutcome: string;
  minAge: number;
  maxAge: number;
  durationWeeks: number;
  learningObjectives: string[];
  competencyAreas: string[];
  assessmentMethods: string[];
  course: {
    id: string;
    title: string;
    description: string;
    difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
    duration: number;
    language: string;
    instructor: string;
  };
  modules: ModuleBlueprint[];
};

const ventureBlueprints: FrameworkBlueprint[] = [
  {
    level: CurriculumLevel.SENIOR_SECONDARY,
    name: "Senior Secondary",
    description: "Enterprise readiness curriculum for ages 15-18 built around venture design, projections, governance, and pitch confidence.",
    signatureShift: "From ideas to enterprise readiness, financial confidence, and confident venture presentation",
    primaryOutcome: "Enterprise readiness, financial confidence, and pitch ability",
    minAge: 15,
    maxAge: 18,
    durationWeeks: 12,
    learningObjectives: [
      "Write a basic business plan",
      "Prepare simple financial projections",
      "Understand startup cost, pricing, margin, and cash flow logic",
      "Participate in investment simulations",
      "Present a business or project pitch with confidence",
    ],
    competencyAreas: [
      "Venture Design",
      "Financial Planning and Projections",
      "Leadership, Governance, and Influence",
      "Investment and Pitch Readiness",
    ],
    assessmentMethods: [
      "Business plan builder",
      "Projection worksheet",
      "Investor simulation game",
      "Quarterly virtual demo day",
    ],
    course: {
      id: "course_senior_enterprise_readiness",
      title: "Senior Secondary Enterprise Readiness",
      description: "A realistic venture-preparation course covering business design, projections, investor simulations, and pitch delivery.",
      difficulty: "ADVANCED",
      duration: 900,
      language: "English",
      instructor: "Impact Venture Faculty",
    },
    modules: [
      {
        id: "cm_senior_venture_design",
        title: "Venture Design",
        description: "Opportunity identification, customer understanding, value proposition, and operating model basics.",
        order: 1,
        subjectStrand: "Venture Design",
        estimatedWeeks: 3,
        competencies: ["Opportunity scanning", "Customer empathy", "Business model logic"],
        learningObjectives: ["Identify viable opportunities", "Describe a customer problem", "Frame a workable venture concept"],
        lessons: [
          {
            id: "lesson_senior_venture_opportunity",
            title: "Opportunity Identification Studio",
            description: "Learners evaluate real market problems and choose one problem worth solving.",
            content: "This session walks learners through local problem mapping, customer frustration signals, and venture opportunity selection.",
            duration: 50,
            order: 1,
            learningObjectives: ["Spot a genuine market problem", "Prioritize customer pain points"],
          },
          {
            id: "lesson_senior_business_plan",
            title: "Business Plan Builder Workshop",
            description: "Convert a problem statement into a business plan draft with customer, offer, and operating assumptions.",
            content: "Learners build an executive summary, customer profile, value proposition, and delivery model for a simple business plan.",
            duration: 60,
            order: 2,
            learningObjectives: ["Draft a simple business plan", "Articulate revenue and delivery assumptions"],
            artifact: {
              id: "artifact_business_plan_builder",
              title: "Business Plan Builder",
              description: "Complete the core sections of a first-pass venture plan for facilitator review.",
              activityType: "BUSINESS_PLAN",
              instructions: "Build a concise business plan covering problem, customer, value proposition, revenue model, operations, and near-term milestones.",
              rubric: [
                { criterion: "Problem clarity", points: 25, description: "Problem is specific, relevant, and clearly understood" },
                { criterion: "Customer understanding", points: 25, description: "Customer segment and needs are realistic and well framed" },
                { criterion: "Business model logic", points: 25, description: "Revenue, delivery, and operations fit together coherently" },
                { criterion: "Execution readiness", points: 25, description: "Milestones and early actions are credible and practical" },
              ],
              maxPoints: 100,
              dueOffsetDays: 10,
              workflowSlug: "business-plan-builder",
            },
          },
        ],
      },
      {
        id: "cm_senior_financial_planning",
        title: "Financial Planning and Projections",
        description: "Startup cost planning, pricing, margin logic, cash flow basics, and simple projections.",
        order: 2,
        subjectStrand: "Financial Planning and Projections",
        estimatedWeeks: 3,
        competencies: ["Pricing logic", "Cash flow reasoning", "Projection design"],
        learningObjectives: ["Estimate startup costs", "Build simple revenue and expense projections", "Interpret margin and cash flow"],
        lessons: [
          {
            id: "lesson_senior_pricing_margin",
            title: "Startup Cost, Pricing, and Margin Logic",
            description: "Learners test unit economics and pricing trade-offs using a realistic venture scenario.",
            content: "Learners calculate startup cost categories, evaluate price points, and connect pricing decisions to margin and sustainability.",
            duration: 55,
            order: 1,
            learningObjectives: ["Estimate startup costs", "Use margin to compare pricing options"],
          },
          {
            id: "lesson_senior_projection_worksheet",
            title: "Projection Worksheet Lab",
            description: "Build a simple revenue, cost, and cash flow worksheet for a first operating quarter.",
            content: "Learners turn startup assumptions into a simple projection worksheet and explain how they will track performance weekly.",
            duration: 60,
            order: 2,
            learningObjectives: ["Prepare simple projections", "Explain basic cash flow patterns"],
            artifact: {
              id: "artifact_projection_worksheet",
              title: "Projection Worksheet",
              description: "Submit a startup cost and cash flow projection for a learner venture.",
              activityType: "PROJECTION_WORKSHEET",
              instructions: "Document startup costs, monthly revenue assumptions, operating costs, pricing logic, and a simple cash flow outlook.",
              rubric: [
                { criterion: "Cost completeness", points: 25, description: "Startup and operating cost assumptions are complete and relevant" },
                { criterion: "Projection accuracy", points: 25, description: "Revenue and cost projections are internally consistent" },
                { criterion: "Cash flow understanding", points: 25, description: "Cash flow logic is explained clearly" },
                { criterion: "Decision insight", points: 25, description: "Learner shows how the model informs decisions" },
              ],
              maxPoints: 100,
              dueOffsetDays: 14,
              workflowSlug: "projection-worksheet",
            },
          },
        ],
      },
      {
        id: "cm_senior_leadership_governance",
        title: "Leadership, Governance, and Influence",
        description: "Leadership responsibilities, ethical choices, team alignment, and stakeholder trust.",
        order: 3,
        subjectStrand: "Leadership, Governance, and Influence",
        estimatedWeeks: 3,
        competencies: ["Ethical judgment", "Team coordination", "Stakeholder communication"],
        learningObjectives: ["Lead with accountability", "Explain governance basics", "Communicate with influence"],
        lessons: [
          {
            id: "lesson_senior_governance_roles",
            title: "Governance, Roles, and Accountability",
            description: "Define team roles, operating norms, and decision rights in a learner venture.",
            content: "Learners explore governance basics, accountability structures, and how ethical leadership improves execution quality.",
            duration: 45,
            order: 1,
            learningObjectives: ["Define roles and decision rights", "Describe basic governance controls"],
          },
          {
            id: "lesson_senior_influence_stakeholders",
            title: "Influence and Stakeholder Communication",
            description: "Practice persuasive communication with team members, facilitators, and backers.",
            content: "Learners rehearse concise updates, persuasive asks, and trust-building communication across stakeholders.",
            duration: 45,
            order: 2,
            learningObjectives: ["Communicate a clear ask", "Build stakeholder confidence"],
          },
        ],
      },
      {
        id: "cm_senior_investment_pitch",
        title: "Investment and Pitch Readiness",
        description: "Capital types, risk and return, investor simulations, pitch deck design, and demo day readiness.",
        order: 4,
        subjectStrand: "Investment and Pitch Readiness",
        estimatedWeeks: 3,
        competencies: ["Capital awareness", "Risk reasoning", "Pitch storytelling"],
        learningObjectives: ["Understand funding pathways", "Participate in an investment simulation", "Pitch with confidence"],
        lessons: [
          {
            id: "lesson_senior_investor_simulation",
            title: "Investor Simulation Game",
            description: "Evaluate funding choices, risk, and return inside a structured simulation.",
            content: "Learners choose between grants, debt, equity, and bootstrapping in different venture scenarios and justify their funding logic.",
            duration: 60,
            order: 1,
            learningObjectives: ["Compare capital types", "Explain a funding choice using risk and return"],
            artifact: {
              id: "artifact_investor_simulation",
              title: "Investor Simulation",
              description: "Work through a funding scenario and justify the most suitable capital pathway.",
              activityType: "INVESTOR_SIMULATION",
              instructions: "Choose a capital type, justify your funding logic, define risk level, and explain expected return or trade-offs.",
              rubric: [
                { criterion: "Funding pathway selection", points: 25, description: "Capital choice fits the venture stage and context" },
                { criterion: "Risk reasoning", points: 25, description: "Risk and return trade-offs are clearly explained" },
                { criterion: "Decision quality", points: 25, description: "Assumptions are practical and defensible" },
                { criterion: "Communication clarity", points: 25, description: "Recommendation is concise and persuasive" },
              ],
              maxPoints: 100,
              dueOffsetDays: 18,
              workflowSlug: "investor-simulation",
            },
          },
          {
            id: "lesson_senior_pitch_readiness",
            title: "Pitch Deck and Demo Day Rehearsal",
            description: "Structure a pitch, practice delivery, and prepare for questions from reviewers.",
            content: "Learners design a short pitch deck, practise timing and flow, and rehearse responses to investor-style questions.",
            duration: 60,
            order: 2,
            learningObjectives: ["Build a concise pitch structure", "Respond to questions with confidence"],
          },
        ],
      },
    ],
  },
  {
    level: CurriculumLevel.IMPACTUNI,
    name: "ImpactUni",
    description: "Execution and capital-readiness curriculum for university and early-career builders focused on venture execution, opportunity readiness, and institutional credibility.",
    signatureShift: "From knowledge to execution, employability, venture building, and capital awareness",
    primaryOutcome: "Execution maturity, venture building, and institutional readiness",
    minAge: 18,
    maxAge: 35,
    durationWeeks: 16,
    learningObjectives: [
      "Manage personal finance and career capital with greater maturity",
      "Design and validate a venture, initiative, or innovation project",
      "Build execution plans and basic financial models",
      "Understand grants, debt, equity, and bootstrapping pathways",
      "Lead teams, present ideas, and engage institutions or investors credibly",
    ],
    competencyAreas: [
      "Personal Finance and Career Capital",
      "Venture Building and Innovation",
      "Leadership, Governance, and Public Purpose",
      "Capital, Investment, and Opportunity Readiness",
    ],
    assessmentMethods: [
      "Career capital dashboard",
      "Founder studio sprint",
      "Investment committee simulation",
      "Capstone pitch",
    ],
    course: {
      id: "course_impactuni_execution_capital",
      title: "ImpactUni Execution and Capital Readiness",
      description: "A realistic university-level venture and employability studio covering execution plans, financial models, and institutional pitch readiness.",
      difficulty: "ADVANCED",
      duration: 1200,
      language: "English",
      instructor: "ImpactUni Studio Faculty",
    },
    modules: [
      {
        id: "cm_impactuni_personal_capital",
        title: "Personal Finance and Career Capital",
        description: "Budgeting, debt awareness, productivity, digital professionalism, and career positioning.",
        order: 1,
        subjectStrand: "Personal Finance and Career Capital",
        estimatedWeeks: 4,
        competencies: ["Financial maturity", "Professional positioning", "Execution discipline"],
        learningObjectives: ["Manage personal capital", "Build career credibility", "Operate with professional discipline"],
        lessons: [
          {
            id: "lesson_impactuni_budgeting_capital",
            title: "Budgeting, Debt Awareness, and Income Planning",
            description: "Build a grounded personal finance strategy that supports career or venture execution.",
            content: "Learners examine spending patterns, debt risks, income planning, and the financial habits required to sustain execution over time.",
            duration: 55,
            order: 1,
            learningObjectives: ["Plan a personal budget", "Link personal finance to execution stability"],
          },
          {
            id: "lesson_impactuni_career_capital",
            title: "Career Capital Dashboard",
            description: "Map current strengths, portfolio evidence, and positioning gaps for professional growth.",
            content: "Learners define their skills narrative, signal value through portfolio evidence, and identify immediate credibility-building actions.",
            duration: 50,
            order: 2,
            learningObjectives: ["Assess current professional capital", "Define next credibility moves"],
          },
        ],
      },
      {
        id: "cm_impactuni_venture_building",
        title: "Venture Building and Innovation",
        description: "Problem validation, product or service design, market research, operations, and partnership logic.",
        order: 2,
        subjectStrand: "Venture Building and Innovation",
        estimatedWeeks: 4,
        competencies: ["Validation", "Service design", "Execution planning"],
        learningObjectives: ["Validate a real problem", "Design an execution roadmap", "Align operations to value delivery"],
        lessons: [
          {
            id: "lesson_impactuni_problem_validation",
            title: "Founder Studio: Problem Validation",
            description: "Validate a problem, test assumptions, and decide whether an opportunity is worth pursuing.",
            content: "Learners use interviews, observation, and evidence logging to validate a venture or innovation problem.",
            duration: 60,
            order: 1,
            learningObjectives: ["Collect validation evidence", "Choose a focused execution opportunity"],
          },
          {
            id: "lesson_impactuni_execution_roadmap",
            title: "Execution Roadmap and Partnerships",
            description: "Translate validation into a delivery roadmap with milestones, partners, and operating rhythms.",
            content: "Learners build a roadmap with milestones, partnerships, and resource assumptions for a first execution cycle.",
            duration: 60,
            order: 2,
            learningObjectives: ["Design an execution roadmap", "Define partnership assumptions"],
          },
        ],
      },
      {
        id: "cm_impactuni_leadership_governance",
        title: "Leadership, Governance, and Public Purpose",
        description: "Lead teams, govern responsibly, and build public trust around a venture or initiative.",
        order: 3,
        subjectStrand: "Leadership, Governance, and Public Purpose",
        estimatedWeeks: 4,
        competencies: ["Leadership communication", "Governance", "Institutional trust"],
        learningObjectives: ["Lead a delivery team", "Build accountability systems", "Communicate with institutional credibility"],
        lessons: [
          {
            id: "lesson_impactuni_governance",
            title: "Governance in Action",
            description: "Apply governance and accountability structures to an operating project or venture.",
            content: "Learners define check-ins, reporting norms, and decision structures that make execution reliable and transparent.",
            duration: 50,
            order: 1,
            learningObjectives: ["Build accountability routines", "Understand governance trade-offs"],
          },
          {
            id: "lesson_impactuni_institutional_comms",
            title: "Institutional Communication and Public Purpose",
            description: "Present ideas in a way that builds confidence with partners, institutions, and public stakeholders.",
            content: "Learners practise formal updates, partnership asks, and positioning a venture or initiative around public value.",
            duration: 50,
            order: 2,
            learningObjectives: ["Communicate with institutional credibility", "Frame public purpose clearly"],
          },
        ],
      },
      {
        id: "cm_impactuni_capital_readiness",
        title: "Capital, Investment, and Opportunity Readiness",
        description: "Financial modelling, funding pathways, investor materials, and a capstone pitch workflow.",
        order: 4,
        subjectStrand: "Capital, Investment, and Opportunity Readiness",
        estimatedWeeks: 4,
        competencies: ["Financial modelling", "Capital pathway reasoning", "Pitch execution"],
        learningObjectives: ["Build a basic financial model", "Select suitable capital pathways", "Present opportunity materials credibly"],
        lessons: [
          {
            id: "lesson_impactuni_financial_modelling",
            title: "Funding Pathways and Financial Modelling",
            description: "Compare grants, debt, equity, and bootstrapping while building a basic financial model.",
            content: "Learners develop a simple financial model and connect it to funding readiness across different capital pathways.",
            duration: 65,
            order: 1,
            learningObjectives: ["Build a basic model", "Compare capital pathways"],
          },
          {
            id: "lesson_impactuni_capstone_pitch",
            title: "Capstone Pitch Workflow",
            description: "Prepare a formal pitch with milestones, capital ask, delivery proof, and next-step clarity.",
            content: "Learners package venture or project evidence into a formal presentation suitable for mentors, institutions, or investors.",
            duration: 70,
            order: 2,
            learningObjectives: ["Structure a capstone pitch", "Present milestones and capital ask clearly"],
            artifact: {
              id: "artifact_capstone_pitch",
              title: "Capstone Pitch Workflow",
              description: "Submit your capstone pitch narrative, key milestones, ask, and readiness notes for review.",
              activityType: "CAPSTONE_PITCH",
              instructions: "Prepare your capstone pitch by summarising the opportunity, milestones, traction, capital or partnership ask, and next 90-day execution plan.",
              rubric: [
                { criterion: "Narrative quality", points: 25, description: "Pitch clearly explains the opportunity and why it matters" },
                { criterion: "Execution evidence", points: 25, description: "Milestones, traction, or proof points are credible" },
                { criterion: "Financial and capital clarity", points: 25, description: "Ask, use of funds, and model assumptions are understandable" },
                { criterion: "Presentation readiness", points: 25, description: "Pitch is structured, concise, and ready for stakeholder review" },
              ],
              maxPoints: 100,
              dueOffsetDays: 21,
              workflowSlug: "capstone-pitch-workflow",
            },
          },
        ],
      },
    ],
  },
];

async function upsertContentMetadata(prisma: PrismaClient, data: {
  resourceType: string;
  resourceId: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  curriculumLevel: CurriculumLevel;
  subjectStrand: string;
  learningObjectives: string[];
  learnerInstructions: string;
  applyComponentUrl: string;
  downloadableResources: string[];
}) {
  const existing = await prisma.contentMetadata.findFirst({
    where: { resourceType: data.resourceType, resourceId: data.resourceId },
  });

  const payload = {
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    title: data.title,
    shortDescription: data.shortDescription,
    longDescription: data.longDescription,
    curriculumLevel: data.curriculumLevel,
    ageGroup: data.curriculumLevel === CurriculumLevel.SENIOR_SECONDARY ? "15-18" : "18+",
    subjectStrand: data.subjectStrand,
    learningObjectives: data.learningObjectives,
    contentType: "INTERACTIVE",
    learnerInstructions: data.learnerInstructions,
    applyComponentUrl: data.applyComponentUrl,
    downloadableResources: data.downloadableResources,
    isPublished: true,
  };

  if (existing) {
    return prisma.contentMetadata.update({ where: { id: existing.id }, data: payload });
  }

  return prisma.contentMetadata.create({ data: payload });
}

export async function seedSeniorSecondaryAndImpactUniCurriculum(prisma: PrismaClient): Promise<SeedSummary> {
  const summary: SeedSummary = {
    frameworks: 0,
    courses: 0,
    curriculumModules: 0,
    courseModules: 0,
    lessons: 0,
    activities: 0,
    metadataRecords: 0,
    enrollments: 0,
  };

  const facilitator = await prisma.user.upsert({
    where: { email: "venture.facilitator@impactedu.local" },
    update: {
      firstName: "Venture",
      lastName: "Faculty",
      role: "FACILITATOR",
      institution: "ImpactEdu Venture Studio",
      programme: Programme.IMPACT_UNI,
    },
    create: {
      email: "venture.facilitator@impactedu.local",
      firstName: "Venture",
      lastName: "Faculty",
      passwordHash: "seeded-not-for-login",
      role: "FACILITATOR",
      state: "Lagos",
      institution: "ImpactEdu Venture Studio",
      programme: Programme.IMPACT_UNI,
      verified: true,
      emailVerified: true,
      isActive: true,
    },
  });

  const enrollableStudents = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      email: { in: ["student@example.com", "student@demo.com"] },
    },
  });

  for (const blueprint of ventureBlueprints) {
    const framework = await prisma.curriculumFramework.upsert({
      where: { level: blueprint.level },
      update: {
        name: blueprint.name,
        description: blueprint.description,
        signatureShift: blueprint.signatureShift,
        primaryOutcome: blueprint.primaryOutcome,
        minAge: blueprint.minAge,
        maxAge: blueprint.maxAge,
        durationWeeks: blueprint.durationWeeks,
        learningObjectives: blueprint.learningObjectives,
        competencyAreas: blueprint.competencyAreas,
        assessmentMethods: blueprint.assessmentMethods,
      },
      create: {
        level: blueprint.level,
        name: blueprint.name,
        description: blueprint.description,
        signatureShift: blueprint.signatureShift,
        primaryOutcome: blueprint.primaryOutcome,
        minAge: blueprint.minAge,
        maxAge: blueprint.maxAge,
        durationWeeks: blueprint.durationWeeks,
        learningObjectives: blueprint.learningObjectives,
        competencyAreas: blueprint.competencyAreas,
        assessmentMethods: blueprint.assessmentMethods,
      },
    });
    summary.frameworks += 1;

    const course = await prisma.course.upsert({
      where: { id: blueprint.course.id },
      update: {
        title: blueprint.course.title,
        description: blueprint.course.description,
        difficulty: blueprint.course.difficulty,
        duration: blueprint.course.duration,
        language: blueprint.course.language,
        instructor: blueprint.course.instructor,
        createdById: facilitator.id,
        isPublished: true,
        isArchived: false,
      },
      create: {
        id: blueprint.course.id,
        title: blueprint.course.title,
        description: blueprint.course.description,
        difficulty: blueprint.course.difficulty,
        duration: blueprint.course.duration,
        language: blueprint.course.language,
        instructor: blueprint.course.instructor,
        createdById: facilitator.id,
        isPublished: true,
      },
    });
    summary.courses += 1;

    for (const student of enrollableStudents) {
      await prisma.enrollment.upsert({
        where: { courseId_userId: { courseId: course.id, userId: student.id } },
        update: { lastAccessedAt: new Date() },
        create: {
          courseId: course.id,
          userId: student.id,
          progress: 0,
          enrolledAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });
      summary.enrollments += 1;
    }

    for (const moduleBlueprint of blueprint.modules) {
      const curriculumModule = await prisma.curriculumModule.upsert({
        where: { frameworkId_order: { frameworkId: framework.id, order: moduleBlueprint.order } },
        update: {
          title: moduleBlueprint.title,
          description: moduleBlueprint.description,
          order: moduleBlueprint.order,
          subjectStrand: moduleBlueprint.subjectStrand,
          competencies: moduleBlueprint.competencies,
          learningObjectives: moduleBlueprint.learningObjectives,
          estimatedWeeks: moduleBlueprint.estimatedWeeks,
          schoolId: null,
          publishStatus: PublishStatus.PUBLISHED,
        },
        create: {
          id: moduleBlueprint.id,
          frameworkId: framework.id,
          title: moduleBlueprint.title,
          description: moduleBlueprint.description,
          order: moduleBlueprint.order,
          subjectStrand: moduleBlueprint.subjectStrand,
          competencies: moduleBlueprint.competencies,
          learningObjectives: moduleBlueprint.learningObjectives,
          estimatedWeeks: moduleBlueprint.estimatedWeeks,
          schoolId: null,
          publishStatus: PublishStatus.PUBLISHED,
        },
      });
      summary.curriculumModules += 1;

      const courseModule = await prisma.module.upsert({
        where: { courseId_order: { courseId: course.id, order: moduleBlueprint.order } },
        update: {
          title: moduleBlueprint.title,
          description: moduleBlueprint.description,
          order: moduleBlueprint.order,
          ageGroup: blueprint.level === CurriculumLevel.SENIOR_SECONDARY ? "15-18" : "18+",
          subjectStrand: moduleBlueprint.subjectStrand,
          competencies: moduleBlueprint.competencies,
          estimatedWeeks: moduleBlueprint.estimatedWeeks,
        },
        create: {
          id: `module_${moduleBlueprint.id}`,
          courseId: course.id,
          title: moduleBlueprint.title,
          description: moduleBlueprint.description,
          order: moduleBlueprint.order,
          ageGroup: blueprint.level === CurriculumLevel.SENIOR_SECONDARY ? "15-18" : "18+",
          subjectStrand: moduleBlueprint.subjectStrand,
          competencies: moduleBlueprint.competencies,
          estimatedWeeks: moduleBlueprint.estimatedWeeks,
        },
      });
      summary.courseModules += 1;

      for (const lessonBlueprint of moduleBlueprint.lessons) {
        const lesson = await prisma.lesson.upsert({
          where: { id: lessonBlueprint.id },
          update: {
            courseId: course.id,
            moduleId: courseModule.id,
            curriculumModuleId: curriculumModule.id,
            title: lessonBlueprint.title,
            description: lessonBlueprint.description,
            content: lessonBlueprint.content,
            duration: lessonBlueprint.duration,
            order: lessonBlueprint.order,
            learningLayer: lessonBlueprint.learningLayer ?? "LEARN",
            instructions: lessonBlueprint.description,
            learningObjectives: lessonBlueprint.learningObjectives,
          },
          create: {
            id: lessonBlueprint.id,
            courseId: course.id,
            moduleId: courseModule.id,
            curriculumModuleId: curriculumModule.id,
            title: lessonBlueprint.title,
            description: lessonBlueprint.description,
            content: lessonBlueprint.content,
            duration: lessonBlueprint.duration,
            order: lessonBlueprint.order,
            learningLayer: lessonBlueprint.learningLayer ?? "LEARN",
            instructions: lessonBlueprint.description,
            learningObjectives: lessonBlueprint.learningObjectives,
          },
        });
        summary.lessons += 1;

        if (lessonBlueprint.artifact) {
          const dueDate = new Date(Date.now() + lessonBlueprint.artifact.dueOffsetDays * 24 * 60 * 60 * 1000);

          const activity = await prisma.activity.upsert({
            where: { id: lessonBlueprint.artifact.id },
            update: {
              courseId: course.id,
              moduleId: courseModule.id,
              lessonId: lesson.id,
              title: lessonBlueprint.artifact.title,
              description: lessonBlueprint.artifact.description,
              instructions: lessonBlueprint.artifact.instructions,
              activityType: lessonBlueprint.artifact.activityType,
              dueDate,
              maxPoints: lessonBlueprint.artifact.maxPoints,
              rubric: JSON.stringify(lessonBlueprint.artifact.rubric),
              attachments: [`/dashboard/venture?artifact=${lessonBlueprint.artifact.workflowSlug}`],
              order: lessonBlueprint.order,
              isPublished: true,
            },
            create: {
              id: lessonBlueprint.artifact.id,
              courseId: course.id,
              moduleId: courseModule.id,
              lessonId: lesson.id,
              title: lessonBlueprint.artifact.title,
              description: lessonBlueprint.artifact.description,
              instructions: lessonBlueprint.artifact.instructions,
              activityType: lessonBlueprint.artifact.activityType,
              dueDate,
              maxPoints: lessonBlueprint.artifact.maxPoints,
              rubric: JSON.stringify(lessonBlueprint.artifact.rubric),
              attachments: [`/dashboard/venture?artifact=${lessonBlueprint.artifact.workflowSlug}`],
              order: lessonBlueprint.order,
              isPublished: true,
            },
          });
          summary.activities += 1;

          await upsertContentMetadata(prisma, {
            resourceType: "ACTIVITY",
            resourceId: activity.id,
            title: activity.title,
            shortDescription: lessonBlueprint.artifact.description,
            longDescription: `${lessonBlueprint.artifact.instructions}\n\nThis artefact is part of ${moduleBlueprint.title} for ${blueprint.name}.`,
            curriculumLevel: blueprint.level,
            subjectStrand: moduleBlueprint.subjectStrand,
            learningObjectives: lessonBlueprint.learningObjectives,
            learnerInstructions: lessonBlueprint.artifact.instructions,
            applyComponentUrl: `/dashboard/venture?artifact=${lessonBlueprint.artifact.workflowSlug}`,
            downloadableResources: activity.attachments,
          });
          summary.metadataRecords += 1;
        }
      }
    }
  }

  return summary;
}