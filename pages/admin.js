// pages/admin.js
import { useEffect, useState } from "react";

function safeJson(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export default function Admin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/bookings", { method: "GET" });
    const data = await r.json();

    // Accept either array or object-wrapped array (for safety)
    const list = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
    setRows(list);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin — Bookings</h1>

      <button onClick={load} style={{ margin: "12px 0", padding: "8px 12px" }}>
        Refresh
      </button>

      <div style={{ overflowX: "auto", marginTop: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "10px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={14} style={{ padding: 12 }}>
                  No bookings yet.
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {b.created_at ? new Date(b.created_at).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.name || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.phone || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.email || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.frequency || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.bedrooms ?? "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.bathrooms ?? "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.sqft || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.zip || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{safeJson(b.extras)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {safeJson(b.partial_cleaning)}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {typeof b.total_cents === "number" ? `$${(b.total_cents / 100).toFixed(2)}` : "—"}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>{b.status || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #f0f0f0" }}>
                    {b.assigned_cleaner || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
