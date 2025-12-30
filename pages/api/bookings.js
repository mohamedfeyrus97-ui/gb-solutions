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
        partial_cleaning,
        total_cents,
      } = req.body;

      const result = await pool.query(
        `
        INSERT INTO bookings
        (name, phone, email, frequency, bedrooms, bathrooms, sqft, zip, extras, partial_cleaning, total_cents)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *;
        `,
        [
          name,
          phone,
          email,
          frequency,
          bedrooms,
          bathrooms,
          sqft,
          zip,
          extras,
          partial_cleaning,
          total_cents,
        ]
      );

      return res.status(201).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT * FROM bookings ORDER BY created_at DESC"
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
