import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

/**
 * POST /api/messages/send
 * Send a message to a user
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await verifyToken(token)) as JWTPayload;
    const { recipientEmail, subject, message, messageType = "GENERAL" } = await req.json();

    if (!recipientEmail || !message) {
      return NextResponse.json(
        { error: "Recipient email and message are required" },
        { status: 400 }
      );
    }

    // Find recipient user
    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail },
      select: { id: true, email: true, name: true },
    });

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      );
    }

    // Create message record
    const msg = await prisma.message.create({
      data: {
        senderId: payload.userId,
        recipientId: recipient.id,
        subject: subject || "No Subject",
        content: message,
        messageType,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipient.id,
        title: `New Message from ${payload.name || "Someone"}`,
        message: subject || message.substring(0, 100),
        type: "MESSAGE_RECEIVED",
        relatedId: msg.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: msg,
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages
 * Get user's messages (inbox)
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await verifyToken(token)) as JWTPayload;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "inbox"; // inbox, sent
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    let messages;
    if (type === "sent") {
      messages = await prisma.message.findMany({
        where: { senderId: payload.userId },
        include: {
          recipient: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });
    } else {
      messages = await prisma.message.findMany({
        where: { recipientId: payload.userId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
      });
    }

    // Count total
    const total =
      type === "sent"
        ? await prisma.message.count({
            where: { senderId: payload.userId },
          })
        : await prisma.message.count({
            where: { recipientId: payload.userId },
          });

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
