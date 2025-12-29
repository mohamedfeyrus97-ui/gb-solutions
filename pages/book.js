// pages/book.js
import { useMemo, useState } from "react";
import Link from "next/link";

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

// Display labels have NO parentheses.
const FREQUENCY = [
  { label: "Weekly", value: "weekly", multiplier: 0.85 },
  { label: "Every Other Week", value: "biweekly", multiplier: 1.0 }, // base
  { label: "Every 4 Weeks", value: "monthly", multiplier: 1.15 },
];

const ADDONS = [
  { id: "deep_clean", name: "Deep Cleaning", price: 40 },
  { id: "move_in_out", name: "Move In / Move Out", price: 40 },

  // Extras (no prices displayed; added to total)
  { id: "inside_cabinets", name: "Inside Cabinets", price: 25 },
  { id: "inside_fridge", name: "Inside Fridge", price: 25 },
  { id: "inside_oven", name: "Inside Oven", price: 25 },
  { id: "interior_windows", name: "Interior Windows", price: 25 },
  { id: "wet_wipe_blinds", name: "Wet Wipe Window Blinds", price: 25 },
  { id: "organization", name: "Organization", price: 25 },
  { id: "laundry_folding", name: "Laundry & Folding", price: 25 },
  { id: "dishes", name: "Dishes", price: 20 },
  { id: "green_cleaning", name: "Green Cleaning", price: 20 },
];

function money(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "$0.00";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function BookPage() {
  const BUSINESS = {
    name: "GB Solutions",
    tagline: "House Cleaning • Seattle & Bellevue",
  };

  const [frequency, setFrequency] = useState("biweekly");
  const [sqft, setSqft] = useState("1-999");
  const [bedrooms, setBedrooms] = useState("0");
  const [bathrooms, setBathrooms] = useState("1");
  const [zip, setZip] = useState("");
  const [addons, setAddons] = useState(() => new Set());

  // Contact: phone required, email optional
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const baseBiweekly = useMemo(() => {
    const row = SQFT_PRICES_BIWEEKLY.find((r) => r.value === sqft);
    return row ? row.price : 0;
  }, [sqft]);

  const freqMultiplier = useMemo(() => {
    const row = FREQUENCY.find((f) => f.value === frequency);
    return row ? row.multiplier : 1.0;
  }, [frequency]);

  const addonsTotal = useMemo(() => {
    let total = 0;
    for (const id of addons) {
      const item = ADDONS.find((a) => a.id === id);
      if (item) total += item.price;
    }
    return total;
  }, [addons]);

  const total = useMemo(() => {
    const adjustedBase = baseBiweekly * freqMultiplier;
    return Math.round((adjustedBase + addonsTotal) * 100) / 100;
  }, [baseBiweekly, freqMultiplier, addonsTotal]);

  function toggleAddon(id) {
    setAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const isPhoneValid = phone.trim().length >= 7; // basic client-side check

  function handleSubmit(e) {
    e.preventDefault();
    if (!isPhoneValid) return;

    // Demo-only: no backend included.
    // You can replace this with email API / form service later.
    alert("Saved (demo). Add a backend to actually receive bookings.");
  }

  return (
    <>
      {/* Header copied from Home layout; brand goes back to home page */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <Link className="brand" href="/" aria-label="GB Solutions home">
              {/* Put your transparent logo in: /public/logo.png */}
              <img
                src="/logo.png"
                alt="GB Solutions"
                style={{ width: 38, height: 38, objectFit: "contain" }}
              />
              <div className="brandText" style={{ marginLeft: 10 }}>
                <b>{BUSINESS.name}</b>
                <span>{BUSINESS.tagline}</span>
              </div>
            </Link>

            <nav className="links" aria-label="Primary">
              <Link href="/#services">Services</Link>
              <Link href="/#pricing">Pricing</Link>
              <Link href="/#process">Process</Link>
              <Link href="/#faq">FAQ</Link>
              <Link href="/#contact">Contact</Link>
            </nav>

            <div className="navCtas">
              <Link className="btn btnGhost" href="/book">
                Get a Quote
              </Link>
              <Link className="btn btnPrimary" href="/book">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: 84 }}>
        <section className="section" style={{ paddingTop: 16 }}>
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>Book Online</h2>
                <p>Select options to get an instant total.</p>
              </div>
            </div>

            <div className="split">
              {/* Left: form */}
              <div className="priceCard">
                <h3>What needs to be done?</h3>

                <div style={{ marginTop: 14 }}>
                  <div className="small" style={{ marginBottom: 8 }}>
                    Frequency
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {FREQUENCY.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        className={frequency === f.value ? "btn btnPrimary" : "btn"}
                        onClick={() => setFrequency(f.value)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 16 }} className="row">
                  <div style={{ flex: 1 }}>
                    <div className="small" style={{ marginBottom: 6 }}>
                      Bedrooms
                    </div>
                    <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
                      {Array.from({ length: 11 }).map((_, i) => (
                        <option key={i} value={String(i)}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div className="small" style={{ marginBottom: 6 }}>
                      Bathrooms
                    </div>
                    <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)}>
                      {Array.from({ length: 11 }).map((_, i) => (
                        <option key={i} value={String(i)}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="small" style={{ marginBottom: 6 }}>
                    Sq Ft
                  </div>
                  <select value={sqft} onChange={(e) => setSqft(e.target.value)}>
                    {SQFT_PRICES_BIWEEKLY.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="small" style={{ marginBottom: 6 }}>
                    Zip Code
                  </div>
                  <input
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="Zip code"
                    inputMode="numeric"
                  />
                </div>

                <div style={{ marginTop: 18 }}>
                  <h3 style={{ marginBottom: 8 }}>Select extras</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 10,
                    }}
                  >
                    {ADDONS.map((a) => {
                      const active = addons.has(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          className={active ? "btn btnPrimary" : "btn"}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px 12px",
                            height: 48,
                          }}
                          onClick={() => toggleAddon(a.id)}
                        >
                          <span>{a.name}</span>
                          <span aria-hidden="true">{active ? "✓" : "+"}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <h3 style={{ marginBottom: 8 }}>Customer details</h3>

                  <form className="form" onSubmit={handleSubmit}>
                    <div className="row">
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                      />
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                      />
                    </div>

                    <div className="row">
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (optional)"
                        type="email"
                      />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone (required)"
                        required
                      />
                    </div>

                    <button className="btn btnPrimary" type="submit" disabled={!isPhoneValid}>
                      Save Booking
                    </button>

                    {!isPhoneValid && (
                      <div className="small" style={{ marginTop: 8 }}>
                        Phone number is required.
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Right: summary */}
              <div className="priceCard" style={{ height: "fit-content" }}>
                <h3>Booking Summary</h3>

                <div className="miniList" style={{ marginTop: 10 }}>
                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>Frequency: {FREQUENCY.find((f) => f.value === frequency)?.label}</span>
                  </div>
                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>Bedrooms: {bedrooms}</span>
                  </div>
                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>Bathrooms: {bathrooms}</span>
                  </div>
                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>Sq Ft: {SQFT_PRICES_BIWEEKLY.find((s) => s.value === sqft)?.label}</span>
                  </div>
                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>Zip: {zip || "—"}</span>
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div className="small">Base</div>
                    <div className="small">{money(Math.round(baseBiweekly * freqMultiplier * 100) / 100)}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <div className="small">Extras</div>
                    <div className="small">{money(addonsTotal)}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                    <div style={{ fontWeight: 800 }}>TOTAL</div>
                    <div style={{ fontWeight: 800 }}>{money(total)}</div>
                  </div>

                  <div className="small" style={{ marginTop: 8 }}>
                    Total updates when you select options.
                  </div>
                </div>

                {addons.size > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div className="small" style={{ marginBottom: 6 }}>
                      Selected extras
                    </div>
                    <ul className="ul">
                      {[...addons].map((id) => {
                        const item = ADDONS.find((a) => a.id === id);
                        return item ? (
                          <li key={id}>
                            <span className="dot" /> <span>{item.name}</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
