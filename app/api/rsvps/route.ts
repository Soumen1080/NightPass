import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { partyId, commitmentHash, attendeeName, attendeeAddress, txHash } = body;

    if (!partyId || !commitmentHash || !attendeeAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        partyId,
        commitmentHash,
        attendeeName,
        attendeeAddress,
        txHash,
      },
    });

    return NextResponse.json(rsvp);
  } catch (error) {
    console.error('Error creating RSVP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId');
    const attendeeAddress = searchParams.get('attendeeAddress');

    if (partyId) {
      const rsvps = await prisma.rSVP.findMany({
        where: { partyId },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(rsvps);
    }
    
    if (attendeeAddress) {
      const rsvps = await prisma.rSVP.findMany({
        where: { attendeeAddress },
        orderBy: { createdAt: 'desc' },
        include: { party: true },
      });
      return NextResponse.json(rsvps);
    }

    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
