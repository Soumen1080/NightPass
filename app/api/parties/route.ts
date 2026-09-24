import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contractAddress, organizerAddress, name, description, entryFee, deadline, txHash } = body;

    if (!contractAddress || !name || !organizerAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const party = await prisma.party.create({
      data: {
        contractAddress,
        organizerAddress,
        name,
        description,
        entryFee: entryFee ? parseFloat(entryFee) : 0,
        deadline: deadline ? new Date(deadline) : null,
        txHash,
      },
    });

    return NextResponse.json(party);
  } catch (error) {
    console.error('Error creating party:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const organizerAddress = searchParams.get('organizerAddress');

    if (contractAddress) {
      const party = await prisma.party.findUnique({
        where: { contractAddress },
        include: { rsvps: true },
      });
      return NextResponse.json(party);
    }

    if (organizerAddress) {
      const parties = await prisma.party.findMany({
        where: { organizerAddress },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { rsvps: true } } },
      });
      return NextResponse.json(parties);
    }

    return NextResponse.json({ error: 'Missing query parameters' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
