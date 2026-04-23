/**
 * Menu Configuration for All User Roles
 * Defines sidebar menus, submenus, icons, and CTAs per role
 */

import {
  LayoutDashboard,
  BookOpen,
  Target,
  Award,
  MessageSquare,
  HelpCircle,
  Settings,
  Users,
  ClipboardList,
  TrendingUp,
  Briefcase,
  Network,
  Zap,
  Rocket,
  Lightbulb,
  Calendar,
  FileText,
  Bell,
  BarChart3,
  Building2,
  GraduationCap,
  Lightbulb as Brain,
  PieChart,
  AlertCircle,
} from 'lucide-react';

export type UserRole = 
  | 'student' 
  | 'parent' 
  | 'facilitator' 
  | 'school_admin' 
  | 'university_member' 
  | 'professional' 
  | 'mentor' 
  | 'platform_admin';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  badge?: string | number;
  isPrimary?: boolean; // Highlights as primary CTA
  subItems?: SubMenuItem[];
}

export interface SubMenuItem {
  id: string;
  label: string;
  href: string;
  description?: string;
}

export interface RoleMenuConfig {
  role: UserRole;
  displayName: string;
  menuItems: MenuItem[];
  primaryCta: string; // Label of primary CTA button
  mobileBottomTabs: MobileTab[];
  backgroundGradient: string; // CSS gradient for dashboard background
  accentColor: string; // Primary accent color for role
}

export interface MobileTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href: string;
}

// ============================================
// 1. STUDENT (ImpactSchool)
// ============================================
export const studentMenuConfig: RoleMenuConfig = {
  role: 'student',
  displayName: 'Student',
  primaryCta: 'Continue Learning',
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'learning-journey',
      label: 'Learning Journey',
      icon: BookOpen,
      href: '/dashboard/learning-journey',
      subItems: [
        { id: 'continue', label: 'Continue Learning', href: '/dashboard/learning-journey/continue' },
        { id: 'courses', label: 'My Courses', href: '/dashboard/courses' },
        { id: 'assignments', label: 'Assignments', href: '/dashboard/assignments' },
        { id: 'progress', label: 'Progress Tracker', href: '/dashboard/progress' },
      ],
    },
    {
      id: 'projects',
      label: 'Projects & Activities',
      icon: Target,
      href: '/dashboard/projects',
      subItems: [
        { id: 'my-projects', label: 'My Projects', href: '/dashboard/projects' },
        { id: 'challenges', label: 'Challenges', href: '/dashboard/challenges' },
        { id: 'activities', label: 'Upcoming Activities', href: '/dashboard/activities' },
      ],
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      href: '/achievements',
      subItems: [
        { id: 'badges', label: 'Badges', href: '/achievements/badges' },
        { id: 'certificates', label: 'Certificates', href: '/achievements/certificates' },
        { id: 'leaderboard', label: 'Leaderboard', href: '/leaderboard' },
      ],
    },
    {
      id: 'community',
      label: 'Community',
      icon: MessageSquare,
      href: '/dashboard/community',
      subItems: [
        { id: 'messages', label: 'Messages', href: '/dashboard/messages' },
        { id: 'class-group', label: 'Class Group', href: '/dashboard/class-group' },
        { id: 'announcements', label: 'Announcements', href: '/dashboard/announcements' },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: HelpCircle,
      href: '/dashboard/resources',
      subItems: [
        { id: 'library', label: 'Learning Library', href: '/dashboard/resources/library' },
        { id: 'guides', label: 'Help & Guides', href: '/dashboard/resources/guides' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Settings,
      href: '/dashboard/profile',
      subItems: [
        { id: 'my-profile', label: 'My Profile', href: '/dashboard/profile' },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
      ],
    },
  ],
  mobileBottomTabs: [
    { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'learn', label: 'Learn', icon: BookOpen, href: '/dashboard/learning-journey' },
    { id: 'activities', label: 'Activities', icon: Target, href: '/dashboard/projects' },
    { id: 'achievements', label: 'Achievements', icon: Award, href: '/achievements' },
    { id: 'profile', label: 'Profile', icon: Settings, href: '/dashboard/profile' },
  ],
  backgroundGradient: 'from-purple-600 via-blue-500 to-cyan-500',
  accentColor: 'from-purple-500 to-blue-500',
};

// ============================================
// 2. PARENT / GUARDIAN
// ============================================
export const parentMenuConfig: RoleMenuConfig = {
  role: 'parent',
  displayName: 'Parent / Guardian',
  primaryCta: 'View Child Progress',
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'my-child',
      label: 'My Child',
      icon: Users,
      href: '/dashboard/children',
      isPrimary: true,
      subItems: [
        { id: 'progress', label: 'Progress Overview', href: '/dashboard/children/progress' },
        { id: 'attendance', label: 'Attendance', href: '/dashboard/children/attendance' },
        { id: 'achievements', label: 'Achievements', href: '/dashboard/children/achievements' },
        { id: 'feedback', label: 'Feedback', href: '/dashboard/children/feedback' },
      ],
    },
    {
      id: 'activities',
      label: 'Activities',
      icon: Calendar,
      href: '/dashboard/activities',
      subItems: [
        { id: 'upcoming', label: 'Upcoming Activities', href: '/dashboard/activities/upcoming' },
        { id: 'events', label: 'School Events', href: '/dashboard/activities/events' },
        { id: 'deadlines', label: 'Deadlines', href: '/dashboard/activities/deadlines' },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      href: '/dashboard/communication',
      subItems: [
        { id: 'messages', label: 'Messages', href: '/dashboard/messages' },
        { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications' },
        { id: 'updates', label: 'School Updates', href: '/dashboard/school-updates' },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: HelpCircle,
      href: '/dashboard/resources',
      subItems: [
        { id: 'guides', label: 'Parent Guides', href: '/dashboard/resources/guides' },
        { id: 'support', label: 'Support Materials', href: '/dashboard/resources/support' },
      ],
    },
    {
      id: 'billing',
      label: 'Billing / Support',
      icon: Briefcase,
      href: '/dashboard/billing',
      subItems: [
        { id: 'payments', label: 'Payments', href: '/dashboard/billing/payments' },
        { id: 'sponsorship', label: 'Sponsorship Status', href: '/dashboard/billing/sponsorship' },
        { id: 'help', label: 'Help', href: '/dashboard/help' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Settings,
      href: '/dashboard/profile',
      subItems: [
        { id: 'my-profile', label: 'My Profile', href: '/dashboard/profile' },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
      ],
    },
  ],
  mobileBottomTabs: [
    { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'child', label: 'Child', icon: Users, href: '/dashboard/children' },
    { id: 'activities', label: 'Activities', icon: Calendar, href: '/dashboard/activities' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { id: 'profile', label: 'Profile', icon: Settings, href: '/dashboard/profile' },
  ],
  backgroundGradient: 'from-green-600 via-emerald-500 to-teal-500',
  accentColor: 'from-green-500 to-teal-500',
};

// ============================================
// 3. FACILITATOR
// ============================================
export const facilitatorMenuConfig: RoleMenuConfig = {
  role: 'facilitator',
  displayName: 'Facilitator',
  primaryCta: 'Start Class',
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'classes',
      label: 'Classes',
      icon: GraduationCap,
      href: '/dashboard/classes',
      isPrimary: true,
      subItems: [
        { id: 'today', label: "Today's Classes", href: '/dashboard/classes/today' },
        { id: 'all', label: 'All Classes', href: '/dashboard/classes' },
        { id: 'attendance', label: 'Attendance', href: '/dashboard/classes/attendance' },
      ],
    },
    {
      id: 'learners',
      label: 'Learners',
      icon: Users,
      href: '/dashboard/learners',
      subItems: [
        { id: 'list', label: 'Student List', href: '/dashboard/learners' },
        { id: 'performance', label: 'Performance', href: '/dashboard/learners/performance' },
        { id: 'alerts', label: 'Alerts', href: '/dashboard/learners/alerts' },
      ],
    },
    {
      id: 'teaching',
      label: 'Teaching',
      icon: BookOpen,
      href: '/dashboard/teaching',
      subItems: [
        { id: 'curriculum', label: 'Curriculum Delivery', href: '/dashboard/teaching/curriculum' },
        { id: 'assignments', label: 'Assignments', href: '/dashboard/teaching/assignments' },
        { id: 'resources', label: 'Resources', href: '/dashboard/teaching/resources' },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      href: '/dashboard/communication',
      subItems: [
        { id: 'messages', label: 'Messages', href: '/dashboard/messages' },
        { id: 'announcements', label: 'Announcements', href: '/dashboard/announcements' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      href: '/dashboard/reports',
      subItems: [
        { id: 'class-reports', label: 'Class Reports', href: '/dashboard/reports/class' },
        { id: 'certification', label: 'Certification Readiness', href: '/dashboard/reports/certification' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Settings,
      href: '/dashboard/profile',
      subItems: [
        { id: 'my-profile', label: 'My Profile', href: '/dashboard/profile' },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
      ],
    },
  ],
  mobileBottomTabs: [
    { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'classes', label: 'Classes', icon: GraduationCap, href: '/dashboard/classes' },
    { id: 'learners', label: 'Learners', icon: Users, href: '/dashboard/learners' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
    { id: 'profile', label: 'Profile', icon: Settings, href: '/dashboard/profile' },
  ],
  backgroundGradient: 'from-orange-600 via-amber-500 to-yellow-500',
  accentColor: 'from-orange-500 to-amber-500',
};

// ============================================
// 4. SCHOOL ADMINISTRATOR
// ============================================
export const schoolAdminMenuConfig: RoleMenuConfig = {
  role: 'school_admin',
  displayName: 'School Administrator',
  primaryCta: 'View Reports',
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'school-overview',
      label: 'School Overview',
      icon: Building2,
      href: '/dashboard/school-overview',
      subItems: [
        { id: 'performance', label: 'School Performance', href: '/dashboard/school-overview/performance' },
        { id: 'attendance', label: 'Attendance', href: '/dashboard/school-overview/attendance' },
        { id: 'engagement', label: 'Engagement', href: '/dashboard/school-overview/engagement' },
      ],
    },
    {
      id: 'facilitators',
      label: 'Facilitators',
      icon: Users,
      href: '/dashboard/facilitators',
      subItems: [
        { id: 'list', label: 'Facilitator List', href: '/dashboard/facilitators' },
        { id: 'performance', label: 'Performance', href: '/dashboard/facilitators/performance' },
        { id: 'activity', label: 'Activity', href: '/dashboard/facilitators/activity' },
      ],
    },
    {
      id: 'students',
      label: 'Students',
      icon: GraduationCap,
      href: '/dashboard/students',
      subItems: [
        { id: 'analytics', label: 'Progress Analytics', href: '/dashboard/students/analytics' },
        { id: 'certification', label: 'Certification Status', href: '/dashboard/students/certification' },
      ],
    },
    {
      id: 'programmes',
      label: 'Programmes',
      icon: Calendar,
      href: '/dashboard/programmes',
      subItems: [
        { id: 'active', label: 'Active Programmes', href: '/dashboard/programmes/active' },
        { id: 'calendar', label: 'Calendar', href: '/dashboard/programmes/calendar' },
        { id: 'events', label: 'Events', href: '/dashboard/programmes/events' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      href: '/dashboard/reports',
      isPrimary: true,
      subItems: [
        { id: 'downloads', label: 'Downloads', href: '/dashboard/reports/downloads' },
        { id: 'institutional', label: 'Institutional Reports', href: '/dashboard/reports/institutional' },
      ],
    },
    {
      id: 'curriculum',
      label: 'Curriculum',
      icon: BookOpen,
      href: '/dashboard/admin/curriculum/modules',
      subItems: [
        { id: 'frameworks', label: 'Frameworks', href: '/dashboard/admin/curriculum/frameworks' },
        { id: 'modules', label: 'Modules', href: '/dashboard/admin/curriculum/modules' },
        { id: 'lessons', label: 'Lessons', href: '/dashboard/admin/curriculum/lessons' },
        { id: 'activities', label: 'Activities', href: '/dashboard/admin/curriculum/activities' },
        { id: 'review-queue', label: 'Review Queue', href: '/dashboard/admin/curriculum/review-queue' },
      ],
    },
    {
      id: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      href: '/dashboard/communication',
      subItems: [
        { id: 'ncdf', label: 'NCDF Updates', href: '/dashboard/communication/ncdf' },
        { id: 'messages', label: 'Messages', href: '/dashboard/messages' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Settings,
      href: '/dashboard/profile',
      subItems: [
        { id: 'school-profile', label: 'School Profile', href: '/dashboard/profile/school' },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
      ],
    },
  ],
  mobileBottomTabs: [
    { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'school', label: 'School', icon: Building2, href: '/dashboard/school-overview' },
    { id: 'students', label: 'Students', icon: GraduationCap, href: '/dashboard/students' },
    { id: 'curriculum', label: 'Curriculum', icon: BookOpen, href: '/dashboard/admin/curriculum/modules' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
  ],
  backgroundGradient: 'from-blue-600 via-indigo-500 to-purple-500',
  accentColor: 'from-blue-500 to-indigo-500',
};

// ============================================
// 5. UNIVERSITY MEMBER (ImpactUni)
// ============================================
export const universityMemberMenuConfig: RoleMenuConfig = {
  role: 'university_member',
  displayName: 'University Member',
  primaryCta: 'Continue Venture',
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'venture-journey',
      label: 'My Venture Journey',
      icon: Rocket,
      href: '/dashboard/venture',
      isPrimary: true,
      subItems: [
        { id: 'stage', label: 'Venture Stage', href: '/dashboard/venture/stage' },
        { id: 'progress', label: 'Startup Progress', href: '/dashboard/venture/progress' },
        { id: 'milestones', label: 'Milestones', href: '/dashboard/venture/milestones' },
      ],
    },
    {
      id: 'learning-labs',
      label: 'Learning & Labs',
      icon: BookOpen,
      href: '/dashboard/learning-labs',
      subItems: [
        { id: 'modules', label: 'Modules', href: '/dashboard/learning-labs/modules' },
        { id: 'labs', label: 'Labs', href: '/dashboard/learning-labs/labs' },
        { id: 'challenges', label: 'Challenges', href: '/dashboard/learning-labs/challenges' },
      ],
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Target,
      href: '/dashboard/opportunities',
      subItems: [
        { id: 'grants', label: 'Grants', href: '/dashboard/opportunities/grants' },
        { id: 'competitions', label: 'Competitions', href: '/dashboard/opportunities/competitions' },
        { id: 'investor-ready', label: 'Investor Readiness', href: '/dashboard/opportunities/investor-ready' },
      ],
    },
    {
      id: 'mentorship',
      label: 'Mentorship',
      icon: Brain,
      href: '/dashboard/mentorship',
      subItems: [
        { id: 'mentor', label: 'My Mentor', href: '/dashboard/mentorship/mentor' },
        { id: 'sessions', label: 'Sessions', href: '/dashboard/mentorship/sessions' },
        { id: 'feedback', label: 'Feedback', href: '/dashboard/mentorship/feedback' },
      ],
    },
    {
      id: 'community',
      label: 'Community',
      icon: Network,
      href: '/dashboard/community',
      subItems: [
        { id: 'teams', label: 'Teams', href: '/dashboard/community/teams' },
        { id: 'messages', label: 'Messages', href: '/dashboard/messages' },
        { id: 'events', label: 'Events', href: '/dashboard/community/events' },
      ],
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: Award,
      href: '/achievements',
      subItems: [
        { id: 'certificates', label: 'Certificates', href: '/achievements/certificates' },
        { id: 'awards', label: 'Awards', href: '/achievements/awards' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Settings,
      href: '/dashboard/profile',
      subItems: [
        { id: 'my-profile', label: 'My Profile', href: '/dashboard/profile' },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
      ],
    },
  ],
  mobileBottomTabs: [
    { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'venture', label: 'Venture', icon: Rocket, href: '/dashboard/venture' },
    { id: 'learn', label: 'Learn', icon: BookOpen, href: '/dashboard/learning-labs' },
    { id: 'opportunities', label: 'Opportunities', icon: Target, href: '/dashboard/opportunities' },
    { id: 'profile', label: 'Profile', icon: Settings, href: '/dashboard/profile' },
  ],
  backgroundGradient: 'from-red-600 via-pink-500 to-rose-500',
  accentColor: 'from-red-500 to-pink-500',
};

// ============================================
// 6. PROFESSIONAL (ImpactCircle)
// ============================================
export const professionalMenuConfig: RoleMenuConfig = {
  role: 'professional',
  displayName: 'Professional',
  primaryCta: 'Explore Opportunities',
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'membership',
      label: 'Membership',
      icon: Briefcase,
      href: '/dashboard/membership',
      subItems: [
        { id: 'status', label: 'Membership Status', href: '/dashboard/membership/status' },
        { id: 'benefits', label: 'Benefits', href: '/dashboard/membership/benefits' },
        { id: 'activity', label: 'Activity', href: '/dashboard/membership/activity' },
      ],
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      icon: Target,
      href: '/dashboard/opportunities',
      isPrimary: true,
      subItems: [
        { id: 'deals', label: 'Deals', href: '/dashboard/opportunities/deals' },
        { id: 'programmes', label: 'Programmes', href: '/dashboard/opportunities/programmes' },
        { id: 'invitations', label: 'Invitations', href: '/dashboard/opportunities/invitations' },
      ],
    },
    {
      id: 'capital-intelligence',
      label: 'Capital Intelligence',
      icon: Lightbulb,
      href: '/dashboard/intelligence',
      subItems: [
        { id: 'insights', label: 'Insights', href: '/dashboard/intelligence/insights' },
        { id: 'learning', label: 'Learning', href: '/dashboard/intelligence/learning' },
        { id: 'briefings', label: 'Briefings', href: '/dashboard/intelligence/briefings' },
      ],
    },
    {
      id: 'network',
      label: 'Network',
      icon: Network,
      href: '/dashboard/network',
      subItems: [
        { id: 'community', label: 'Community', href: '/dashboard/network/community' },
        { id: 'connections', label: 'Connections', href: '/dashboard/network/connections' },
        { id: 'groups', label: 'Groups', href: '/dashboard/network/groups' },
      ],
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      href: '/dashboard/events',
      subItems: [
        { id: 'forums', label: 'Forums', href: '/dashboard/events/forums' },
        { id: 'sessions', label: 'Sessions', href: '/dashboard/events/sessions' },
        { id: 'masterclasses', label: 'Masterclasses', href: '/dashboard/events/masterclasses' },
      ],
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: '/dashboard/messages',
      subItems: [
        { id: 'inbox', label: 'Inbox', href: '/dashboard/messages/inbox' },
        { id: 'notifications', label: 'Notifications', href: '/dashboard/notifications' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Settings,
      href: '/dashboard/profile',
      subItems: [
        { id: 'my-profile', label: 'My Profile', href: '/dashboard/profile' },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
      ],
    },
  ],
  mobileBottomTabs: [
    { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'opportunities', label: 'Opportunities', icon: Target, href: '/dashboard/opportunities' },
    { id: 'network', label: 'Network', icon: Network, href: '/dashboard/network' },
    { id: 'events', label: 'Events', icon: Calendar, href: '/dashboard/events' },
    { id: 'profile', label: 'Profile', icon: Settings, href: '/dashboard/profile' },
  ],
  backgroundGradient: 'from-amber-600 via-yellow-500 to-orange-500',
  accentColor: 'from-amber-500 to-yellow-500',
};

// ============================================
// 7. MENTOR
// ============================================
export const mentorMenuConfig: RoleMenuConfig = {
  role: 'mentor',
  displayName: 'Mentor',
  primaryCta: 'View Mentees',
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'my-mentees',
      label: 'My Mentees',
      icon: Users,
      href: '/dashboard/mentees',
      isPrimary: true,
      subItems: [
        { id: 'assigned', label: 'Assigned Mentees', href: '/dashboard/mentees' },
        { id: 'progress', label: 'Progress Snapshots', href: '/dashboard/mentees/progress' },
      ],
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: Calendar,
      href: '/dashboard/sessions',
      subItems: [
        { id: 'upcoming', label: 'Upcoming Sessions', href: '/dashboard/sessions/upcoming' },
        { id: 'history', label: 'History', href: '/dashboard/sessions/history' },
        { id: 'schedule', label: 'Schedule', href: '/dashboard/sessions/schedule' },
      ],
    },
    {
      id: 'guidance',
      label: 'Guidance',
      icon: Brain,
      href: '/dashboard/guidance',
      subItems: [
        { id: 'feedback', label: 'Feedback', href: '/dashboard/guidance/feedback' },
        { id: 'action-items', label: 'Action Items', href: '/dashboard/guidance/action-items' },
        { id: 'referrals', label: 'Referrals', href: '/dashboard/guidance/referrals' },
      ],
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: MessageSquare,
      href: '/dashboard/messages',
      subItems: [
        { id: 'inbox', label: 'Inbox', href: '/dashboard/messages/inbox' },
        { id: 'requests', label: 'Requests', href: '/dashboard/messages/requests' },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: HelpCircle,
      href: '/dashboard/resources',
      subItems: [
        { id: 'guides', label: 'Mentor Guides', href: '/dashboard/resources/guides' },
        { id: 'templates', label: 'Templates', href: '/dashboard/resources/templates' },
      ],
    },
    {
      id: 'impact',
      label: 'Impact',
      icon: TrendingUp,
      href: '/dashboard/impact',
      subItems: [
        { id: 'activity', label: 'Mentoring Activity', href: '/dashboard/impact/activity' },
        { id: 'outcomes', label: 'Outcomes', href: '/dashboard/impact/outcomes' },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: Settings,
      href: '/dashboard/profile',
      subItems: [
        { id: 'my-profile', label: 'My Profile', href: '/dashboard/profile' },
        { id: 'settings', label: 'Settings', href: '/dashboard/settings' },
      ],
    },
  ],
  mobileBottomTabs: [
    { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'mentees', label: 'Mentees', icon: Users, href: '/dashboard/mentees' },
    { id: 'sessions', label: 'Sessions', icon: Calendar, href: '/dashboard/sessions' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
    { id: 'profile', label: 'Profile', icon: Settings, href: '/dashboard/profile' },
  ],
  backgroundGradient: 'from-emerald-600 via-green-500 to-teal-500',
  accentColor: 'from-emerald-500 to-green-500',
};

// ============================================
// 8. PLATFORM ADMIN
// ============================================
export const platformAdminMenuConfig: RoleMenuConfig = {
  role: 'platform_admin',
  displayName: 'Platform Admin',
  primaryCta: 'View Analytics',
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      href: '/dashboard/users',
      subItems: [
        { id: 'all-users', label: 'All Users', href: '/dashboard/users' },
        { id: 'categories', label: 'User Categories', href: '/dashboard/users/categories' },
        { id: 'activity', label: 'Activity', href: '/dashboard/users/activity' },
      ],
    },
    {
      id: 'programmes',
      label: 'Programmes',
      icon: Building2,
      href: '/dashboard/programmes',
      subItems: [
        { id: 'impact-school', label: 'ImpactSchool', href: '/dashboard/programmes/school' },
        { id: 'impact-uni', label: 'ImpactUni', href: '/dashboard/programmes/university' },
        { id: 'impact-circle', label: 'ImpactCircle', href: '/dashboard/programmes/circle' },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: PieChart,
      href: '/dashboard/analytics',
      isPrimary: true,
      subItems: [
        { id: 'engagement', label: 'Engagement', href: '/dashboard/analytics/engagement' },
        { id: 'retention', label: 'Retention', href: '/dashboard/analytics/retention' },
        { id: 'performance', label: 'Performance', href: '/dashboard/analytics/performance' },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      icon: BookOpen,
      href: '/dashboard/content',
      subItems: [
        { id: 'courses', label: 'Courses', href: '/dashboard/content/courses' },
        { id: 'resources', label: 'Resources', href: '/dashboard/content/resources' },
      ],
    },
    {
      id: 'curriculum',
      label: 'Curriculum',
      icon: ClipboardList,
      href: '/dashboard/admin/curriculum/frameworks',
      subItems: [
        { id: 'frameworks', label: 'Frameworks', href: '/dashboard/admin/curriculum/frameworks' },
        { id: 'modules', label: 'Modules', href: '/dashboard/admin/curriculum/modules' },
        { id: 'lessons', label: 'Lessons', href: '/dashboard/admin/curriculum/lessons' },
        { id: 'activities', label: 'Activities', href: '/dashboard/admin/curriculum/activities' },
        { id: 'review-queue', label: 'Review Queue', href: '/dashboard/admin/curriculum/review-queue' },
      ],
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: Zap,
      href: '/dashboard/operations',
      subItems: [
        { id: 'tickets', label: 'Support Tickets', href: '/dashboard/operations/tickets' },
        { id: 'alerts', label: 'Alerts', href: '/dashboard/operations/alerts' },
        { id: 'announcements', label: 'Announcements', href: '/dashboard/operations/announcements' },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      href: '/dashboard/reports',
      subItems: [
        { id: 'exports', label: 'Exports', href: '/dashboard/reports/exports' },
        { id: 'institutional', label: 'Institutional Reports', href: '/dashboard/reports/institutional' },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      subItems: [
        { id: 'platform', label: 'Platform Settings', href: '/dashboard/settings/platform' },
        { id: 'roles', label: 'Roles', href: '/dashboard/settings/roles' },
        { id: 'permissions', label: 'Permissions', href: '/dashboard/settings/permissions' },
      ],
    },
  ],
  mobileBottomTabs: [
    { id: 'home', label: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'users', label: 'Users', icon: Users, href: '/dashboard/users' },
    { id: 'analytics', label: 'Analytics', icon: PieChart, href: '/dashboard/analytics' },
    { id: 'operations', label: 'Operations', icon: Zap, href: '/dashboard/operations' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ],
  backgroundGradient: 'from-slate-600 via-gray-500 to-stone-500',
  accentColor: 'from-slate-500 to-gray-500',
};

// ============================================
// Menu Config Export (lookup by role)
// ============================================
export const menuConfigByRole: Record<UserRole, RoleMenuConfig> = {
  student: studentMenuConfig,
  parent: parentMenuConfig,
  facilitator: facilitatorMenuConfig,
  school_admin: schoolAdminMenuConfig,
  university_member: universityMemberMenuConfig,
  professional: professionalMenuConfig,
  mentor: mentorMenuConfig,
  platform_admin: platformAdminMenuConfig,
};

/**
 * Get menu config for a specific role
 */
export function getMenuConfigForRole(role: UserRole): RoleMenuConfig {
  return menuConfigByRole[role] || studentMenuConfig; // Default to student if role not found
}
