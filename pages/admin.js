// pages/admin.js
import { useEffect, useState } from "react";

export default function Admin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((data) => {
        setRows(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading…</p>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin – Bookings</h1>

      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              {[
                "Created",
                "Name",
                "Phone",
                "Email",
                "Frequency",
                "Bedrooms",
                "Bathrooms",
                "Sq Ft",
                "Zip",
                "Extras",
                "Partial Cleaning",
                "Total",
                "Status",
                "Assigned Cleaner",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    borderBottom: "2px solid #ddd",
                    padding: 8,
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>{r.name}</td>
                <td>{r.phone}</td>
                <td>{r.email || "—"}</td>
                <td>{r.frequency}</td>
                <td>{r.bedrooms}</td>
                <td>{r.bathrooms}</td>
                <td>{r.sqft}</td>
                <td>{r.zip}</td>
                <td>{JSON.stringify(r.extras)}</td>
                <td>{JSON.stringify(r.partial_cleaning)}</td>
                <td>${(r.total_cents / 100).toFixed(2)}</td>
                <td>{r.status}</td>
                <td>{r.assigned_cleaner || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
