import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { recordSchismOnChain } from '@/lib/contracts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { parentId, newId, justification } = body;

    if (!parentId || !newId || !justification) {
      return NextResponse.json(
        { error: 'Missing parentId, newId, or justification in request body.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Verify parent and new ideologies exist in database
      const parentCheck = await client.query('SELECT name FROM ideologies WHERE id = $1', [parentId]);
      const newCheck = await client.query('SELECT name FROM ideologies WHERE id = $1', [newId]);

      if (parentCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: `Parent ideology with ID ${parentId} not found.` }, { status: 404 });
      }

      if (newCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: `New ideology with ID ${newId} not found.` }, { status: 404 });
      }

      const parentName = parentCheck.rows[0].name;
      const newName = newCheck.rows[0].name;

      // 2. Insert record into schisms table
      const schismRes = await client.query(
        `INSERT INTO schisms (parent_ideology_id, new_ideology_id, justification) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [parentId, newId, justification]
      );
      const schismRecord = schismRes.rows[0];

      // 3. Log a 'schism' event in events table
      const eventPayload = {
        parentName,
        newName,
        justification,
        schismId: schismRecord.id,
        occurredAt: new Date().toISOString()
      };
      await client.query(
        `INSERT INTO events (type, ideology_id, payload) 
         VALUES ('schism', $1, $2)`,
        [parentId, JSON.stringify(eventPayload)]
      );

      // 4. Trigger on-chain broadcast to Monad Testnet via Viem
      // If this throws, transaction is rolled back.
      const onChainRes = await recordSchismOnChain(parentId, newId, justification);

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: `Schism between ${parentName} and ${newName} successfully recorded on-chain and off-chain.`,
        schism: schismRecord,
        onChain: onChainRes, // Contains tx hash and block number
      });

    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('Error executing schism transaction:', err);
      return NextResponse.json(
        { error: `Transaction failed and was rolled back: ${err.message || err}` },
        { status: 500 }
      );
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Error in Schism API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
