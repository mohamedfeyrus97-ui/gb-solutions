import pool from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      phone,
      email,
      frequency,
      bedrooms,
      bathrooms,
      sqft,
      extras,
      partialCleaning,
      totalCents,
    } = req.body;

    const query = `
      INSERT INTO bookings
      (name, phone, email, frequency, bedrooms, bathrooms, sqft, extras, partial_cleaning, total_cents)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;

    const values = [
      name,
      phone,
      email || null,
      frequency,
      bedrooms,
      bathrooms,
      sqft,
      extras,
      partialCleaning,
      totalCents,
    ];

    const { rows } = await pool.query(query, values);

    res.status(200).json({ success: true, booking: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}
