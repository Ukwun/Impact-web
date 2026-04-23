import { NextResponse } from "next/server";
import { getLearningArchitecturePayload } from "@/lib/learning-architecture-db";

export async function GET() {
  try {
    const data = await getLearningArchitecturePayload();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Failed to build learning architecture payload", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load learning architecture data",
      },
      { status: 500 }
    );
  }
}
