// pages/book.js
import { useMemo, useState } from "react";

const SQFT_PRICES_BIWEEKLY = [
  { label: "1 - 999 Sq Ft", value: "1-999", price: 92.65 },
  { label: "1000 - 1499 Sq Ft", value: "1000-1499", price: 109.65 },
  { label: "1500 - 1999 Sq Ft", value: "1500-1999", price: 126.65 },
  { label: "2000 - 2499 Sq Ft", value: "2000-2499", price: 143.65 },
  { label: "2500 - 2999 Sq Ft", value: "2500-2999", price: 160.65 },
  { label: "3000 - 3499 Sq Ft", value: "3000-3499", price: 177.65 },
  { label: "3500 - 3999 Sq Ft", value: "3500-3999", price: 194.65 },
  { label: "4000 - 4499 Sq Ft", value: "4000-4499", price: 211.65 },
  { label: "4500 - 4999 Sq Ft", value: "4500-4999", price: 228.65 },
  { label: "5000 - 5499 Sq Ft", value: "5000-5499", price: 262.65 },
];

// Prices above are for BI-WEEKLY.
// More frequent => -15%. Less frequent => +15%.
const FREQUENCY = [
  { label: "One-Time", value: "one_time", multiplier: 1.15 },
  { label: "Weekly", value: "weekly", multiplier: 0.85 },
  { label: "Every Other Week", value: "biweekly", multiplier: 1.0 },
  { label: "Every 4 Weeks", value: "every_4_weeks", multiplier: 1.15 },
];

const EXTRAS = [
  { key: "deep_cleaning", label: "Deep Cleaning", add: 40 },
  { key: "move_in_out", label: "Move In / Move Out", add: 40 },

  { key: "inside_cabinets", label: "Inside Cabinets", add: 25 },
  { key: "inside_fridge", label: "Inside Fridge", add: 25 },
  { key: "inside_oven", label: "Inside Oven", add: 25 },
  { key: "interior_windows", label: "Interior Windows", add: 25 },
  { key: "wet_wipe_window_blinds", label: "Wet Wipe Window Blinds", add: 25 },
  { key: "organization", label: "Organization", add: 25 },
  { key: "laundry_folding", label: "Laundry & Folding", add: 25 },
  { key: "dishes", label: "Dishes", add: 25 },
  { key: "green_cleaning", label: "Green Cleaning", add: 25 },
];

const PARTIAL_OPTIONS = [
  { key: "bedroom", label: "Bedroom", off: 8.2 },
  { key: "full_bath", label: "Full Bathroom", off: 8.2 },
  { key: "half_bath", label: "Half Bathroom", off: 5.0 },
  { key: "kitchen", label: "Kitchen", off: 8.2 },
  { key: "living_room", label: "Living Room", off: 8.2 },
  { key: "entire_basement", label: "Entire Basement", off: 15.0 },
];

function money(n) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function clampMin0(n) {
  return n < 0 ? 0 : n;
}

export default function Book() {
  // Booking inputs
  const [frequency, setFrequency] = useState("biweekly");
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(1); // supports 0.5 increments
  const [sqft, setSqft] = useState("1-999");
  const [zip, setZip] = useState("");

  // Partial cleaning (collapsed)
  const [partialEnabled, setPartialEnabled] = useState(false);
  const [partialOpen, setPartialOpen] = useState(false);
  const [partialSelected, setPartialSelected] = useState({}); // key -> bool

  // Extras
  const [extrasSelected, setExtrasSelected] = useState({}); // key -> bool

  // Customer details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(""); // optional
  const [phone, setPhone] = useState(""); // required

  const freqObj = useMemo(
    () => FREQUENCY.find((f) => f.value === frequency) || FREQUENCY[2],
    [frequency]
  );

  const sqftObj = useMemo(
    () =>
      SQFT_PRICES_BIWEEKLY.find((s) => s.value === sqft) ||
      SQFT_PRICES_BIWEEKLY[0],
    [sqft]
  );

  const bathroomsOptions = useMemo(() => {
    // 0 to 6 in 0.5 steps
    const opts = [];
    for (let v = 0; v <= 6; v += 0.5) opts.push(v);
    return opts;
  }, []);

  const priceBreakdown = useMemo(() => {
    const baseFromSqft = sqftObj.price * freqObj.multiplier;

    // Bedrooms: +$9.30 each
    const bedroomsAdd = bedrooms * 9.3;

    // Bathrooms: +$9.30 per full; +$4.65 for the .5
    const fullBaths = Math.floor(bathrooms);
    const half = bathrooms - fullBaths >= 0.5 ? 1 : 0;
    const bathroomsAdd = fullBaths * 9.3 + half * 4.65;

    const extrasAdd = EXTRAS.reduce(
      (sum, e) => sum + (extrasSelected[e.key] ? e.add : 0),
      0
    );

    const partialOff = partialEnabled
      ? PARTIAL_OPTIONS.reduce(
          (sum, p) => sum + (partialSelected[p.key] ? p.off : 0),
          0
        )
      : 0;

    const base = baseFromSqft;
    const adjustments = bedroomsAdd + bathroomsAdd;
    const extras = extrasAdd;
    const discounts = partialOff;

    const total = clampMin0(base + adjustments + extras - discounts);

    return {
      base,
      adjustments,
      extras,
      discounts,
      total,
    };
  }, [
    sqftObj,
    freqObj,
    bedrooms,
    bathrooms,
    extrasSelected,
    partialEnabled,
    partialSelected,
  ]);

  function toggleExtra(key) {
    setExtrasSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function togglePartial(key) {
    setPartialSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // ✅ ONLY CHANGE: onSave updated to match /pages/api/bookings.js expected fields
  async function onSave(e) {
    e.preventDefault();
    if (!phone.trim()) return;

    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      frequency, // keep as your existing values (one_time/weekly/biweekly/every_4_weeks)
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      sqft, // keep as your existing values (1-999, 1000-1499, etc.)
      zip: zip.trim() || null,
      extras: extrasSelected,
      partial_cleaning: partialEnabled ? partialSelected : {},
      total_cents: Math.round(priceBreakdown.total * 100),
    };

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error || "Failed to save booking");
      return;
    }

    alert("Booking submitted successfully");
  }

  const selectedExtrasList = useMemo(() => {
    return EXTRAS.filter((e) => extrasSelected[e.key]).map((e) => e.label);
  }, [extrasSelected]);

  const selectedPartialList = useMemo(() => {
    if (!partialEnabled) return [];
    return PARTIAL_OPTIONS.filter((p) => partialSelected[p.key]).map((p) => p.label);
  }, [partialEnabled, partialSelected]);

  return (
    <>
      {/* Header. Logo must exist at /public/gb-logo.png */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <a className="brand" href="/" aria-label="GB Solutions home">
              <img
                src="/gb-logo.png"
                alt="GB Solutions"
                style={{
                  width: 36,
                  height: 36,
                  objectFit: "contain",
                  display: "block",
                  marginRight: 10,
                }}
              />
              <div className="brandText">
                <b>GB Solutions</b>
                <span>House Cleaning • Seattle & Bellevue</span>
              </div>
            </a>

            <nav className="links" aria-label="Primary">
              <a href="/#services">Services</a>
              <a href="/#pricing">Pricing</a>
              <a href="/#process">Process</a>
              <a href="/#faq">FAQ</a>
              <a href="/#contact">Contact</a>
            </nav>

            <div className="navCtas">
              <a className="btn btnGhost" href="/#contact">
                Get a Quote
              </a>
              <a className="btn btnPrimary" href="/book">
                Book Now
              </a>
            </div>
          </div>
        </div>
      </header>

      <main style={{ padding: "22px 0 44px" }}>
        <div className="container">
          <div
            className="bookGrid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.05fr 0.95fr",
              gap: 18,
              alignItems: "start",
            }}
          >
            {/* LEFT */}
            <div className="bookLeft">
              <div
                className="bookCard"
                style={{
                  border: "1px solid var(--border, rgba(0,0,0,.08))",
                  borderRadius: 16,
                  padding: 18,
                  background: "rgba(255,255,255,.85)",
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>What needs to be done?</h2>

                {/* Frequency */}
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted, #666)",
                      marginBottom: 8,
                    }}
                  >
                    Frequency
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {FREQUENCY.map((f) => {
                      const active = f.value === frequency;
                      return (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => setFrequency(f.value)}
                          className={active ? "pill pillActive" : "pill"}
                          style={{
                            border: "1px solid var(--border, rgba(0,0,0,.1))",
                            borderRadius: 999,
                            padding: "8px 12px",
                            background: active
                              ? "var(--primary, #0f766e)"
                              : "rgba(255,255,255,.8)",
                            color: active ? "#fff" : "var(--text, #111)",
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bedrooms / Bathrooms */}
                <div
                  style={{
                    marginTop: 14,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted, #666)",
                        marginBottom: 6,
                      }}
                    >
                      Bedrooms
                    </div>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(Number(e.target.value))}
                      style={{ width: "100%", padding: 12, borderRadius: 12 }}
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted, #666)",
                        marginBottom: 6,
                      }}
                    >
                      Bathrooms
                    </div>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(Number(e.target.value))}
                      style={{ width: "100%", padding: 12, borderRadius: 12 }}
                    >
                      {bathroomsOptions.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sq Ft */}
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted, #666)",
                      marginBottom: 6,
                    }}
                  >
                    Sq Ft
                  </div>
                  <select
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    style={{ width: "100%", padding: 12, borderRadius: 12 }}
                  >
                    {SQFT_PRICES_BIWEEKLY.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zip */}
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted, #666)",
                      marginBottom: 6,
                    }}
                  >
                    Zip code
                  </div>
                  <input
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="Zip code"
                    style={{ width: "100%", padding: 12, borderRadius: 12 }}
                  />
                </div>

                {/* Partial cleaning (collapsed) */}
                <div style={{ marginTop: 14 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={partialEnabled}
                      onChange={(e) => {
                        const v = e.target.checked;
                        setPartialEnabled(v);
                        if (!v) {
                          setPartialOpen(false);
                          setPartialSelected({});
                        }
                      }}
                      style={{ width: 18, height: 18 }}
                    />
                    <span style={{ fontWeight: 700 }}>
                      This Is Partial Cleaning Only
                    </span>
                  </label>

                  {partialEnabled && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={() => setPartialOpen((v) => !v)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          borderRadius: 12,
                          border: "1px solid var(--border, rgba(0,0,0,.1))",
                          background: "rgba(255,255,255,.7)",
                          cursor: "pointer",
                          fontWeight: 700,
                        }}
                      >
                        Select what doesn’t need to be done{" "}
                        {partialOpen ? "▲" : "▼"}
                      </button>

                      {partialOpen && (
                        <div style={{ marginTop: 10 }}>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(3, minmax(0, 1fr))",
                              gap: 10,
                            }}
                          >
                            {PARTIAL_OPTIONS.map((p) => {
                              const on = !!partialSelected[p.key];
                              return (
                                <button
                                  key={p.key}
                                  type="button"
                                  onClick={() => togglePartial(p.key)}
                                  style={{
                                    padding: 12,
                                    borderRadius: 12,
                                    border:
                                      "1px solid var(--border, rgba(0,0,0,.1))",
                                    background: on
                                      ? "rgba(15,118,110,.10)"
                                      : "rgba(255,255,255,.75)",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: 13,
                                  }}
                                >
                                  {p.label}
                                </button>
                              );
                            })}
                          </div>

                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 12,
                              color: "var(--muted, #666)",
                            }}
                          >
                            Discount applied automatically to total when selected.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Extras */}
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>
                    Select extras
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {EXTRAS.map((e) => {
                      const on = !!extrasSelected[e.key];
                      return (
                        <button
                          key={e.key}
                          type="button"
                          onClick={() => toggleExtra(e.key)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 12px",
                            borderRadius: 14,
                            border:
                              "1px solid var(--border, rgba(0,0,0,.1))",
                            background: on
                              ? "rgba(15,118,110,.10)"
                              : "rgba(255,255,255,.75)",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          <span>{e.label}</span>
                          <span style={{ fontWeight: 900, fontSize: 16 }}>
                            {on ? "−" : "+"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer details */}
                <form onSubmit={onSave} style={{ marginTop: 18 }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>
                    Customer details
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                      style={{ padding: 12, borderRadius: 12 }}
                    />
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      style={{ padding: 12, borderRadius: 12 }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email (optional)"
                      style={{ padding: 12, borderRadius: 12 }}
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone (required)"
                      required
                      style={{ padding: 12, borderRadius: 12 }}
                    />
                  </div>

                  <button
                    className="btn btnPrimary"
                    type="submit"
                    style={{ width: "100%", marginTop: 14 }}
                  >
                    Save Booking
                  </button>

                  {!phone.trim() && (
                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: "var(--muted, #666)",
                      }}
                    >
                      Phone number is required.
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* RIGHT */}
            <div className="bookRight">
              <div
                className="summaryCard"
                style={{
                  border: "1px solid var(--border, rgba(0,0,0,.08))",
                  borderRadius: 16,
                  padding: 18,
                  background: "rgba(255,255,255,.85)",
                  position: "sticky",
                  top: 90,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>Booking Summary</h2>

                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "rgba(15,118,110,.35)",
                      }}
                    />
                    <span>Frequency: {freqObj.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "rgba(15,118,110,.35)",
                      }}
                    />
                    <span>Bedrooms: {bedrooms}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "rgba(15,118,110,.35)",
                      }}
                    />
                    <span>Bathrooms: {bathrooms}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "rgba(15,118,110,.35)",
                      }}
                    />
                    <span>Sq Ft: {sqftObj.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: "rgba(15,118,110,.35)",
                      }}
                    />
                    <span>Zip: {zip ? zip : "—"}</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 14,
                    borderTop: "1px solid var(--border, rgba(0,0,0,.1))",
                    paddingTop: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span>Base</span>
                    <b>{money(priceBreakdown.base)}</b>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span style={{ fontWeight: 900, letterSpacing: 0.2 }}>
                      TOTAL
                    </span>
                    <span style={{ fontWeight: 900, fontSize: 20 }}>
                      {money(priceBreakdown.total)}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "var(--muted, #666)",
                    }}
                  >
                    Total updates when you select options.
                  </div>
                </div>

                {(selectedExtrasList.length > 0 || selectedPartialList.length > 0) && (
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted, #666)" }}>
                    {selectedExtrasList.length > 0 && (
                      <div>
                        <b>Extras:</b> {selectedExtrasList.join(", ")}
                      </div>
                    )}
                    {selectedPartialList.length > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <b>Not needed:</b> {selectedPartialList.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <style jsx>{`
            @media (max-width: 920px) {
              .bookGrid {
                grid-template-columns: 1fr !important;
              }
              .summaryCard {
                position: static !important;
                top: auto !important;
              }
            }
          `}</style>
        </div>
      </main>
    </>
  );
}
