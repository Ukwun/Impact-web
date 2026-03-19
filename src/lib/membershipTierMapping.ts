/**
 * Role-to-Membership-Tier Mapping Utility
 * Maps existing UserRole to new MembershipTierType for backward compatibility
 */

import { UserRole, MembershipTierType } from "@prisma/client";

/**
 * Map UserRole to MembershipTierType
 * Handles both new users and existing users gracefully
 */
export const roleToTierMapping: Record<UserRole, MembershipTierType> = {
  STUDENT: MembershipTierType.STUDENT_MEMBER,
  UNI_MEMBER: MembershipTierType.CAMPUS_MEMBER,
  CIRCLE_MEMBER: MembershipTierType.YOUNG_PROFESSIONAL_MEMBER,
  FACILITATOR: MembershipTierType.MENTOR_FACULTY_MEMBER,
  MENTOR: MembershipTierType.MENTOR_FACULTY_MEMBER,
  SCHOOL_ADMIN: MembershipTierType.CHAPTER_LEAD_AMBASSADOR,
  PARENT: MembershipTierType.STUDENT_MEMBER, // Parents get student tier
  ADMIN: MembershipTierType.INSTITUTIONAL_PARTNER, // Admins get partner tier
};

/**
 * Get the appropriate membership tier for a user role
 */
export function getMembershipTierForRole(role: UserRole): MembershipTierType {
  return roleToTierMapping[role] || MembershipTierType.STUDENT_MEMBER;
}

/**
 * Get the tier ID from tier type
 * Maps MembershipTierType to actual tier IDs from database
 */
const tierIdMap: Record<MembershipTierType, string> = {
  STUDENT_MEMBER: "tier_student",
  CAMPUS_MEMBER: "tier_campus",
  YOUNG_PROFESSIONAL_MEMBER: "tier_professional",
  MENTOR_FACULTY_MEMBER: "tier_mentor",
  CHAPTER_LEAD_AMBASSADOR: "tier_leader",
  INSTITUTIONAL_PARTNER: "tier_partner",
};

/**
 * Get tier ID from tier type
 */
export function getTierIdFromType(tierType: MembershipTierType): string {
  return tierIdMap[tierType];
}

/**
 * Reverse lookup: Get tier type from ID
 */
const tierTypeMap: Record<string, MembershipTierType> = Object.entries(tierIdMap).reduce(
  (acc, [tierType, tierId]) => {
    acc[tierId] = tierType as MembershipTierType;
    return acc;
  },
  {} as Record<string, MembershipTierType>
);

export function getTierTypeFromId(tierId: string): MembershipTierType | null {
  return tierTypeMap[tierId] || null;
}

/**
 * Get tier details for a role
 */
export interface TierDetails {
  id: string;
  tierType: MembershipTierType;
  name: string;
  description: string;
  canAccessLearning: boolean;
  canParticipateEvents: boolean;
  canAccessCommunity: boolean;
  canAccessMentorship: boolean;
  canCreateContent: boolean;
  canManageChapter: boolean;
}

/**
 * Default tier configurations
 */
const tierConfigurations: Record<MembershipTierType, TierDetails> = {
  STUDENT_MEMBER: {
    id: "tier_student",
    tierType: MembershipTierType.STUDENT_MEMBER,
    name: "Student Member",
    description: "For learners beginning their journey",
    canAccessLearning: true,
    canParticipateEvents: true,
    canAccessCommunity: true,
    canAccessMentorship: false,
    canCreateContent: false,
    canManageChapter: false,
  },
  CAMPUS_MEMBER: {
    id: "tier_campus",
    tierType: MembershipTierType.CAMPUS_MEMBER,
    name: "Campus Member",
    description: "For university students and scholars",
    canAccessLearning: true,
    canParticipateEvents: true,
    canAccessCommunity: true,
    canAccessMentorship: true,
    canCreateContent: false,
    canManageChapter: false,
  },
  YOUNG_PROFESSIONAL_MEMBER: {
    id: "tier_professional",
    tierType: MembershipTierType.YOUNG_PROFESSIONAL_MEMBER,
    name: "Young Professional",
    description: "For professionals in early career",
    canAccessLearning: true,
    canParticipateEvents: true,
    canAccessCommunity: true,
    canAccessMentorship: true,
    canCreateContent: false,
    canManageChapter: false,
  },
  MENTOR_FACULTY_MEMBER: {
    id: "tier_mentor",
    tierType: MembershipTierType.MENTOR_FACULTY_MEMBER,
    name: "Mentor / Faculty Member",
    description: "For educators and industry experts",
    canAccessLearning: true,
    canParticipateEvents: true,
    canAccessCommunity: true,
    canAccessMentorship: true,
    canCreateContent: true,
    canManageChapter: false,
  },
  CHAPTER_LEAD_AMBASSADOR: {
    id: "tier_leader",
    tierType: MembershipTierType.CHAPTER_LEAD_AMBASSADOR,
    name: "Chapter Lead / Ambassador",
    description: "For community organizers and leaders",
    canAccessLearning: true,
    canParticipateEvents: true,
    canAccessCommunity: true,
    canAccessMentorship: true,
    canCreateContent: true,
    canManageChapter: true,
  },
  INSTITUTIONAL_PARTNER: {
    id: "tier_partner",
    tierType: MembershipTierType.INSTITUTIONAL_PARTNER,
    name: "Institutional Partner",
    description: "For schools, universities, and organizations",
    canAccessLearning: true,
    canParticipateEvents: true,
    canAccessCommunity: true,
    canAccessMentorship: true,
    canCreateContent: true,
    canManageChapter: true,
  },
};

/**
 * Get complete tier configuration
 */
export function getTierConfiguration(tierType: MembershipTierType): TierDetails {
  return tierConfigurations[tierType];
}

/**
 * Get tier configuration by ID
 */
export function getTierConfigurationById(tierId: string): TierDetails | null {
  const tierType = getTierTypeFromId(tierId);
  return tierType ? tierConfigurations[tierType] : null;
}

/**
 * Check if user with a tier has permission for specific action
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

export function checkTierPermission(
  tierDetails: TierDetails | null,
  permission: keyof Pick<
    TierDetails,
    | "canAccessLearning"
    | "canParticipateEvents"
    | "canAccessCommunity"
    | "canAccessMentorship"
    | "canCreateContent"
    | "canManageChapter"
  >
): PermissionCheck {
  if (!tierDetails) {
    return { allowed: false, reason: "User has no membership tier" };
  }

  const allowed = tierDetails[permission] === true;
  return {
    allowed,
    reason: allowed
      ? undefined
      : `Your ${tierDetails.name} membership does not include ${permission}`,
  };
}

/**
 * Get all available tiers (for admin/management interfaces)
 */
export function getAllTiers(): TierDetails[] {
  return Object.values(tierConfigurations);
}

/**
 * Get tier by name (for admin interfaces)
 */
export function getTierByName(name: string): TierDetails | null {
  return (
    Object.values(tierConfigurations).find((t) => t.name === name) || null
  );
}
