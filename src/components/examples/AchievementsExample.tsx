/**
 * Example: Using Achievements in Course Completion
 * 
 * This file demonstrates how to integrate the achievement system
 * into your existing course componenents.
 */

"use client";

import React, { useState } from "react";
import { useAchievementUnlocker } from "@/components/WithAchievements";
import AchievementService from "@/services/AchievementService";

/**
 * Example 1: Simple Course Completion with Achievement
 */
export function CourseCompletionExample() {
  const { unlockAchievement } = useAchievementUnlocker();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteCourse = async () => {
    setIsCompleting(true);

    try {
      // Your course completion logic here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Unlock achievement
      const success = await unlockAchievement(
        AchievementService.ACHIEVEMENTS.FIRST_COURSE
      );

      if (success) {
        console.log("Achievement unlocked!");
      }
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <button
      onClick={handleCompleteCourse}
      disabled={isCompleting}
      className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50"
    >
      {isCompleting ? "Completing..." : "Complete Course"}
    </button>
  );
}

/**
 * Example 2: Multiple Achievements for Milestones
 */
export function MilestoneTracker() {
  const { unlockAchievement } = useAchievementUnlocker();
  const [coursesCompleted, setCoursesCompleted] = useState(0);

  const handleCourseComplete = async () => {
    const newCount = coursesCompleted + 1;
    setCoursesCompleted(newCount);

    // Unlock achievements based on milestone
    if (newCount === 1) {
      await unlockAchievement(
        AchievementService.ACHIEVEMENTS.FIRST_COURSE
      );
    } else if (newCount === 5) {
      await unlockAchievement(
        AchievementService.ACHIEVEMENTS.FIVE_COURSES
      );
    } else if (newCount === 10) {
      await unlockAchievement(
        AchievementService.ACHIEVEMENTS.TEN_COURSES
      );
    }
  };

  return (
    <div className="p-4">
      <p className="text-lg font-semibold">
        Courses Completed: {coursesCompleted}
      </p>
      <button
        onClick={handleCourseComplete}
        className="mt-2 px-4 py-2 bg-primary-500 text-white rounded"
      >
        Complete Course
      </button>
    </div>
  );
}

/**
 * Example 3: Engagement-based Achievements
 */
export function ForumPostExample() {
  const { unlockAchievement } = useAchievementUnlocker();
  const [postCount, setPostCount] = useState(0);

  const handlePostComment = async () => {
    const newCount = postCount + 1;
    setPostCount(newCount);

    // Unlock on first post
    if (newCount === 1) {
      await unlockAchievement(
        AchievementService.ACHIEVEMENTS.FIRST_COMMENT
      );
    }
  };

  return (
    <div className="p-4">
      <textarea
        placeholder="Write your post..."
        className="w-full p-2 border border-gray-300 rounded"
      />
      <button
        onClick={handlePostComment}
        className="mt-2 px-4 py-2 bg-primary-500 text-white rounded"
      >
        Post Comment
      </button>
    </div>
  );
}

/**
 * Example 4: Points/XP-based Achievements
 */
export function PointsMultiplier() {
  const { unlockAchievement } = useAchievementUnlocker();
  const [points] = useState(0);

  const earnPoints = async (amount: number) => {
    // Assuming you have a function that adds points
    // const newPoints = await addPoints(amount);

    // Check achievement milestones
    // if (newPoints >= 50 && points < 50) {
    //   await unlockAchievement(AchievementService.ACHIEVEMENTS.FIFTY_POINTS);
    // }
    // if (newPoints >= 100 && points < 100) {
    //   await unlockAchievement(AchievementService.ACHIEVEMENTS.HUNDRED_POINTS);
    // }
  };

  return (
    <div className="p-4">
      <p className="text-lg font-semibold">Points: {points}</p>
      <button onClick={() => earnPoints(10)} className="px-4 py-2 bg-green-500 text-white rounded">
        Earn 10 Points
      </button>
    </div>
  );
}

/**
 * Example 5: Skill Mastery Achievement
 */
export function SkillProgressExample() {
  const { unlockAchievement } = useAchievementUnlocker();
  const [skillProgress, setSkillProgress] = useState(0);

  const addProgressToSkill = async () => {
    const newProgress = skillProgress + 10;
    setSkillProgress(newProgress);

    // Unlock when skill reaches mastery (100%)
    if (newProgress >= 100 && skillProgress < 100) {
      await unlockAchievement(
        AchievementService.ACHIEVEMENTS.FIRST_SKILL
      );
    }
  };

  return (
    <div className="p-4">
      <div className="bg-gray-200 rounded h-4 overflow-hidden">
        <div
          className="bg-primary-500 h-full transition-all"
          style={{ width: `${Math.min(skillProgress, 100)}%` }}
        />
      </div>
      <p className="mt-2">{skillProgress}%</p>
      <button
        onClick={addProgressToSkill}
        className="mt-2 px-4 py-2 bg-primary-500 text-white rounded"
      >
        Progress
      </button>
    </div>
  );
}

/**
 * Integration Checklist:
 * 
 * 1. ✅ Add useAchievementUnlocker to your component
 * 2. ✅ Call unlockAchievement when user completes an action
 * 3. ✅ Use AchievementService.ACHIEVEMENTS for predefined badges
 * 4. ✅ Or create custom achievements with your own badge name
 * 5. ✅ The achievement notification will display automatically
 * 
 * Common Actions to Track:
 * - Course completion
 * - Quiz passage
 * - Forum posts/comments
 * - Upvotes received
 * - Streak login (7 days, 30 days)
 * - Skill mastery
 * - Points accumulation
 */
