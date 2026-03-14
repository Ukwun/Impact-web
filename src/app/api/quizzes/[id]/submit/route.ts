import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getEmailService, emailTemplates } from "@/lib/email-service";
import prisma from "@/lib/db";

/**
 * POST /api/quizzes/[id]/submit
 * Submit quiz answers and calculate score
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

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        course: {
          include: {
            instructor: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Check if user has already passed this quiz
    const existingPassedAttempt = await prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId,
        passed: true,
      },
    });

    if (existingPassedAttempt && !quiz.allowRetake) {
      return NextResponse.json(
        { error: "You have already passed this quiz and retakes are not allowed" },
        { status: 400 }
      );
    }

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    const questionResults = [];

    for (const question of quiz.questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      const points = isCorrect ? question.points : 0;

      correctAnswers += isCorrect ? 1 : 0;
      totalPoints += points;

      questionResults.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points,
      });
    }

    const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    // Create quiz attempt record
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers: JSON.stringify(answers),
        score: percentage,
        totalPoints,
        passed,
        timeSpent: timeSpent || 0,
        completedAt: new Date(),
      },
      include: {
        user: true,
        quiz: {
          include: {
            course: true,
          },
        },
      },
    });

    // Update enrollment progress if this is the first passing attempt
    if (passed) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId: quiz.courseId,
        },
      });

      if (enrollment) {
        // Check if this quiz completion affects course completion
        const totalQuizzes = await prisma.quiz.count({
          where: { courseId: quiz.courseId },
        });

        const passedQuizzes = await prisma.quizAttempt.count({
          where: {
            userId,
            quiz: { courseId: quiz.courseId },
            passed: true,
          },
        });

        // Update enrollment with quiz progress
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: {
            quizAttempts: {
              connect: { id: attempt.id },
            },
          },
        });

        // Check if course is now complete
        const courseLessons = await prisma.lesson.count({
          where: { courseId: quiz.courseId },
        });

        const completedLessons = await prisma.lessonCompletion.count({
          where: {
            userId,
            lesson: { courseId: quiz.courseId },
          },
        });

        const courseComplete = completedLessons >= courseLessons && passedQuizzes >= totalQuizzes;

        if (courseComplete && !enrollment.isCompleted) {
          await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { isCompleted: true },
          });

          // Award certificate automatically
          try {
            const certResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/certificates/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                courseId: quiz.courseId,
                enrollmentId: enrollment.id,
              }),
            });

            if (certResponse.ok) {
              console.log('Certificate generated automatically for course completion');
            }
          } catch (error) {
            console.error('Error generating certificate:', error);
          }
        }
      }
    }

    // Send notification email
    try {
      const emailService = getEmailService();
      await emailService.sendEmail({
        to: attempt.user.email,
        subject: `Quiz Results: ${quiz.title}`,
        html: emailTemplates.quizCompleted(attempt),
      });
    } catch (error) {
      console.error("Error sending quiz completion email:", error);
    }

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        score: percentage,
        totalPoints,
        passed,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        timeSpent: attempt.timeSpent,
        showResults: quiz.showResults,
        results: quiz.showResults ? questionResults : null,
      },
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}