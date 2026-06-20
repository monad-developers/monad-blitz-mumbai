import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { recordAllianceOnChain } from '@/lib/contracts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideologyA, ideologyB } = body;

    if (!ideologyA || !ideologyB) {
      return NextResponse.json(
        { error: 'Missing ideologyA or ideologyB in request body.' },
        { status: 400 }
      );
    }

    const client = pool;

    // 1. Verify both ideologies exist in the database
    const checkA = await client.query('SELECT name FROM ideologies WHERE id = $1', [ideologyA]);
    const checkB = await client.query('SELECT name FROM ideologies WHERE id = $1', [ideologyB]);

    if (checkA.rows.length === 0) {
      return NextResponse.json({ error: `Ideology with ID ${ideologyA} not found.` }, { status: 404 });
    }
    if (checkB.rows.length === 0) {
      return NextResponse.json({ error: `Ideology with ID ${ideologyB} not found.` }, { status: 404 });
    }

    const nameA = checkA.rows[0].name;
    const nameB = checkB.rows[0].name;

    const dbClient = await pool.connect();
    try {
      await dbClient.query('BEGIN');

      // 2. Insert event log in Neon DB for ideologyA
      const payload = {
        ideologyA,
        ideologyB,
        nameA,
        nameB,
        formedAt: new Date().toISOString()
      };

      await dbClient.query(
        `INSERT INTO events (type, ideology_id, payload) 
         VALUES ('alliance', $1, $2)`,
        [ideologyA, JSON.stringify(payload)]
      );

      // Also log it for ideologyB so both feeds show the alliance
      await dbClient.query(
        `INSERT INTO events (type, ideology_id, payload) 
         VALUES ('alliance', $1, $2)`,
        [ideologyB, JSON.stringify(payload)]
      );

      // 3. Perform the on-chain write calling recordAlliance
      const onChainRes = await recordAllianceOnChain(ideologyA, ideologyB);

      await dbClient.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: `Alliance between ${nameA} and ${nameB} successfully recorded on-chain and off-chain.`,
        onChain: onChainRes
      });

    } catch (err: any) {
      await dbClient.query('ROLLBACK');
      console.error('Error in alliance database transaction:', err);
      return NextResponse.json(
        { error: `Transaction failed: ${err.message || err}` },
        { status: 500 }
      );
    } finally {
      dbClient.release();
    }

  } catch (error: any) {
    console.error('Error in Alliance API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
