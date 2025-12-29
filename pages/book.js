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

// Base prices are BI-WEEKLY.
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

// Extras add to total but do NOT show prices next to them.
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
  const [sqft, setSqft] = useState(SQFT_PRICES_BIWEEKLY[0].value);
  const [frequency, setFrequency] = useState("one_time");
  const [serviceType, setServiceType] = useState("standard");

  const [bedrooms, setBedrooms] = useState(0);
  const [bathrooms, setBathrooms] = useState(1);

  const [extras, setExtras] = useState(() => new Set());

  const [partialEnabled, setPartialEnabled] = useState(false);
  const [partialOpen, setPartialOpen] = useState(false);
  const [partialSelections, setPartialSelections] = useState(() => new Set());

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

  // Bedrooms and bathrooms add $9.30 each. Bathrooms supports .5 (0.5 => +4.65).
  const bedBathAdd = useMemo(() => {
    const ADD = 9.3;
    return bedrooms * ADD + bathrooms * ADD;
  }, [bedrooms, bathrooms]);

  const extrasAdd = useMemo(() => {
    let sum = 0;
    for (const x of EXTRAS) if (extras.has(x.value)) sum += x.add;
    return sum;
  }, [extras]);

  const partialSubtract = useMemo(() => {
    if (!partialEnabled) return 0;
    let sum = 0;
    for (const p of PARTIAL_OPTIONS) if (partialSelections.has(p.value)) sum += p.subtract;
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

  const bathroomOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i <= 10; i += 1) {
      opts.push(i);
      if (i < 10) opts.push(i + 0.5);
    }
    return Array.from(new Set(opts)).sort((a, b) => a - b);
  }, []);

  function submit(e) {
    e.preventDefault();
    if (!phone.trim()) {
      alert("Phone number is required.");
      return;
    }
    alert("Booking request captured (demo). Add a backend to store/send it.");
  }

  return (
    <>
      {/* Header (brand goes back home) */}
      <header className="gbHeader">
        <div className="gbContainer">
          <div className="gbNav">
            <a className="gbBrand" href="/" aria-label="GB Solutions home">
              <img
                src="/gb-logo.png"
                alt="GB Solutions"
                className="gbLogo"
              />
              <div className="gbBrandText">
                <b>GB Solutions</b>
                <span>House Cleaning • Seattle & Bellevue</span>
              </div>
            </a>

            <nav className="gbLinks" aria-label="Primary">
              <a href="/#services">Services</a>
              <a href="/#pricing">Pricing</a>
              <a href="/#faq">FAQ</a>
              <a href="/#contact">Contact</a>
            </nav>

            <div className="gbCtas">
              <a className="gbBtn gbBtnGhost" href="/book">Book Now</a>
              <a className="gbBtn gbBtnPrimary" href="/book">Get a Quote</a>
            </div>
          </div>
        </div>
      </header>

      <main className="gbMain">
        <section className="gbSection">
          <div className="gbContainer">
            <div className="gbSectionHead">
              <div>
                <h2>Book Online</h2>
                <p>Instant price. Select options to update total.</p>
              </div>
            </div>

            <div className="gbSplit">
              {/* Left */}
              <div className="gbCard">
                <div className="gbBlock">
                  <div className="gbLabel">Frequency</div>
                  <div className="gbPills">
                    {FREQUENCY.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        className={`gbPill ${frequency === f.value ? "gbPillActive" : ""}`}
                        onClick={() => setFrequency(f.value)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="gbGrid2">
                  <div>
                    <div className="gbLabel">Service</div>
                    <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
                      {SERVICE_TYPES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="gbLabel">Sq Ft</div>
                    <select value={sqft} onChange={(e) => setSqft(e.target.value)}>
                      {SQFT_PRICES_BIWEEKLY.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="gbLabel">Bedrooms</div>
                    <select value={bedrooms} onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}>
                      {Array.from({ length: 11 }).map((_, i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="gbLabel">Bathrooms</div>
                    <select value={bathrooms} onChange={(e) => setBathrooms(parseFloat(e.target.value))}>
                      {bathroomOptions.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Partial cleaning */}
                <div className="gbBlock">
                  <label className="gbCheckRow">
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
                    <div className="gbPartial">
                      <button type="button" className="gbBtn" onClick={() => setPartialOpen((v) => !v)}>
                        {partialOpen ? "Hide" : "Show"} Partial Options
                      </button>

                      {partialOpen && (
                        <div className="gbPartialInner">
                          <div className="gbTitle">Select What Does Not Need To Be Done</div>
                          <div className="gbTileGrid">
                            {PARTIAL_OPTIONS.map((p) => {
                              const on = partialSelections.has(p.value);
                              return (
                                <button
                                  key={p.value}
                                  type="button"
                                  className={`gbTile ${on ? "gbTileOn" : ""}`}
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
                <div className="gbBlock">
                  <div className="gbTitle">Select Extras</div>
                  <div className="gbTileGrid">
                    {EXTRAS.map((x) => {
                      const on = extras.has(x.value);
                      return (
                        <button
                          key={x.value}
                          type="button"
                          className={`gbTile ${on ? "gbTileOn" : ""}`}
                          onClick={() => toggleSetValue(setExtras, x.value)}
                        >
                          {x.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Customer details */}
                <form onSubmit={submit} className="gbForm">
                  <div className="gbTitle">Customer Details</div>

                  <div className="gbRow">
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

                  <div className="gbRow">
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

                  <button className="gbBtn gbBtnPrimary" type="submit">Save Booking</button>
                </form>
              </div>

              {/* Right */}
              <div className="gbCard">
                <div className="gbSummaryTop">
                  <div>
                    <div className="gbSummaryTitle">Booking Summary</div>
                    <div className="gbSmall">Home Cleaning</div>
                  </div>
                  <div className="gbTotalBox">
                    <div className="gbSmall">Total</div>
                    <div className="gbTotal">{money(total)}</div>
                  </div>
                </div>

                <div className="gbList">
                  <div className="gbItem">
                    <span className="gbDot">•</span>
                    <span>Frequency: {FREQUENCY.find((f) => f.value === frequency)?.label || "-"}</span>
                  </div>
                  <div className="gbItem">
                    <span className="gbDot">•</span>
                    <span>Service: {SERVICE_TYPES.find((s) => s.value === serviceType)?.label || "-"}</span>
                  </div>
                  <div className="gbItem">
                    <span className="gbDot">•</span>
                    <span>Sq Ft: {SQFT_PRICES_BIWEEKLY.find((s) => s.value === sqft)?.label || "-"}</span>
                  </div>
                  <div className="gbItem">
                    <span className="gbDot">•</span>
                    <span>Bedrooms: {bedrooms}</span>
                  </div>
                  <div className="gbItem">
                    <span className="gbDot">•</span>
                    <span>Bathrooms: {bathrooms}</span>
                  </div>
                  <div className="gbItem">
                    <span className="gbDot">•</span>
                    <span>Extras selected: {extras.size}</span>
                  </div>
                  <div className="gbItem">
                    <span className="gbDot">•</span>
                    <span>Partial options selected: {partialEnabled ? partialSelections.size : 0}</span>
                  </div>
                </div>

                <div className="gbSmall" style={{ marginTop: 14 }}>
                  Note: This page calculates pricing in-browser. To actually accept bookings, connect a backend (form service, email API, or database).
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .gbHeader { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.9); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0,0,0,0.08); }
        .gbContainer { max-width: 1100px; margin: 0 auto; padding: 14px 16px; }
        .gbNav { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .gbBrand { display: flex; align-items: center; text-decoration: none; color: inherit; gap: 10px; }
        .gbLogo { width: 44px; height: 44px; object-fit: contain; display: block; }
        .gbBrandText b { display: block; font-size: 16px; line-height: 1.1; }
        .gbBrandText span { display: block; font-size: 12px; opacity: 0.75; margin-top: 2px; }

        .gbLinks { display: flex; gap: 14px; }
        .gbLinks a { text-decoration: none; color: inherit; opacity: 0.8; }
        .gbLinks a:hover { opacity: 1; }

        .gbCtas { display: flex; gap: 10px; }
        .gbBtn { border: 1px solid rgba(0,0,0,0.12); background: white; padding: 10px 12px; border-radius: 12px; cursor: pointer; text-decoration: none; color: inherit; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; }
        .gbBtnPrimary { background: #0b6b5d; color: white; border-color: #0b6b5d; }
        .gbBtnGhost { background: transparent; }

        .gbMain { padding: 22px 0 60px; }
        .gbSectionHead h2 { margin: 0; }
        .gbSectionHead p { margin: 6px 0 0; opacity: 0.75; }

        .gbSplit { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; margin-top: 14px; }
        .gbCard { border: 1px solid rgba(0,0,0,0.10); border-radius: 16px; background: rgba(255,255,255,0.85); padding: 16px; }
        .gbBlock { margin-top: 16px; }
        .gbBlock:first-child { margin-top: 0; }
        .gbLabel { font-size: 12px; opacity: 0.75; margin-bottom: 8px; }
        .gbSmall { font-size: 12px; opacity: 0.75; }

        .gbPills { display: flex; gap: 8px; flex-wrap: wrap; }
        .gbPill { border: 1px solid rgba(0,0,0,0.12); background: white; padding: 8px 10px; border-radius: 999px; cursor: pointer; font-weight: 600; }
        .gbPillActive { background: #0b6b5d; color: white; border-color: #0b6b5d; }

        .gbGrid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; }
        select, input, textarea { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.12); background: rgba(255,255,255,0.9); }
        textarea { min-height: 110px; resize: vertical; }

        .gbCheckRow { display: flex; align-items: center; gap: 10px; margin-top: 6px; }

        .gbPartial { margin-top: 10px; }
        .gbPartialInner { margin-top: 12px; }
        .gbTitle { font-weight: 800; margin-bottom: 10px; }

        .gbTileGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .gbTile { border: 1px solid rgba(0,0,0,0.12); border-radius: 14px; padding: 12px; background: white; cursor: pointer; font-weight: 700; }
        .gbTileOn { outline: 2px solid #0b6b5d; border-color: #0b6b5d; }

        .gbForm { margin-top: 18px; }
        .gbRow { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }

        .gbSummaryTop { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .gbSummaryTitle { font-weight: 900; font-size: 18px; }
        .gbTotalBox { text-align: right; }
        .gbTotal { font-weight: 900; font-size: 26px; }

        .gbList { margin-top: 12px; display: grid; gap: 8px; }
        .gbItem { display: flex; gap: 10px; align-items: baseline; }
        .gbDot { opacity: 0.7; }

        @media (max-width: 920px) {
          .gbSplit { grid-template-columns: 1fr; }
          .gbLinks { display: none; }
          .gbTileGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gbRow { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
