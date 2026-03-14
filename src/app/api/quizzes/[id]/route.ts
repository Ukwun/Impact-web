import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/quizzes/[id]
 * Fetch quiz details with questions
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    const quizResponse = {
      id: quiz.id,
      courseId: quiz.courseId,
      courseName: quiz.course.title,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      passingScore: quiz.passingScore,
      totalPoints: quiz.totalPoints,
      allowRetake: quiz.allowRetake,
      showResults: quiz.showResults,
      questions: quiz.questions.map((q: any) => ({
        id: q.id,
        order: q.order,
        type: q.type,
        questionText: q.questionText,
        explanation: q.explanation,
        points: q.points,
        options: q.options,
        // Don't send correct answer to client
      })),
      createdAt: quiz.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: quizResponse,
    });
  } catch (error) {
    console.error("Fetch quiz error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quizzes/[id]/submit
 * Submit quiz answers and get graded results
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;
    const body = await req.json();

    // Verify user is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Fetch quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Grade quiz and calculate score
    const userAnswers = body.answers as Record<string, string>;
    let correctCount = 0;
    const answers = [];

    for (const question of quiz.questions) {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      if (isCorrect) {
        correctCount++;
      }

      answers.push({
        questionId: question.id,
        userAnswer,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      });
    }

    // Calculate score
    const totalPoints = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0);
    const score = Math.round((correctCount / quiz.questions.length) * totalPoints);
    const percentageScore = Math.round((correctCount / quiz.questions.length) * 100);
    const isPassed = percentageScore >= quiz.passingScore;

    // Create quiz attempt record
    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: payload.sub,
        score,
        scoredOutOf: totalPoints,
        percentageScore,
        isPassed,
        submittedAt: new Date(),
        completedAt: new Date(),
        answers: {
          create: answers.map((a) => ({
            questionId: a.questionId,
            answer: a.userAnswer || "",
            isCorrect: a.isCorrect,
            pointsEarned: a.pointsEarned,
          })),
        },
      },
    });

    // Prepare response
    const resultsResponse = {
      score,
      percentageScore,
      isPassed,
      totalQuestions: quiz.questions.length,
      correctAnswers: correctCount,
      totalPoints,
      passingScore: quiz.passingScore,
      message: isPassed
        ? `Congratulations! You passed with ${percentageScore}%`
        : `You scored ${percentageScore}%. You need ${quiz.passingScore}% to pass.`,
      answers: quiz.showResults
        ? answers.map((a) => ({
            questionId: a.questionId,
            isCorrect: a.isCorrect,
            pointsEarned: a.pointsEarned,
          }))
        : [],
    };

    return NextResponse.json({
      success: true,
      message: "Quiz submitted successfully",
      data: resultsResponse,
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
