// pages/admin.js
import { useEffect, useMemo, useState } from "react";

function moneyFromCents(cents) {
  if (typeof cents !== "number") return "—";
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function summarizeSelected(obj) {
  if (!obj || typeof obj !== "object") return "—";
  const keys = Object.keys(obj).filter((k) => obj[k]);
  return keys.length ? keys.join(", ") : "—";
}

export default function Admin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  async function load(t = token) {
    setLoading(true);
    const r = await fetch("/api/bookings", {
      method: "GET",
      headers: {
        "x-admin-token": t,
      },
    });

    const data = await r.json();

    if (!r.ok) {
      setRows([]);
      setLoading(false);
      return;
    }

    setRows(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    // do nothing until token entered
  }, []);

  const sorted = useMemo(() => rows, [rows]);

  return (
    <div style={{ padding: "22px 0 44px" }}>
      <div className="container">
        <div
          style={{
            border: "1px solid var(--border, rgba(0,0,0,.08))",
            borderRadius: 16,
            padding: 18,
            background: "rgba(255,255,255,.85)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 22 }}>Admin — Bookings</h1>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Admin token"
              style={{ padding: 12, borderRadius: 12, minWidth: 260 }}
            />
            <button className="btn btnPrimary" onClick={() => load()} type="button" disabled={!token || loading}>
              {loading ? "Loading..." : "Load Bookings"}
            </button>
            <button className="btn btnGhost" onClick={() => load()} type="button" disabled={!token || loading}>
              Refresh
            </button>
          </div>

          <div style={{ marginTop: 14, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1100 }}>
              <thead>
                <tr>
                  {[
                    "Created",
                    "Name",
                    "Phone",
                    "Email",
                    "Frequency",
                    "Beds",
                    "Baths",
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
                        padding: "10px 8px",
                        borderBottom: "1px solid rgba(0,0,0,.1)",
                        fontSize: 12,
                        color: "var(--muted, #666)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={14} style={{ padding: 12 }}>
                      {token ? "No bookings yet (or unauthorized)." : "Enter token to load bookings."}
                    </td>
                  </tr>
                ) : (
                  sorted.map((b) => (
                    <tr key={b.id}>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)", whiteSpace: "nowrap" }}>
                        {b.created_at ? new Date(b.created_at).toLocaleString() : "—"}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.name || "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.phone || "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.email || "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.frequency || "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.bedrooms ?? "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.bathrooms ?? "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.sqft || "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.zip || "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                        {summarizeSelected(b.extras)}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                        {summarizeSelected(b.partial_cleaning)}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)", fontWeight: 800 }}>
                        {moneyFromCents(b.total_cents)}
                      </td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{b.status || "—"}</td>
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                        {b.assigned_cleaner || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
