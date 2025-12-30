// pages/api/admin/bookings.js
import pool from "../../../lib/db";

function requireAdmin(req) {
  const token = req.headers["x-admin-token"];
  return token && token === process.env.ADMIN_TOKEN;
}

export default async function handler(req, res) {
  if (!requireAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (req.method === "GET") {
      const { rows } = await pool.query(
        `SELECT * FROM bookings ORDER BY created_at DESC`
      );
      return res.status(200).json(rows);
    }

    if (req.method === "PATCH") {
      const { id, status, assigned_cleaner, admin_notes, admin_price_cents } = req.body || {};
      if (!id) return res.status(400).json({ error: "Missing id" });

      const fields = [];
      const values = [];
      let i = 1;

      if (typeof status === "string") {
        fields.push(`status = $${i++}`);
        values.push(status);
      }
      if (typeof assigned_cleaner === "string") {
        fields.push(`assigned_cleaner = $${i++}`);
        values.push(assigned_cleaner);
      }
      if (typeof admin_notes === "string") {
        fields.push(`admin_notes = $${i++}`);
        values.push(admin_notes);
      }
      if (Number.isFinite(admin_price_cents)) {
        fields.push(`admin_price_cents = $${i++}`);
        values.push(admin_price_cents);
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      values.push(id);

      const { rows } = await pool.query(
        `UPDATE bookings
         SET ${fields.join(", ")}
         WHERE id = $${i}
         RETURNING *`,
        values
      );

      return res.status(200).json(rows[0] || null);
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
