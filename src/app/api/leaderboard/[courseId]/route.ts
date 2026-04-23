// Leaderboard API - Rankings and competition
// GET /api/leaderboard - Get global leaderboard
// GET /api/leaderboard/[courseId] - Get course leaderboard

import { NextRequest, NextResponse } from "next/server";
import { LeaderboardService } from "@/lib/database-service";
import { addCorsHeaders, handleCorsOptions } from "@/lib/cors";

export const dynamic = 'force-dynamic';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCorsOptions(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

// GET global or course leaderboard
export async function GET(req: NextRequest, { params }: { params: { courseId?: string } }) {
  try {
    const take = parseInt(req.nextUrl.searchParams.get('take') || '10');
    const safeLimit = Math.min(take, 100); // Max 100 entries

    let leaderboard;
    if (params?.courseId) {
      leaderboard = await LeaderboardService.getCourseLeaderboard(params.courseId, safeLimit);
    } else {
      leaderboard = await LeaderboardService.getGlobalLeaderboard(0, safeLimit);
    }

    const withRank = leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));

    const response = NextResponse.json(
      {
        success: true,
        data: withRank,
        type: params?.courseId ? 'course' : 'global',
      },
      { status: 200 }
    );

    return addCorsHeaders(response, req.headers.get("origin"));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    const response = NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(response, req.headers.get("origin"));
  }
}
