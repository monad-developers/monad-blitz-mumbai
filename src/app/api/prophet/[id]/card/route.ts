import { getProphetCard } from "../../../../../lib/prophet/card";

type Params = { params: { id: string } };

export async function GET(_: Request, context: Params): Promise<Response> {
  try {
    const payload = await getProphetCard(context.params.id);
    return Response.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 404 });
  }
}
