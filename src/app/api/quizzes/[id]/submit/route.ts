import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getQuiz, createQuizAttempt, logActivity } from "@/lib/firestore-utils";

/**
 * POST /api/quizzes/[id]/submit
 * Submit quiz answers and calculate score using Firestore
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];
    const payload = verifyToken(token || "");

    if (!payload) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = payload.sub as string;
    const quizId = params.id;
    const body = await request.json();
    const { answers, timeSpent } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: "Answers are required" },
        { status: 400 }
      );
    }

    // Get quiz from Firestore
    const quiz = await getQuiz(quizId);

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Calculate score
    let correctAnswers = 0;
    let earnedPoints = 0;
    const totalPossiblePoints = quiz.totalPoints || 100;
    const questionResults = [];

    const questions = quiz.questions || [];
    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      const points = isCorrect ? (question.points || 0) : 0;

      correctAnswers += isCorrect ? 1 : 0;
      earnedPoints += points;

      questionResults.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points,
      });
    }

    const percentageScore = questions.length > 0 
      ? Math.round((correctAnswers / questions.length) * 100) 
      : 0;
    const isPassed = percentageScore >= (quiz.passingScore || 60);

    // Create quiz attempt record in Firestore
    const attemptData = {
      quizId,
      userId,
      score: earnedPoints,
      scoredOutOf: totalPossiblePoints,
      percentageScore,
      isPassed,
      answers,
      timeSpent: timeSpent || 0,
      submittedAt: new Date(),
      completedAt: new Date(),
    };

    const attempt = await createQuizAttempt(attemptData);

    // Log activity
    await logActivity(userId, {
      type: 'quiz_attempt',
      description: `Completed quiz: ${quiz.title}`,
      quizId,
      score: percentageScore,
      passed: isPassed,
      timestamp: new Date(),
    });

    // Prepare response
    const resultsResponse = {
      score: earnedPoints,
      percentageScore,
      isPassed,
      totalQuestions: questions.length,
      correctAnswers,
      totalPoints: totalPossiblePoints,
      passingScore: quiz.passingScore || 60,
      message: isPassed
        ? `🎉 Congratulations! You passed with ${percentageScore}%`
        : `📊 You scored ${percentageScore}%. You need ${quiz.passingScore || 60}% to pass.`,
      answers: (quiz.showResults !== false)
        ? questionResults.map((a) => ({
            questionId: a.questionId,
            isCorrect: a.isCorrect,
            pointsEarned: a.points,
          }))
        : [],
    };

    return NextResponse.json({
      success: true,
      message: "Quiz submitted successfully",
      data: resultsResponse,
    });
  } catch (error) {
    console.error("❌ Submit quiz error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}