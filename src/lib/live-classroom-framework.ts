export type SessionStep = {
  order: number;
  key: string;
  label: string;
};

export type LiveSessionOpsEnvelope = {
  currentStepKey: string;
  polls: Array<{ id: string; question: string; options: string[]; isLive: boolean }>;
  breakouts: Array<{ id: string; name: string; learnerIds: string[]; moderatorId?: string }>;
  incidents: Array<{ id: string; note: string; severity: "LOW" | "MEDIUM" | "HIGH"; createdAt: string; createdBy: string }>;
  replay: { published: boolean; publishedAt?: string };
};

export type ProgressionInputs = {
  completionPercentage: number;
  assessmentAverage: number;
  projectSubmissionRate: number;
  liveParticipationScore: number;
};

export type ProgressionOutcome = {
  eligibleForProgression: boolean;
  blockers: string[];
  unlockedRecognition: string[];
};

export const LIVE_SESSION_SEQUENCE: SessionStep[] = [
  { order: 1, key: "WELCOME_RECAP", label: "Welcome and recap" },
  { order: 2, key: "KEY_CONCEPT_TEACHING", label: "Key concept teaching" },
  { order: 3, key: "SCENARIO_ACTIVITY", label: "Scenario, case, or activity" },
  { order: 4, key: "PARTICIPATION_QA", label: "Learner participation and questions" },
  { order: 5, key: "REFLECTION_CHALLENGE", label: "Reflection and challenge prompt" },
  { order: 6, key: "ASSIGNMENT_BRIEFING", label: "Assignment briefing" },
  { order: 7, key: "ATTENDANCE_CLOSE", label: "Attendance confirmation and close" },
];

export const PROGRESSION_THRESHOLDS = {
  completionPercentage: 70,
  assessmentAverage: 60,
  projectSubmissionRate: 60,
  liveParticipationScore: 60,
};

export function parseOpsEnvelope(raw: string | null | undefined): LiveSessionOpsEnvelope {
  if (!raw) {
    return defaultOpsEnvelope();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LiveSessionOpsEnvelope>;
    return {
      currentStepKey: parsed.currentStepKey || LIVE_SESSION_SEQUENCE[0].key,
      polls: parsed.polls || [],
      breakouts: parsed.breakouts || [],
      incidents: parsed.incidents || [],
      replay: parsed.replay || { published: false },
    };
  } catch {
    return defaultOpsEnvelope();
  }
}

export function defaultOpsEnvelope(): LiveSessionOpsEnvelope {
  return {
    currentStepKey: LIVE_SESSION_SEQUENCE[0].key,
    polls: [],
    breakouts: [],
    incidents: [],
    replay: { published: false },
  };
}

export function computeParticipationScore(input: {
  attendanceMinutes: number;
  expectedMinutes: number;
  quizAverage: number;
  submissionRate: number;
}): number {
  const attendanceComponent = Math.min(
    100,
    input.expectedMinutes > 0 ? (input.attendanceMinutes / input.expectedMinutes) * 100 : 0
  );

  const blended =
    attendanceComponent * 0.45 +
    Math.max(0, Math.min(100, input.quizAverage)) * 0.3 +
    Math.max(0, Math.min(100, input.submissionRate)) * 0.25;

  return Math.round(blended);
}

export function evaluateProgression(inputs: ProgressionInputs): ProgressionOutcome {
  const blockers: string[] = [];

  if (inputs.completionPercentage < PROGRESSION_THRESHOLDS.completionPercentage) {
    blockers.push("Completion threshold not met");
  }

  if (inputs.assessmentAverage < PROGRESSION_THRESHOLDS.assessmentAverage) {
    blockers.push("Assessment performance below threshold");
  }

  if (inputs.projectSubmissionRate < PROGRESSION_THRESHOLDS.projectSubmissionRate) {
    blockers.push("Project or practical submission threshold not met");
  }

  if (inputs.liveParticipationScore < PROGRESSION_THRESHOLDS.liveParticipationScore) {
    blockers.push("Live participation benchmark not met");
  }

  const unlockedRecognition: string[] = [];

  if (inputs.assessmentAverage >= 85) {
    unlockedRecognition.push("SKILL_BADGE_ACADEMIC_STRENGTH");
  }

  if (inputs.liveParticipationScore >= 90) {
    unlockedRecognition.push("ATTENDANCE_RECOGNITION_HIGHLY_PRESENT");
  }

  if (inputs.projectSubmissionRate >= 90) {
    unlockedRecognition.push("SHOWCASE_AWARD_PROJECT_EXECUTION");
  }

  if (blockers.length === 0) {
    unlockedRecognition.push("FACILITATOR_RECOMMENDATION_MARKER");
  }

  return {
    eligibleForProgression: blockers.length === 0,
    blockers,
    unlockedRecognition,
  };
}
