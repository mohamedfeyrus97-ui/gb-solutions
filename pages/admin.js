// pages/admin.js
import { useEffect, useMemo, useState } from "react";

function moneyFromCents(cents) {
  if (typeof cents !== "number") return "—";
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function pillStyle(kind) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    border: "1px solid rgba(0,0,0,.10)",
    background: "rgba(255,255,255,.65)",
    whiteSpace: "nowrap",
  };

  if (kind === "new")
    return { ...base, background: "rgba(15,118,110,.10)", border: "1px solid rgba(15,118,110,.25)" };
  if (kind === "scheduled")
    return { ...base, background: "rgba(2,132,199,.10)", border: "1px solid rgba(2,132,199,.25)" };
  if (kind === "completed")
    return { ...base, background: "rgba(34,197,94,.10)", border: "1px solid rgba(34,197,94,.25)" };
  if (kind === "canceled")
    return { ...base, background: "rgba(239,68,68,.10)", border: "1px solid rgba(239,68,68,.25)" };
  return base;
}

function pickSelected(obj) {
  if (!obj || typeof obj !== "object") return [];
  return Object.keys(obj).filter((k) => obj[k]);
}

function toTitle(s) {
  if (!s) return "";
  return String(s)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function formatCreated(created_at) {
  if (!created_at) return "—";
  const d = new Date(created_at);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

export default function Admin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetails, setShowDetails] = useState(false);

  async function load(t = token) {
    setLoading(true);
    const r = await fetch("/api/bookings", {
      method: "GET",
      headers: { "x-admin-token": t },
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

  const filtered = useMemo(() => {
    let list = Array.isArray(rows) ? [...rows] : [];

    if (statusFilter !== "all") {
      list = list.filter((b) => String(b.status || "new") === statusFilter);
    }

    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((b) => {
        const hay = [
          b.name,
          b.phone,
          b.email,
          b.zip,
          b.frequency,
          b.status,
          b.assigned_cleaner,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      });
    }

    return list;
  }, [rows, q, statusFilter]);

  const counts = useMemo(() => {
    const c = { all: rows.length, new: 0, scheduled: 0, completed: 0, canceled: 0 };
    rows.forEach((b) => {
      const s = String(b.status || "new");
      if (c[s] !== undefined) c[s] += 1;
    });
    return c;
  }, [rows]);

  const tableStyles = {
    card: {
      border: "1px solid var(--border, rgba(0,0,0,.08))",
      borderRadius: 16,
      padding: 18,
      background: "rgba(255,255,255,.85)",
    },
    headCell: {
      textAlign: "left",
      padding: "10px 12px",
      borderBottom: "1px solid rgba(0,0,0,.10)",
      fontSize: 12,
      color: "var(--muted, #666)",
      whiteSpace: "nowrap",
      position: "sticky",
      top: 0,
      background: "rgba(255,255,255,.95)",
      backdropFilter: "blur(6px)",
      zIndex: 1,
    },
    cell: {
      padding: "12px 12px",
      borderBottom: "1px solid rgba(0,0,0,.06)",
      verticalAlign: "top",
    },
    rowHover: {
      transition: "background .15s ease",
    },
  };

  return (
    <div style={{ padding: "22px 0 44px" }}>
      <div className="container">
        <div style={tableStyles.card}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>Admin — Bookings</h1>
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted, #666)" }}>
                {rows.length} total • {filtered.length} shown
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Admin token"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  minWidth: 240,
                  border: "1px solid rgba(0,0,0,.12)",
                }}
              />
              <button className="btn btnPrimary" onClick={() => load()} type="button" disabled={!token || loading}>
                {loading ? "Loading..." : "Load"}
              </button>
              <button className="btn btnGhost" onClick={() => load()} type="button" disabled={!token || loading}>
                Refresh
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, phone, email, zip..."
              style={{
                padding: 12,
                borderRadius: 12,
                minWidth: 260,
                flex: "1 1 260px",
                border: "1px solid rgba(0,0,0,.12)",
              }}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,.12)",
                background: "rgba(255,255,255,.8)",
              }}
            >
              <option value="all">All statuses ({counts.all})</option>
              <option value="new">New ({counts.new})</option>
              <option value="scheduled">Scheduled ({counts.scheduled})</option>
              <option value="completed">Completed ({counts.completed})</option>
              <option value="canceled">Canceled ({counts.canceled})</option>
            </select>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }}>
              <input
                type="checkbox"
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
                style={{ width: 16, height: 16 }}
              />
              Show extras/partial
            </label>
          </div>

          {/* Table */}
          <div
            style={{
              marginTop: 14,
              border: "1px solid rgba(0,0,0,.08)",
              borderRadius: 14,
              overflow: "hidden",
              background: "rgba(255,255,255,.75)",
            }}
          >
            <div style={{ overflowX: "auto", maxHeight: "70vh" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, minWidth: 980 }}>
                <thead>
                  <tr>
                    <th style={tableStyles.headCell}>Created</th>
                    <th style={tableStyles.headCell}>Customer</th>
                    <th style={tableStyles.headCell}>Service</th>
                    <th style={tableStyles.headCell}>Home</th>
                    <th style={tableStyles.headCell}>Total</th>
                    <th style={tableStyles.headCell}>Status</th>
                    <th style={tableStyles.headCell}>Assigned</th>
                    {showDetails && <th style={tableStyles.headCell}>Details</th>}
                  </tr>
                </thead>

                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={showDetails ? 8 : 7} style={{ padding: 14 }}>
                        {token ? "No bookings found." : "Enter token, then Load."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((b) => {
                      const status = String(b.status || "new");
                      const extras = pickSelected(b.extras).map(toTitle);
                      const partial = pickSelected(b.partial_cleaning).map(toTitle);

                      return (
                        <tr
                          key={b.id}
                          style={tableStyles.rowHover}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(15,118,110,.06)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ ...tableStyles.cell, whiteSpace: "nowrap", width: 170 }}>
                            {formatCreated(b.created_at)}
                          </td>

                          <td style={{ ...tableStyles.cell, minWidth: 220 }}>
                            <div style={{ fontWeight: 900 }}>{b.name || "—"}</div>
                            <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted, #666)" }}>
                              {b.phone || "—"}
                              {b.email ? ` • ${b.email}` : ""}
                            </div>
                          </td>

                          <td style={{ ...tableStyles.cell, minWidth: 210 }}>
                            <div style={{ fontWeight: 800 }}>{toTitle(b.frequency || "—")}</div>
                            <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted, #666)" }}>
                              Beds: {b.bedrooms ?? "—"} • Baths: {b.bathrooms ?? "—"}
                            </div>
                          </td>

                          <td style={{ ...tableStyles.cell, minWidth: 170 }}>
                            <div style={{ fontWeight: 800 }}>{toTitle(b.sqft || "—")}</div>
                            <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted, #666)" }}>
                              Zip: {b.zip || "—"}
                            </div>
                          </td>

                          <td style={{ ...tableStyles.cell, width: 120 }}>
                            <div style={{ fontWeight: 900, fontSize: 14 }}>{moneyFromCents(b.total_cents)}</div>
                          </td>

                          <td style={{ ...tableStyles.cell, width: 140 }}>
                            <span style={pillStyle(status)}>
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: 999,
                                  background:
                                    status === "new"
                                      ? "rgba(15,118,110,.8)"
                                      : status === "scheduled"
                                      ? "rgba(2,132,199,.8)"
                                      : status === "completed"
                                      ? "rgba(34,197,94,.8)"
                                      : status === "canceled"
                                      ? "rgba(239,68,68,.8)"
                                      : "rgba(0,0,0,.35)",
                                }}
                              />
                              {toTitle(status)}
                            </span>
                          </td>

                          <td style={{ ...tableStyles.cell, minWidth: 140 }}>
                            {b.assigned_cleaner ? (
                              <div style={{ fontWeight: 800 }}>{b.assigned_cleaner}</div>
                            ) : (
                              <span style={{ color: "var(--muted, #666)" }}>—</span>
                            )}
                          </td>

                          {showDetails && (
                            <td style={{ ...tableStyles.cell, minWidth: 280 }}>
                              <div style={{ fontSize: 12 }}>
                                <div style={{ fontWeight: 900, marginBottom: 4 }}>Extras</div>
                                <div style={{ color: "var(--muted, #666)", marginBottom: 10 }}>
                                  {extras.length ? extras.join(", ") : "—"}
                                </div>
                                <div style={{ fontWeight: 900, marginBottom: 4 }}>Not needed</div>
                                <div style={{ color: "var(--muted, #666)" }}>
                                  {partial.length ? partial.join(", ") : "—"}
                                </div>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted, #666)" }}>
            Tip: use Search + Status filter to find bookings quickly.
          </div>
        </div>
      </div>
    </div>
  );
}
