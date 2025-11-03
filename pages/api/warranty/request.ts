import type { NextApiRequest, NextApiResponse } from "next";
import type { WarrantyRequestPayload } from "@/types/warranty";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body as WarrantyRequestPayload;

  // TODO: здесь сделаем прокси в n8n webhook:
  // await fetch(process.env.N8N_WARRANTY_REQUEST_URL!, { method: "POST", body: JSON.stringify(body) });

  // имитация успеха
  return res.status(200).json({ ok: true, status: "DRAFT" });
}
