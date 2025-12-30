// pages/admin.js
import { useEffect, useMemo, useState } from "react";

function moneyFromCents(cents) {
  const v = Number(cents || 0) / 100;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

const STATUS_OPTIONS = ["new", "approved", "scheduled", "completed", "canceled"];

export default function Admin() {
  const [token, setToken] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gb_admin_token") || "";
    setToken(saved);
  }, []);

  const hasToken = useMemo(() => token && token.length > 0, [token]);

  async function load() {
    if (!hasToken) return;
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/bookings", {
        headers: { "x-admin-token": token },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load");
      setRows(Array.isArray(j) ? j : []);
    } catch (e) {
      setRows([]);
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  async function updateBooking(id, patch) {
    setErr("");
    try {
      const r = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({ id, ...patch }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Update failed");
      await load();
    } catch (e) {
      setErr(String(e.message || e));
    }
  }

  function saveTokenAndLoad() {
    localStorage.setItem("gb_admin_token", token);
    load();
  }

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="nav">
            <a className="brand" href="/" aria-label="GB Solutions home">
              <img
                src="/gb-logo.png"
                alt="GB Solutions"
                style={{ width: 36, height: 36, objectFit: "contain", display: "block", marginRight: 10 }}
              />
              <div className="brandText">
                <b>GB Solutions</b>
                <span>Admin</span>
              </div>
            </a>

            <div className="navCtas" style={{ gap: 10 }}>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Admin token"
                style={{ padding: 10, borderRadius: 12, minWidth: 220 }}
              />
              <button className="btn btnPrimary" type="button" onClick={saveTokenAndLoad}>
                Load
              </button>
              <button className="btn btnGhost" type="button" onClick={load} disabled={!hasToken}>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: "18px 16px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Bookings</h2>
          <div style={{ fontSize: 13, color: "var(--muted, #666)" }}>
            {loading ? "Loading…" : `${rows.length} rows`}
            {err ? ` • ${err}` : ""}
          </div>
        </div>

        <div className="priceCard" style={{ marginTop: 12, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {[
                  "Created",
                  "Name",
                  "Phone",
                  "Email",
                  "Zip",
                  "Frequency",
                  "Beds",
                  "Baths",
                  "Sq Ft",
                  "Total",
                  "Status",
                  "Cleaner",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "10px 8px",
                      borderBottom: "1px solid var(--border, rgba(0,0,0,.12))",
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
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)", whiteSpace: "nowrap" }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{r.name || ""}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)", whiteSpace: "nowrap" }}>
                    {r.phone || ""}
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{r.email || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{r.zip || "—"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{r.frequency || ""}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{r.bedrooms ?? ""}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{r.bathrooms ?? ""}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>{r.sqft || ""}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)", fontWeight: 800, whiteSpace: "nowrap" }}>
                    {moneyFromCents(r.total_cents)}
                  </td>

                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                    <select
                      value={r.status || "new"}
                      onChange={(e) => updateBooking(r.id, { status: e.target.value })}
                      style={{ padding: 8, borderRadius: 10 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)" }}>
                    <input
                      defaultValue={r.assigned_cleaner || ""}
                      placeholder="Cleaner name"
                      onBlur={(e) => updateBooking(r.id, { assigned_cleaner: e.target.value })}
                      style={{ padding: 8, borderRadius: 10, width: 160 }}
                    />
                  </td>

                  <td style={{ padding: "10px 8px", borderBottom: "1px solid rgba(0,0,0,.06)", whiteSpace: "nowrap" }}>
                    <button className="btn btnPrimary" type="button" onClick={() => updateBooking(r.id, { status: "approved" })}>
                      Approve
                    </button>{" "}
                    <button className="btn btnGhost" type="button" onClick={() => updateBooking(r.id, { status: "completed" })}>
                      Complete
                    </button>
                  </td>
                </tr>
              ))}

              {!rows.length && (
                <tr>
                  <td colSpan={13} style={{ padding: 14 }}>
                    {hasToken ? "No bookings yet." : "Enter admin token then click Load."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
