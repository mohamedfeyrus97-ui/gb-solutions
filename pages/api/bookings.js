// pages/api/bookings.js
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    if (req.method === "POST") {
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
        partialCleaning,
        totalCents,
      } = req.body || {};

      const q = `
        INSERT INTO bookings
          (name, phone, email, frequency, bedrooms, bathrooms, sqft, zip, extras, partial_cleaning, total_cents, status)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'new')
        RETURNING *;
      `;

      const values = [
        name || "",
        phone || "",
        email || "",
        frequency || "biweekly",
        Number(bedrooms || 0),
        Number(bathrooms || 0),
        String(sqft || "1-999"),
        String(zip || ""),
        extras || {},
        partialCleaning || {},
        Number(totalCents || 0),
      ];

      const result = await pool.query(q, values);
      return res.status(200).json(result.rows[0]);
    }

    if (req.method === "GET") {
      const result = await pool.query(
        `SELECT * FROM bookings ORDER BY created_at DESC NULLS LAST, id DESC;`
      );
      // IMPORTANT: return an array (admin page expects an array)
      return res.status(200).json(result.rows);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
