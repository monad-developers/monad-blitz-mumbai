import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideologyId, userId } = body;

    if (!ideologyId || !userId) {
      return NextResponse.json(
        { error: 'Missing ideologyId or userId in request body.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Update the follower count
      const updateRes = await client.query(
        `UPDATE ideologies 
         SET followers = followers + 1 
         WHERE id = $1 
         RETURNING *`,
        [ideologyId]
      );

      if (updateRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: `Ideology with ID ${ideologyId} not found.` },
          { status: 404 }
        );
      }

      const updatedIdeology = updateRes.rows[0];

      // 2. Record the join event
      const payload = { userId, joinedAt: new Date().toISOString() };
      const eventRes = await client.query(
        `INSERT INTO events (type, ideology_id, payload) 
         VALUES ('join', $1, $2) 
         RETURNING *`,
        [ideologyId, JSON.stringify(payload)]
      );

      const joinEvent = eventRes.rows[0];

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: `Successfully joined ideology ${updatedIdeology.name}`,
        ideology: updatedIdeology,
        event: joinEvent,
      });

    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error in Join Ideology API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
