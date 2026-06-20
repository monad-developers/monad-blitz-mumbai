import { runReflectionCycle } from "../../../lib/reflection/reflect";

export async function POST(): Promise<Response> {
  try {
    const results = await runReflectionCycle();
    return Response.json({ ok: true, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reflection error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
