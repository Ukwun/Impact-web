/**
 * Mock data for testing Curriculum Framework, Subscriptions, and Weekly Rhythms
 * Used when database is unavailable - simulates realistic data
 */

// ============================================================================
// CURRICULUM FRAMEWORK MOCK DATA
// ============================================================================

export const mockCurriculumFrameworks = {
  success: true,
  count: 4,
  data: [
{
      id: "cf-primary-001",
      level: "PRIMARY",
      name: "Primary School Foundations",
      signatureShift: "From awareness to healthy daily financial habits",
      primaryOutcome: "Develop foundational money awareness and good financial habits through age-appropriate activities",
      minAge: 7,
      maxAge: 11,
      moduleCount: 8,
      totalLessons: 48,
      estimatedDuration: "8-12 weeks",
      modules: [
        {
          id: "mod-primary-01",
          title: "Money Basics: What is Money?",
          lessons: [
            { id: "lesson-01", title: "Where Does Money Come From?" },
            { id: "lesson-02", title: "Different Types of Money" },
            { id: "lesson-03", title: "Money Around the World" }
          ]
        },
        {
          id: "mod-primary-02",
          title: "Saving & Spending",
          lessons: [
            { id: "lesson-04", title: "Why We Save" },
            { id: "lesson-05", title: "Smart Spending" },
            { id: "lesson-06", title: "My First Savings Goal" }
          ]
        },
        {
          id: "mod-primary-03",
          title: "Family Finances",
          lessons: [
            { id: "lesson-07", title: "How Families Earn Money" },
            { id: "lesson-08", title: "Household Budgeting" }
          ]
        },
        {
          id: "mod-primary-04",
          title: "Money Habits",
          lessons: [
            { id: "lesson-09", title: "Daily Money Decisions" },
            { id: "lesson-10", title: "Long-term Financial Goals" }
          ]
        },
        {
          id: "mod-primary-05",
          title: "Giving & Sharing",
          lessons: [
            { id: "lesson-11", title: "The Joy of Giving" },
            { id: "lesson-12", title: "Community Support" }
          ]
        },
        {
          id: "mod-primary-06",
          title: "Entrepreneurship Basics",
          lessons: [
            { id: "lesson-13", title: "What is a Business?" },
            { id: "lesson-14", title: "My First Business Idea" }
          ]
        },
        {
          id: "mod-primary-07",
          title: "Digital Money",
          lessons: [
            { id: "lesson-15", title: "Online Shopping Safety" },
            { id: "lesson-16", title: "Digital Wallets" }
          ]
        },
        {
          id: "mod-primary-08",
          title: "Financial Decision Making",
          lessons: [
            { id: "lesson-17", title: "Making Good Choices with Money" },
            { id: "lesson-18", title: "My Financial Story" }
          ]
        }
      ]
    },
    {
      id: "cf-junior-001",
      level: "JUNIOR_SECONDARY",
      name: "Junior Secondary: Practical Application",
      signatureShift: "From understanding to real-world practice and practical applications",
      primaryOutcome: "Apply financial knowledge to real situations, develop budgeting skills, and explore practical entrepreneurship",
      minAge: 12,
      maxAge: 14,
      moduleCount: 8,
      totalLessons: 56,
      estimatedDuration: "12-16 weeks",
      modules: [
        {
          id: "mod-junior-01",
          title: "Advanced Money Management",
          lessons: [
            { id: "lesson-101", title: "Personal Banking Basics" },
            { id: "lesson-102", title: "Credit and Debt" },
            { id: "lesson-103", title: "Investment Fundamentals" }
          ]
        },
        {
          id: "mod-junior-02",
          title: "My First Budget",
          lessons: [
            { id: "lesson-104", title: "Income Tracking" },
            { id: "lesson-105", title: "Expense Categories" },
            { id: "lesson-106", title: "Creating My Budget" }
          ]
        },
        {
          id: "mod-junior-03",
          title: "Earning Money",
          lessons: [
            { id: "lesson-107", title: "Part-time Jobs" },
            { id: "lesson-108", title: "Gig Economy Work" },
            { id: "lesson-109", title: "Negotiating Pay" }
          ]
        },
        {
          id: "mod-junior-04",
          title: "Smart Shopping",
          lessons: [
            { id: "lesson-110", title: "Comparing Prices" },
            { id: "lesson-111", title: "Avoiding Impulse Purchases" },
            { id: "lesson-112", title: "Consumer Rights" }
          ]
        },
        {
          id: "mod-junior-05",
          title: "Entrepreneurship Projects",
          lessons: [
            { id: "lesson-113", title: "Business Idea Generation" },
            { id: "lesson-114", title: "Market Research" },
            { id: "lesson-115", title: "Simple Business Plan" }
          ]
        },
        {
          id: "mod-junior-06",
          title: "Goals & Planning",
          lessons: [
            { id: "lesson-116", title: "Short-term vs Long-term Goals" },
            { id: "lesson-117", title: "Action Plans" },
            { id: "lesson-118", title: "Tracking Progress" }
          ]
        },
        {
          id: "mod-junior-07",
          title: "Digital Financial Security",
          lessons: [
            { id: "lesson-119", title: "Online Scams & Fraud" },
            { id: "lesson-120", title: "Password Security" },
            { id: "lesson-121", title: "Privacy Online" }
          ]
        },
        {
          id: "mod-junior-08",
          title: "Understanding the Economy",
          lessons: [
            { id: "lesson-122", title: "Supply & Demand" },
            { id: "lesson-123", title: "Job Markets" },
            { id: "lesson-124", title: "Economic Indicators" }
          ]
        }
      ]
    },
    {
      id: "cf-senior-001",
      level: "SENIOR_SECONDARY",
      name: "Senior Secondary: Enterprise Readiness",
      signatureShift: "From ideas to planning, pitching, and investment awareness",
      primaryOutcome: "Develop comprehensive entrepreneurship skills, create real business plans, and understand venture funding",
      minAge: 15,
      maxAge: 18,
      moduleCount: 8,
      totalLessons: 64,
      estimatedDuration: "16-20 weeks",
      modules: [
        {
          id: "mod-senior-01",
          title: "Venture Planning",
          lessons: [
            { id: "lesson-201", title: "Business Model Canvas" },
            { id: "lesson-202", title: "Value Proposition" },
            { id: "lesson-203", title: "Revenue Models" }
          ]
        },
        {
          id: "mod-senior-02",
          title: "Market Validation",
          lessons: [
            { id: "lesson-204", title: "User Research Methods" },
            { id: "lesson-205", title: "Competitive Analysis" },
            { id: "lesson-206", title: "Market Sizing" }
          ]
        },
        {
          id: "mod-senior-03",
          title: "Financial Projections",
          lessons: [
            { id: "lesson-207", title: "Pro Forma Financials" },
            { id: "lesson-208", title: "Cash Flow Forecasting" },
            { id: "lesson-209", title: "Break-even Analysis" }
          ]
        },
        {
          id: "mod-senior-04",
          title: "Pitch Preparation",
          lessons: [
            { id: "lesson-210", title: "Elevator Pitches" },
            { id: "lesson-211", title: "Presentation Skills" },
            { id: "lesson-212", title: "Investor Communication" }
          ]
        },
        {
          id: "mod-senior-05",
          title: "Funding & Capital",
          lessons: [
            { id: "lesson-213", title: "Bootstrapping" },
            { id: "lesson-214", title: "Angel Investing" },
            { id: "lesson-215", title: "Venture Capital" }
          ]
        },
        {
          id: "mod-senior-06",
          title: "Legal & Compliance",
          lessons: [
            { id: "lesson-216", title: "Business Structure" },
            { id: "lesson-217", title: "Business Registration" },
            { id: "lesson-218", title: "Contracts & Agreements" }
          ]
        },
        {
          id: "mod-senior-07",
          title: "Team Building",
          lessons: [
            { id: "lesson-219", title: "Co-founder Dynamics" },
            { id: "lesson-220", title: "Building Your Advisory Board" },
            { id: "lesson-221", title: "Equity & Compensation" }
          ]
        },
        {
          id: "mod-senior-08",
          title: "Scaling & Growth",
          lessons: [
            { id: "lesson-222", title: "Growth Strategies" },
            { id: "lesson-223", title: "Marketing & Sales" },
            { id: "lesson-224", title: "Pivoting & Iteration" }
          ]
        }
      ]
    },
    {
      id: "cf-impactuni-001",
      level: "IMPACTUNI",
      name: "Impact University: Execution & Capital",
      signatureShift: "From readiness to venture building, employment, and capital access",
      primaryOutcome: "Build ventures, secure funding, navigate early-stage challenges, and prepare for employment or entrepreneurship",
      minAge: 18,
      maxAge: 100,
      moduleCount: 8,
      totalLessons: 72,
      estimatedDuration: "20-24 weeks",
      modules: [
        {
          id: "mod-uni-01",
          title: "Venture Building Bootcamp",
          lessons: [
            { id: "lesson-301", title: "MVP Development" },
            { id: "lesson-302", title: "Go-to-Market Strategy" },
            { id: "lesson-303", title: "Customer Acquisition" }
          ]
        },
        {
          id: "mod-uni-02",
          title: "Fundraising Masterclass",
          lessons: [
            { id: "lesson-304", title: "Investor Pitching" },
            { id: "lesson-305", title: "Term Sheet Negotiation" },
            { id: "lesson-306", title: "Due Diligence Process" }
          ]
        },
        {
          id: "mod-uni-03",
          title: "Financial Management",
          lessons: [
            { id: "lesson-307", title: "Cap Table Management" },
            { id: "lesson-308", title: "GAAP vs Accrual Accounting" },
            { id: "lesson-309", title: "Financial Reporting for Investors" }
          ]
        },
        {
          id: "mod-uni-04",
          title: "Core Competencies",
          lessons: [
            { id: "lesson-310", title: "Leadership Skills" },
            { id: "lesson-311", title: "Strategic Planning" },
            { id: "lesson-312", title: "Organizational Development" }
          ]
        },
        {
          id: "mod-uni-05",
          title: "Career Navigation",
          lessons: [
            { id: "lesson-313", title: "Job Search Strategies" },
            { id: "lesson-314", title: "Salary Negotiation" },
            { id: "lesson-315", title: "Building Your Personal Brand" }
          ]
        },
        {
          id: "mod-uni-06",
          title: "Advanced Financing",
          lessons: [
            { id: "lesson-316", title: "Debt Financing" },
            { id: "lesson-317", title: "Strategic Partnerships" },
            { id: "lesson-318", title: "M&A Fundamentals" }
          ]
        },
        {
          id: "mod-uni-07",
          title: "Impact & Social Enterprise",
          lessons: [
            { id: "lesson-319", title: "Social Impact Investing" },
            { id: "lesson-320", title: "B-Corp & Social Enterprise" },
            { id: "lesson-321", title: "Measuring Impact" }
          ]
        },
        {
          id: "mod-uni-08",
          title: "Legacy & Mentorship",
          lessons: [
            { id: "lesson-322", title: "Mentoring Others" },
            { id: "lesson-323", title: "Giving Back" },
            { id: "lesson-324", title: "Building Your Network" }
          ]
        }
      ]
    }
  ]
};

// ============================================================================
// SUBSCRIPTION PLANS MOCK DATA
// ============================================================================

export const mockSubscriptionPlans = {
  success: true,
  data: {
    availablePlans: [
      {
        id: "plan-ind-basic",
        tierType: "INDIVIDUAL_BASIC",
        name: "Individual Basic",
        monthlyPrice: 5,
        maxUsers: null,
        features: ["Access to all curricula", "Mobile learning", "Basic progress tracking"],
        canAccessAnalytics: false,
        canManageFacilitators: false,
        canIntegrateSIS: false
      },
      {
        id: "plan-ind-premium",
        tierType: "INDIVIDUAL_PREMIUM",
        name: "Individual Premium",
        monthlyPrice: 15,
        maxUsers: null,
        features: ["All Basic features", "Advanced analytics", "Certification support", "Personal mentor"],
        canAccessAnalytics: true,
        canManageFacilitators: false,
        canIntegrateSIS: false
      },
      {
        id: "plan-school-starter",
        tierType: "SCHOOL_STARTER",
        name: "School Starter",
        monthlyPrice: 200,
        maxUsers: 50,
        features: ["50 student seats", "Basic dashboard", "Facilitator tools", "Monthly support"],
        canAccessAnalytics: true,
        canManageFacilitators: true,
        canIntegrateSIS: false
      },
      {
        id: "plan-school-growth",
        tierType: "SCHOOL_GROWTH",
        name: "School Growth",
        monthlyPrice: 400,
        maxUsers: 200,
        features: ["200 student seats", "Advanced dashboard", "Multiple facilitators", "Priority support", "Basic SIS"],
        canAccessAnalytics: true,
        canManageFacilitators: true,
        canIntegrateSIS: true
      },
      {
        id: "plan-school-enterprise",
        tierType: "SCHOOL_ENTERPRISE",
        name: "School Enterprise",
        monthlyPrice: null,
        maxUsers: null,
        features: ["Unlimited seats", "Custom integrations", "Dedicated support", "Custom curriculum"],
        canAccessAnalytics: true,
        canManageFacilitators: true,
        canIntegrateSIS: true
      },
      {
        id: "plan-inst-partner",
        tierType: "INSTITUTIONAL_PARTNER",
        name: "Institutional Partner",
        monthlyPrice: null,
        maxUsers: null,
        features: ["District-wide access", "Custom SIS integration", "White-label options"],
        canAccessAnalytics: true,
        canManageFacilitators: true,
        canIntegrateSIS: true
      }
    ],
    currentSubscriptions: [
      {
        id: "sub-001",
        subscriberId: "user-123",
        planId: "plan-ind-basic",
        status: "ACTIVE",
        schoolName: null,
        plan: {
          tierType: "INDIVIDUAL_BASIC",
          name: "Individual Basic",
          monthlyPrice: 5
        }
      }
    ],
    canSubscribe: true
  }
};

// ============================================================================
// WEEKLY SCHEDULE MOCK DATA
// ============================================================================

export const mockWeeklySchedules = {
  "mod-primary-01": {
    weeks: [
      {
        weekNumber: 1,
        mondayLessonId: "lesson-01",
        mondayLessonType: "EXPLAINER_VIDEO",
        tuesdayActivityIds: ["activity-01", "activity-02"],
        tuesdayTheme: "Identifying Money",
        wednesdayLiveSessionId: "live-session-01",
        fridayAssessmentIds: ["quiz-01"],
        fridayQuizId: "quiz-01",
        weekendActivityIds: ["activity-03"],
        familyEngagementPrompt: "Ask your family: Where does our family's money come from?"
      },
      {
        weekNumber: 2,
        mondayLessonId: "lesson-02",
        tuesdayActivityIds: ["activity-04", "activity-05"],
        tuesdayTheme: "Types of Currency",
        wednesdayLiveSessionId: "live-session-02",
        fridayQuizId: "quiz-02",
        familyEngagementPrompt: "Collect different coins and currencies with your family"
      }
    ]
  }
};

export default {
  mockCurriculumFrameworks,
  mockSubscriptionPlans,
  mockWeeklySchedules
};
