import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const {
        name,
        phone,
        email,
        frequency,
        bedrooms,
        bathrooms,
        sqft,
        zip,
        extras,
        partialCleaning, // from book.js
        totalCents, // from book.js
      } = req.body || {};

      if (!phone) return res.status(400).json({ error: "phone required" });

      const result = await pool.query(
        `INSERT INTO bookings
          (name, phone, email, frequency, bedrooms, bathrooms, sqft, zip, extras, partial_cleaning, total_cents, status)
         VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'new')
         RETURNING *`,
        [
          name || null,
          phone,
          email || null,
          frequency || null,
          Number.isFinite(bedrooms) ? bedrooms : Number(bedrooms || 0),
          Number(bathrooms || 0),
          sqft || null,
          zip || null,
          extras || {},
          partialCleaning || {},
          Number(totalCents || 0),
        ]
      );

      return res.status(200).json(result.rows[0]);
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT * FROM bookings ORDER BY created_at DESC"
      );
      return res.status(200).json(result.rows);
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
