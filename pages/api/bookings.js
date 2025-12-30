// pages/api/bookings.js
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function requireAdmin(req, res) {
  const token =
    req.headers["x-admin-token"] ||
    (req.headers.authorization || "").replace("Bearer ", "");

  if (!process.env.ADMIN_TOKEN) return false;

  if (token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return true;
  }
  return false;
}

const ALLOWED_STATUS = new Set(["received", "assigned", "completed", "canceled"]);

export default async function handler(req, res) {
  try {
    // Public: create booking
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

      if (!phone) return res.status(400).json({ error: "phone required" });

      const q = `
        INSERT INTO bookings
          (name, phone, email, frequency, bedrooms, bathrooms, sqft, zip, extras, partial_cleaning, total_cents, status)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'received')
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

    // Admin: list bookings (protected)
    if (req.method === "GET") {
      if (requireAdmin(req, res)) return;

      const result = await pool.query(
        `SELECT * FROM bookings ORDER BY created_at DESC NULLS LAST, id DESC;`
      );
      return res.status(200).json(result.rows);
    }

    // Admin: update booking (protected)
    if (req.method === "PATCH") {
      if (requireAdmin(req, res)) return;

      const { id, status, assigned_cleaner } = req.body || {};
      if (!id) return res.status(400).json({ error: "id required" });

      const fields = [];
      const values = [];
      let i = 1;

      if (typeof status === "string" && ALLOWED_STATUS.has(status)) {
        fields.push(`status = $${i++}`);
        values.push(status);
      }

      if (typeof assigned_cleaner === "string") {
        fields.push(`assigned_cleaner = $${i++}`);
        values.push(assigned_cleaner.trim());
      }

      if (!fields.length) return res.status(400).json({ error: "nothing to update" });

      values.push(id);

      const q = `
        UPDATE bookings
        SET ${fields.join(", ")}
        WHERE id = $${i}
        RETURNING *;
      `;

      const result = await pool.query(q, values);
      return res.status(200).json(result.rows[0] || null);
    }

    res.setHeader("Allow", ["GET", "POST", "PATCH"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Server error" });
  }
}
