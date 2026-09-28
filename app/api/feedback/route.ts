import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/feedback
 * Submit user feedback about NightPass.
 *
 * Body:
 * {
 *   walletAddress?: string;
 *   partyId?: string;
 *   rating: number; // 1-5
 *   category: string; // UX | Wallet | Contract | Privacy | Docs | Feature
 *   message: string;
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, partyId, rating, category, message } = body;

    // Validate required fields
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const validCategories = ['UX', 'Wallet', 'Contract', 'Privacy', 'Docs', 'Feature'];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        walletAddress: walletAddress ?? null,
        partyId: partyId ?? null,
        rating: Number(rating),
        category,
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, id: feedback.id }, { status: 201 });
  } catch (error: any) {
    console.error('[API/feedback] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * List all feedback entries (admin use).
 */
export async function GET() {
  try {
    const feedbackList = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ feedback: feedbackList });
  } catch (error: any) {
    console.error('[API/feedback] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
