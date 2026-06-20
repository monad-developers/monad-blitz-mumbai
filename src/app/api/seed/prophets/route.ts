import { seedProphets } from "../../../../lib/f1/seedProphets";

export async function POST(): Promise<Response> {
  try {
    const result = await seedProphets();
    return Response.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
