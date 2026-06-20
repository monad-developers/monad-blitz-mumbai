import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideologyId, userId, text } = body;

    if (!ideologyId || !userId || !text) {
      return NextResponse.json(
        { error: 'Missing ideologyId, userId, or text in request body.' },
        { status: 400 }
      );
    }

    // 1. Verify that the ideology exists first
    const ideologyCheck = await query(
      'SELECT id FROM ideologies WHERE id = $1',
      [ideologyId]
    );

    if (ideologyCheck.rows.length === 0) {
      return NextResponse.json(
        { error: `Ideology with ID ${ideologyId} not found.` },
        { status: 404 }
      );
    }

    // 2. Insert the feedback row
    const insertRes = await query(
      `INSERT INTO feedback (ideology_id, user_id, text) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [ideologyId, userId, text]
    );

    const feedback = insertRes.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully.',
      feedback,
    });

  } catch (error: any) {
    console.error('Error in Influence Doctrine API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
