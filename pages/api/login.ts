import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { role } = req.body || {};
  res.status(200).json({ token: "fake-jwt-token", role });
}
