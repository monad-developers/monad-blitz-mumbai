import { NextResponse } from 'next/server';
import { query, pool } from '@/lib/db';

// GET: Fetch all doctrine versions for a specific ideology
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const ideologyId = parseInt(params.id);

    if (isNaN(ideologyId)) {
      return NextResponse.json({ error: 'Invalid ideology ID.' }, { status: 400 });
    }

    const res = await query(
      `SELECT * FROM doctrine_versions 
       WHERE ideology_id = $1 
       ORDER BY created_at DESC`,
      [ideologyId]
    );

    return NextResponse.json({
      success: true,
      versions: res.rows,
    });

  } catch (error: any) {
    console.error('Error fetching doctrine versions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Add a new version of the doctrine (updates the current ideology version too)
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const ideologyId = parseInt(params.id);

    if (isNaN(ideologyId)) {
      return NextResponse.json({ error: 'Invalid ideology ID.' }, { status: 400 });
    }

    const body = await request.json();
    const { text, reason } = body;

    if (!text || !reason) {
      return NextResponse.json(
        { error: 'Missing text or reason in request body.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Get the current ideology state
      const ideologyRes = await client.query(
        'SELECT doctrine_version, name FROM ideologies WHERE id = $1',
        [ideologyId]
      );

      if (ideologyRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: `Ideology with ID ${ideologyId} not found.` },
          { status: 404 }
        );
      }

      const currentVersionStr = ideologyRes.rows[0].doctrine_version || 'v1';
      
      // Calculate next version (e.g. "v1" -> "v2", "v1.2.0" -> "v1.2.1" or increment numeric suffix)
      // Standard increment: parse ending number and increment it.
      const match = currentVersionStr.match(/\d+$/);
      let nextVersionStr = 'v2';
      if (match) {
        const currentNum = parseInt(match[0]);
        nextVersionStr = currentVersionStr.substring(0, match.index) + (currentNum + 1);
      } else {
        nextVersionStr = currentVersionStr + '.1';
      }

      // 2. Insert new version
      const versionRes = await client.query(
        `INSERT INTO doctrine_versions (ideology_id, version, text, reason) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [ideologyId, nextVersionStr, text, reason]
      );
      const newVersion = versionRes.rows[0];

      // 3. Update parent ideology current version
      await client.query(
        `UPDATE ideologies 
         SET doctrine_version = $1 
         WHERE id = $2`,
        [nextVersionStr, ideologyId]
      );

      // 4. Log a doctrine_change event in events table
      const eventPayload = {
        oldVersion: currentVersionStr,
        newVersion: nextVersionStr,
        reason,
        changedAt: new Date().toISOString()
      };
      await client.query(
        `INSERT INTO events (type, ideology_id, payload) 
         VALUES ('doctrine_change', $1, $2)`,
        [ideologyId, JSON.stringify(eventPayload)]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: `Doctrine for ${ideologyRes.rows[0].name} updated to ${nextVersionStr}`,
        newVersion,
      });

    } catch (dbError) {
      await client.query('ROLLBACK');
      throw dbError;
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error updating doctrine:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
