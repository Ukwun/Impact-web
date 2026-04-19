import { NextRequest, NextResponse } from "next/server";
import { getQuiz } from "@/lib/firestore-utils";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/quizzes/[id]
 * Fetch quiz details with questions from Firestore
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quizId = params.id;

    const quiz = await getQuiz(quizId);

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    const quizResponse = {
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      description: quiz.description,
      duration: quiz.duration,
      passingScore: quiz.passingScore,
      totalPoints: quiz.totalPoints,
      allowRetake: quiz.allowRetake,
      showResults: quiz.showResults,
      questions: (quiz.questions || []).map((q: any) => ({
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
    console.error("❌ Fetch quiz error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}
