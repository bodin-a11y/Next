import type { NextApiRequest, NextApiResponse } from "next";
import type { SupportPayload } from "@/types/warranty";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body as SupportPayload;

  // TODO: прокси на n8n webhook поддержки
  // await fetch(process.env.N8N_SUPPORT_URL!, { method:"POST", body: JSON.stringify(body) });

  return res.status(200).json({ ok: true, ticket: "PF-12345" });
}
