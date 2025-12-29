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

// Your rule: base prices are for BI-WEEKLY.
// “more frequent” => down 15%
// “less frequent” => up 15%
const FREQUENCY = [
  { label: "Weekly (−15%)", value: "weekly", multiplier: 0.85 },
  { label: "Bi-Weekly (base)", value: "biweekly", multiplier: 1.0 },
  { label: "Every 4 Weeks (+15%)", value: "every4weeks", multiplier: 1.15 },
  { label: "One-Time (+15%)", value: "onetime", multiplier: 1.15 },
];

// Extras pricing per your notes
const EXTRA_DEEP_OR_MOVE = 40;
const EXTRA_STANDARD = 25; // use 20 if you prefer; adjust as needed

const EXTRAS = [
  { key: "deep_clean", label: "Deep Cleaning", add: EXTRA_DEEP_OR_MOVE },
  { key: "move_in_out", label: "Move In / Out", add: EXTRA_DEEP_OR_MOVE },
  { key: "inside_cabinets", label: "Inside Cabinets", add: EXTRA_STANDARD },
  { key: "interior_windows", label: "Interior Windows", add: EXTRA_STANDARD },
  { key: "inside_fridge", label: "Inside Fridge", add: EXTRA_STANDARD },
  { key: "inside_oven", label: "Inside Oven", add: EXTRA_STANDARD },
  { key: "green_cleaning", label: "Green Cleaning", add: EXTRA_STANDARD },
  { key: "organization", label: "Organization", add: EXTRA_STANDARD },
  { key: "laundry_folding", label: "Laundry & Folding", add: EXTRA_STANDARD },
  { key: "dishes", label: "Dishes", add: EXTRA_STANDARD },
];

function money(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function BookPage() {
  // customer details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // EMAIL OPTIONAL
  const [email, setEmail] = useState("");

  // PHONE REQUIRED
  const [phone, setPhone] = useState("");

  const [sqft, setSqft] = useState(SQFT_PRICES_BIWEEKLY[0].value);
  const [frequency, setFrequency] = useState("biweekly");

  const [extras, setExtras] = useState(() =>
    Object.fromEntries(EXTRAS.map((e) => [e.key, false]))
  );

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const selectedSqft = useMemo(
    () => SQFT_PRICES_BIWEEKLY.find((x) => x.value === sqft),
    [sqft]
  );

  const selectedFreq = useMemo(
    () => FREQUENCY.find((f) => f.value === frequency),
    [frequency]
  );

  const extrasTotal = useMemo(() => {
    return EXTRAS.reduce((sum, e) => (extras[e.key] ? sum + e.add : sum), 0);
  }, [extras]);

  const total = useMemo(() => {
    const base = selectedSqft?.price ?? 0;
    const mult = selectedFreq?.multiplier ?? 1;
    return (base + extrasTotal) * mult;
  }, [selectedSqft, selectedFreq, extrasTotal]);

  function validate() {
    const nextErrors = {};

    // Phone REQUIRED
    const digitsOnly = phone.replace(/\D/g, "");
    if (!digitsOnly) nextErrors.phone = "Phone number is required.";
    else if (digitsOnly.length < 10) nextErrors.phone = "Enter a valid phone number.";

    // Email OPTIONAL, but if present it must be valid-looking
    if (email.trim().length > 0) {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
      if (!ok) nextErrors.email = "Enter a valid email or leave blank.";
    }

    // Optional: require names (remove if you don’t want)
    if (!firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!lastName.trim()) nextErrors.lastName = "Last name is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function toggleExtra(key) {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitted(false);

    if (!validate()) return;

    // If you want to send this somewhere, create an API route and POST to it.
    // For now, this is a front-end validation + “success” state.
    setSubmitted(true);
  }

  return (
    <div className="bk-wrap">
      <div className="bk-grid">
        <main className="bk-main">
          <h1 className="bk-title">Book Online</h1>

          <form onSubmit={onSubmit} className="bk-card">
            <section className="bk-section">
              <h2 className="bk-h2">Frequency</h2>
              <div className="bk-row">
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="bk-select"
                >
                  {FREQUENCY.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="bk-section">
              <h2 className="bk-h2">Home Size</h2>
              <div className="bk-row">
                <select
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  className="bk-select"
                >
                  {SQFT_PRICES_BIWEEKLY.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} ({money(s.price)} bi-weekly)
                    </option>
                  ))}
                </select>
              </div>
            </section>

            <section className="bk-section">
              <h2 className="bk-h2">Extras</h2>
              <div className="bk-extras">
                {EXTRAS.map((e) => (
                  <label key={e.key} className="bk-extra">
                    <input
                      type="checkbox"
                      checked={!!extras[e.key]}
                      onChange={() => toggleExtra(e.key)}
                    />
                    <span>{e.label}</span>
                    <span className="bk-extra-price">+{money(e.add)}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="bk-section">
              <h2 className="bk-h2">Customer Details</h2>

              <div className="bk-two">
                <div>
                  <label className="bk-label">First name</label>
                  <input
                    className="bk-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                  {errors.firstName && <div className="bk-err">{errors.firstName}</div>}
                </div>

                <div>
                  <label className="bk-label">Last name</label>
                  <input
                    className="bk-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                  {errors.lastName && <div className="bk-err">{errors.lastName}</div>}
                </div>
              </div>

              <div className="bk-two">
                <div>
                  <label className="bk-label">Email (optional)</label>
                  <input
                    className="bk-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                  />
                  {errors.email && <div className="bk-err">{errors.email}</div>}
                </div>

                <div>
                  <label className="bk-label">Phone (required)</label>
                  <input
                    className="bk-input"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 555-5555"
                    // HTML-level required as well (still keep JS validate)
                    required
                  />
                  {errors.phone && <div className="bk-err">{errors.phone}</div>}
                </div>
              </div>
            </section>

            <button type="submit" className="bk-btn">
              Save Booking
            </button>

            {submitted && (
              <div className="bk-ok">
                Validated. Next step: send this booking to your backend/payment processor.
              </div>
            )}
          </form>
        </main>

        <aside className="bk-side">
          <div className="bk-card">
            <h3 className="bk-h3">Booking Summary</h3>
            <div className="bk-sum">
              <div className="bk-sum-row">
                <span>Frequency</span>
                <span>{FREQUENCY.find((f) => f.value === frequency)?.label}</span>
              </div>
              <div className="bk-sum-row">
                <span>Sq Ft</span>
                <span>{SQFT_PRICES_BIWEEKLY.find((s) => s.value === sqft)?.label}</span>
              </div>
              <div className="bk-sum-row">
                <span>Extras</span>
                <span>{money(extrasTotal)}</span>
              </div>
              <div className="bk-line" />
              <div className="bk-sum-total">
                <span>Total</span>
                <span>{money(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .bk-wrap { max-width: 1100px; margin: 40px auto; padding: 0 16px; }
        .bk-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
        @media (max-width: 980px) { .bk-grid { grid-template-columns: 1fr; } }

        .bk-title { margin: 0 0 16px; font-size: 32px; }
        .bk-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 16px; }
        .bk-section { padding: 12px 0; border-top: 1px solid #f1f5f9; }
        .bk-section:first-child { border-top: 0; }
        .bk-h2 { margin: 0 0 10px; font-size: 16px; }
        .bk-h3 { margin: 0 0 10px; font-size: 16px; }
        .bk-row { display: flex; gap: 12px; }
        .bk-select, .bk-input { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #d1d5db; }
        .bk-label { display: block; font-size: 12px; margin: 8px 0 6px; color: #475569; }
        .bk-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 640px) { .bk-two { grid-template-columns: 1fr; } }

        .bk-extras { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media (max-width: 640px) { .bk-extras { grid-template-columns: 1fr; } }
        .bk-extra { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 12px; }
        .bk-extra input { margin-right: 10px; }
        .bk-extra span:first-of-type { flex: 1; }
        .bk-extra-price { color: #0f766e; font-weight: 600; }

        .bk-btn { width: 100%; margin-top: 12px; padding: 12px; border-radius: 12px; border: 0; background: #0ea5e9; color: white; font-weight: 700; cursor: pointer; }
        .bk-err { margin-top: 6px; color: #b91c1c; font-size: 12px; }
        .bk-ok { margin-top: 10px; font-size: 13px; color: #065f46; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px 12px; border-radius: 12px; }

        .bk-sum { font-size: 14px; }
        .bk-sum-row { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; color: #334155; }
        .bk-line { height: 1px; background: #e5e7eb; margin: 10px 0; }
        .bk-sum-total { display: flex; justify-content: space-between; font-size: 18px; font-weight: 800; }
      `}</style>
    </div>
  );
}
