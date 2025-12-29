// pages/book.js
// Requires: put your logo at /public/gb-logo.png (transparent PNG).
// Then it will show top-left in the header.

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

// Your rule: these base prices are for BI-WEEKLY.
// More frequent => -15%
// Less frequent => +15%
const FREQUENCY = [
  { label: "One-Time", value: "one_time", multiplier: 1.15 },
  { label: "Weekly", value: "weekly", multiplier: 0.85 },
  { label: "Every Other Week", value: "biweekly", multiplier: 1.0 },
  { label: "Every 4 Weeks", value: "every_4_weeks", multiplier: 1.15 },
];

const SERVICE_TYPES = [
  { label: "Standard Clean", value: "standard", add: 0 },
  { label: "Deep Clean", value: "deep", add: 40 },
  { label: "Move In / Move Out", value: "move", add: 40 },
];

// Prices are NOT displayed next to extras. They are only added to total.
// You can change OTHER_EXTRA_ADD to 20, 25, etc.
const OTHER_EXTRA_ADD = 25;

const EXTRAS = [
  { label: "Inside Cabinets", value: "inside_cabinets", add: OTHER_EXTRA_ADD },
  { label: "Interior Windows", value: "interior_windows", add: OTHER_EXTRA_ADD },
  { label: "Wet Wipe Window Blinds", value: "blinds", add: OTHER_EXTRA_ADD },
  { label: "Inside Fridge", value: "inside_fridge", add: OTHER_EXTRA_ADD },
  { label: "Inside Oven", value: "inside_oven", add: OTHER_EXTRA_ADD },
  { label: "Green Cleaning", value: "green_cleaning", add: OTHER_EXTRA_ADD },
  { label: "Organization", value: "organization", add: OTHER_EXTRA_ADD },
  { label: "Laundry & Folding", value: "laundry", add: OTHER_EXTRA_ADD },
  { label: "Dishes", value: "dishes", add: OTHER_EXTRA_ADD },
];

// Partial cleaning: “Select what doesn’t need to be done”
const PARTIAL_OPTIONS = [
  { label: "Bedroom", value: "pc_bedroom", subtract: 8.2 },
  { label: "Full Bathroom", value: "pc_full_bath", subtract: 8.2 },
  { label: "Half Bathroom", value: "pc_half_bath", subtract: 5.0 },
  { label: "Kitchen", value: "pc_kitchen", subtract: 8.2 },
  { label: "Living Room", value: "pc_living", subtract: 8.2 },
  { label: "Entire Basement", value: "pc_basement", subtract: 15.0 },
];

function money(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export default function BookPage() {
  // selections
  const [sqft, setSqft] = useState(SQFT_PRICES_BIWEEKLY[0].value);
  const [frequency, setFrequency] = useState("one_time");
  const [serviceType, setServiceType] = useState("standard");

  // bedrooms and bathrooms
  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(1); // supports .5 increments

  // extras
  const [extras, setExtras] = useState(() => new Set());

  // partial cleaning section
  const [partialEnabled, setPartialEnabled] = useState(false);
  const [partialOpen, setPartialOpen] = useState(false);
  const [partialSelections, setPartialSelections] = useState(() => new Set());

  // customer form (phone required, email optional)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");

  const baseSqft = useMemo(() => {
    const row = SQFT_PRICES_BIWEEKLY.find((r) => r.value === sqft);
    return row ? row.price : 0;
  }, [sqft]);

  const freqMultiplier = useMemo(() => {
    const row = FREQUENCY.find((r) => r.value === frequency);
    return row ? row.multiplier : 1;
  }, [frequency]);

  const serviceAdd = useMemo(() => {
    const row = SERVICE_TYPES.find((r) => r.value === serviceType);
    return row ? row.add : 0;
  }, [serviceType]);

  // “Also when selecting bathroom and bedrooms amount the price should increase 9.30 each
  // except for the .5 variable”
  const bedBathAdd = useMemo(() => {
    const BEDROOM_ADD_EACH = 9.3;
    const BATHROOM_ADD_EACH = 9.3;
    const bedAdd = bedrooms * BEDROOM_ADD_EACH;
    const bathAdd = bathrooms * BATHROOM_ADD_EACH; // 0.5 => 4.65
    return bedAdd + bathAdd;
  }, [bedrooms, bathrooms]);

  const extrasAdd = useMemo(() => {
    let sum = 0;
    for (const x of EXTRAS) {
      if (extras.has(x.value)) sum += x.add;
    }
    return sum;
  }, [extras]);

  const partialSubtract = useMemo(() => {
    if (!partialEnabled) return 0;
    let sum = 0;
    for (const p of PARTIAL_OPTIONS) {
      if (partialSelections.has(p.value)) sum += p.subtract;
    }
    return sum;
  }, [partialEnabled, partialSelections]);

  const total = useMemo(() => {
    const subtotalBiweekly = baseSqft + serviceAdd + bedBathAdd + extrasAdd - partialSubtract;
    const adjusted = subtotalBiweekly * freqMultiplier;
    return clamp(adjusted, 0, 999999);
  }, [baseSqft, serviceAdd, bedBathAdd, extrasAdd, partialSubtract, freqMultiplier]);

  function toggleSetValue(setter, value) {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function submit(e) {
    e.preventDefault();

    // minimal client validation: phone required
    if (!phone.trim()) {
      alert("Phone number is required.");
      return;
    }

    // Example: replace this with your real backend/email later.
    // For now it just shows a confirmation.
    alert("Booking request captured (demo). Connect a backend to store/send this.");
  }

  // bathrooms options: 0, 0.5, 1, 1.5, ...
  const bathroomOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i <= 10; i += 1) {
      opts.push(i);
      if (i < 10) opts.push(i + 0.5);
    }
    // keep ascending + unique
    const uniq = Array.from(new Set(opts)).sort((a, b) => a - b);
    return uniq;
  }, []);

  return (
    <>
      {/* Header (clicking brand goes back to home page) */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <a className="brand" href="/" aria-label="GB Solutions home">
              <img
                src="/gb-logo.png"
                alt="GB Solutions"
                style={{ width: 44, height: 44, objectFit: "contain" }}
              />
              <div className="brandText" style={{ marginLeft: 10 }}>
                <b>GB Solutions</b>
                <span>House Cleaning • Seattle & Bellevue</span>
              </div>
            </a>

            <nav className="links" aria-label="Primary">
              <a href="/#services">Services</a>
              <a href="/#pricing">Pricing</a>
              <a href="/#faq">FAQ</a>
              <a href="/#contact">Contact</a>
            </nav>

            <div className="navCtas">
              <a className="btn btnGhost" href="/book">
                Book Now
              </a>
              <a className="btn btnPrimary" href="/book">
                Get a Quote
              </a>
            </div>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: 28 }}>
        <section className="section">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>Book Online</h2>
                <p>Instant price. Select options to update total.</p>
              </div>
            </div>

            <div className="split">
              {/* LEFT: form/options */}
              <div className="priceCard">
                {/* Frequency */}
                <div style={{ marginBottom: 16 }}>
                  <div className="small" style={{ marginBottom: 8 }}>
                    Frequency
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {FREQUENCY.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        className={`pill ${frequency === f.value ? "pillActive" : ""}`}
                        onClick={() => setFrequency(f.value)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Service */}
                  <div>
                    <div className="small" style={{ marginBottom: 6 }}>
                      Service
                    </div>
                    <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                      {SERVICE_TYPES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sq Ft */}
                  <div>
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

                  {/* Bedrooms */}
                  <div>
                    <div className="small" style={{ marginBottom: 6 }}>
                      Bedrooms
                    </div>
                    <select
                      value={bedrooms}
                      onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
                    >
                      {Array.from({ length: 11 }).map((_, i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Bathrooms (with .5 options) */}
                  <div>
                    <div className="small" style={{ marginBottom: 6 }}>
                      Bathrooms
                    </div>
                    <select
                      value={bathrooms}
                      onChange={(e) => setBathrooms(parseFloat(e.target.value))}
                    >
                      {bathroomOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Partial cleaning (collapsed unless clicked) */}
                <div style={{ marginTop: 18 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={partialEnabled}
                      onChange={(e) => {
                        const on = e.target.checked;
                        setPartialEnabled(on);
                        if (!on) {
                          setPartialSelections(new Set());
                          setPartialOpen(false);
                        } else {
                          setPartialOpen(true);
                        }
                      }}
                    />
                    <b>This Is Partial Cleaning Only</b>
                  </label>

                  {partialEnabled && (
                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => setPartialOpen((v) => !v)}
                      >
                        {partialOpen ? "Hide" : "Show"} Partial Options
                      </button>

                      {partialOpen && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: 700, marginBottom: 10 }}>
                            Select What Does Not Need To Be Done
                          </div>

                          <div className="tileGrid">
                            {PARTIAL_OPTIONS.map((p) => {
                              const on = partialSelections.has(p.value);
                              return (
                                <button
                                  key={p.value}
                                  type="button"
                                  className={`tile ${on ? "tileOn" : ""}`}
                                  onClick={() => toggleSetValue(setPartialSelections, p.value)}
                                >
                                  {p.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Extras */}
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Select Extras</div>
                  <div className="tileGrid">
                    {EXTRAS.map((x) => {
                      const on = extras.has(x.value);
                      return (
                        <button
                          key={x.value}
                          type="button"
                          className={`tile ${on ? "tileOn" : ""}`}
                          onClick={() => toggleSetValue(setExtras, x.value)}
                        >
                          {x.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer details */}
                <form onSubmit={submit} style={{ marginTop: 22 }}>
                  <div style={{ fontWeight: 700, marginBottom: 10 }}>Customer Details</div>

                  <div className="row">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name"
                      required
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      required
                    />
                  </div>

                  <div className="row">
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address (optional)"
                    />
                    <input
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="Zip Code"
                    />
                  </div>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special notes or instructions"
                  />

                  <button className="btn btnPrimary" type="submit" style={{ marginTop: 12 }}>
                    Save Booking
                  </button>
                </form>
              </div>

              {/* RIGHT: summary */}
              <div className="priceCard">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>Booking Summary</div>
                    <div className="small">Home Cleaning</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="small">Total</div>
                    <div style={{ fontWeight: 900, fontSize: 24 }}>{money(total)}</div>
                  </div>
                </div>

                <div style={{ marginTop: 14 }} className="miniList">
                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>
                      Frequency: {FREQUENCY.find((f) => f.value === frequency)?.label || "-"}
                    </span>
                  </div>

                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>
                      Service: {SERVICE_TYPES.find((s) => s.value === serviceType)?.label || "-"}
                    </span>
                  </div>

                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>Sq Ft: {SQFT_PRICES_BIWEEKLY.find((s) => s.value === sqft)?.label || "-"}</span>
                  </div>

                  <div className="miniItem">
                    <span className="tick">•</span>
                    <span>Bedrooms: {bedrooms}</span>
                  </div>

                  <div className="miniItem
