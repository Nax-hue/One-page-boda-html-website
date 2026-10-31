import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { full_name, phone, stage_town, role, message } = req.body || {};

  if (!full_name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);

    // Creates the table the first time; does nothing after that
    await sql`
      CREATE TABLE IF NOT EXISTS join_requests (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        stage_town TEXT,
        role TEXT,
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO join_requests (full_name, phone, stage_town, role, message)
      VALUES (${full_name}, ${phone}, ${stage_town || null}, ${role || null}, ${message || null})
    `;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not save your request' });
  }
}
