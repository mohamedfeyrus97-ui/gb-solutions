// pages/admin.js
import { useMemo, useState } from "react";

const STATUS_OPTIONS = [
  { value: "received", label: "Received", tone: "yellow" },
  { value: "assigned", label: "Assigned", tone: "green" },
  { value: "completed", label: "Completed", tone: "teal" },
  { value: "canceled", label: "Canceled", tone: "red" },
];

function moneyFromCents(cents) {
  if (typeof cents !== "number") return "—";
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
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

function pillStyle(status) {
  const s = String(status || "received");
  const base = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    border: "1px solid rgba(0,0,0,.10)",
    whiteSpace: "nowrap",
  };

  if (s === "received")
    return { ...base, background: "rgba(234,179,8,.18)", border: "1px solid rgba(234,179,8,.35)" };
  if (s === "assigned")
    return { ...base, background: "rgba(34,197,94,.14)", border: "1px solid rgba(34,197,94,.30)" };
  if (s === "completed")
    return { ...base, background: "rgba(15,118,110,.10)", border: "1px solid rgba(15,118,110,.22)" };
  if (s === "canceled")
    return { ...base, background: "rgba(239,68,68,.12)", border: "1px solid rgba(239,68,68,.28)" };

  return { ...base, background: "rgba(255,255,255,.65)" };
}

export default function Admin() {
  const [token, setToken] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/bookings", {
      method: "GET",
      headers: { "x-admin-token": token },
    });
    const data = await r.json();
    setRows(r.ok && Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function patchBooking(id, patch) {
    const r = await fetch("/api/bookings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify({ id, ...patch }),
    });

    if (!r.ok) return;

    const updated = await r.json();
    setRows((prev) => prev.map((x) => (x.id === id ? updated : x)));
  }

  const filtered = useMemo(() => {
    let list = Array.isArray(rows) ? [...rows] : [];

    if (statusFilter !== "all") {
      list = list.filter((b) => String(b.status || "received") === statusFilter);
    }

    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter((b) => {
        const hay = [b.name, b.phone, b.email, b.zip, b.frequency, b.status, b.assigned_cleaner]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(term);
      });
    }

    return list;
  }, [rows, q, statusFilter]);

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
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22 }}>Admin — Bookings</h1>
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--muted, #666)" }}>
                {filtered.length} shown
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
              <button className="btn btnPrimary" onClick={load} type="button" disabled={!token || loading}>
                {loading ? "Loading..." : "Load"}
              </button>
              <button className="btn btnGhost" onClick={load} type="button" disabled={!token || loading}>
                Refresh
              </button>
            </div>
          </div>

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
                fontWeight: 800,
              }}
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Full-width cards: no horizontal scrolling */}
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 12 }}>{token ? "No bookings found." : "Enter token, then Load."}</div>
            ) : (
              filtered.map((b) => {
                const status = String(b.status || "received");
                const isOpen = openId === b.id;

                const extras = pickSelected(b.extras).map(toTitle);
                const partial = pickSelected(b.partial_cleaning).map(toTitle);

                return (
                  <div
                    key={b.id}
                    style={{
                      border: "1px solid rgba(0,0,0,.08)",
                      borderRadius: 14,
                      padding: 14,
                      background: "rgba(255,255,255,.75)",
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 900 }}>{formatCreated(b.created_at)}</div>
                        <span style={pillStyle(status)}>{toTitle(status)}</span>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{moneyFromCents(b.total_cents)}</div>
                    </div>

                    {/* Main content */}
                    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "var(--muted, #666)", fontWeight: 900 }}>Customer</div>
                        <div style={{ marginTop: 6, fontWeight: 900 }}>{b.name || "—"}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted, #666)", wordBreak: "break-word" }}>
                          {b.phone || "—"}
                          {b.email ? ` • ${b.email}` : ""}
                        </div>
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "var(--muted, #666)", fontWeight: 900 }}>Service</div>
                        <div style={{ marginTop: 6, fontWeight: 800 }}>
                          {toTitle(b.frequency || "—")} • Beds {b.bedrooms ?? "—"} • Baths {b.bathrooms ?? "—"}
                        </div>
                        <div style={{ marginTop: 4, fontSize: 12, color: "var(--muted, #666)" }}>
                          {toTitle(b.sqft || "—")} • Zip {b.zip || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--muted, #666)", fontWeight: 900 }}>Assign cleaner</div>
                        <input
                          defaultValue={b.assigned_cleaner || ""}
                          placeholder="Type cleaner name"
                          onBlur={(e) => {
                            const val = e.target.value.trim();

                            // If you entered a cleaner name, auto-set status to assigned
                            if (val) {
                              patchBooking(b.id, { assigned_cleaner: val, status: "assigned" });
                            } else {
                              patchBooking(b.id, { assigned_cleaner: "" });
                            }
                          }}
                          style={{
                            marginTop: 6,
                            width: "100%",
                            padding: 12,
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,.12)",
                            background: "rgba(255,255,255,.85)",
                            fontWeight: 700,
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ fontSize: 12, color: "var(--muted, #666)", fontWeight: 900 }}>Status</div>
                        <select
                          value={status}
                          onChange={(e) => patchBooking(b.id, { status: e.target.value })}
                          style={{
                            marginTop: 6,
                            width: "100%",
                            padding: 12,
                            borderRadius: 12,
                            border: "1px solid rgba(0,0,0,.12)",
                            background: "rgba(255,255,255,.85)",
                            fontWeight: 800,
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <button className="btn btnGhost" type="button" onClick={() => setOpenId(isOpen ? null : b.id)}>
                        {isOpen ? "Hide details" : "View details"}
                      </button>

                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="btn btnPrimary" type="button" onClick={() => patchBooking(b.id, { status: "assigned" })}>
                          Mark Assigned
                        </button>
                        <button className="btn btnGhost" type="button" onClick={() => patchBooking(b.id, { status: "completed" })}>
                          Mark Completed
                        </button>
                        <button className="btn btnGhost" type="button" onClick={() => patchBooking(b.id, { status: "canceled" })}>
                          Cancel
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    {isOpen && (
                      <div style={{ marginTop: 12, borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 12 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: "var(--muted, #666)", fontWeight: 900 }}>Extras</div>
                            <div style={{ marginTop: 6, fontSize: 13, color: "var(--text, #111)", wordBreak: "break-word" }}>
                              {extras.length ? extras.join(", ") : "—"}
                            </div>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12, color: "var(--muted, #666)", fontWeight: 900 }}>Not needed</div>
                            <div style={{ marginTop: 6, fontSize: 13, color: "var(--text, #111)", wordBreak: "break-word" }}>
                              {partial.length ? partial.join(", ") : "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mobile */}
                    <style jsx>{`
                      @media (max-width: 820px) {
                        .container :global(*) {}
                      }
                      @media (max-width: 760px) {
                        div[style*="grid-template-columns: 1fr 1fr"] {
                          grid-template-columns: 1fr !important;
                        }
                      }
                    `}</style>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
