export default function Home() {
  // Replace these placeholders with your real business info
  const BUSINESS = {
    name: "GB Solutions",
    tagline: "House Cleaning • Seattle & Bellevue",
    serviceArea: "Seattle, Bellevue, and nearby areas",
    email: "YOUR_EMAIL_HERE@example.com",
    phone: "YOUR_PHONE_HERE",
  };

  // Simple pricing placeholders (do not claim exact prices unless you actually use them)
  const pricing = [
    {
      title: "Standard Clean",
      price: "Quote-based",
      note: "Best for ongoing upkeep",
      bullets: [
        "Kitchen & bathrooms",
        "Floors & dusting",
        "Trash removal",
        "Bedrooms & common areas",
        "Add-ons available",
      ],
    },
    {
      title: "Deep Clean",
      price: "Quote-based",
      note: "Best for first-time or reset clean",
      bullets: [
        "Includes Standard Clean",
        "Detail focus on buildup areas",
        "Baseboards & fixtures (as scoped)",
        "High-touch surfaces",
        "Custom checklist per home",
      ],
    },
  ];

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="nav">
            <a className="brand" href="#top" aria-label="GB Solutions home">
              <div className="logo" />
              <div className="brandText">
                <b>{BUSINESS.name}</b>
                <span>{BUSINESS.tagline}</span>
              </div>
            </a>

            <nav className="links" aria-label="Primary">
              <a href="#services">Services</a>
              <a href="#pricing">Pricing</a>
              <a href="#process">Process</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
            </nav>

            <div className="navCtas">
              <a className="btn btnGhost" href="#contact">Get a Quote</a>
              <a className="btn btnPrimary" href="#contact">Book Request</a>
            </div>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="container">
            <div className="heroGrid">
              <div className="heroCard">
                <div className="kicker">
                  <span className="kickerDot" />
                  <span>Professional residential cleaning • {BUSINESS.serviceArea}</span>
                </div>

                <h1 className="h1">
                  A cleaner home, delivered with consistent standards.
                </h1>

                <p className="sub">
                  {BUSINESS.name} provides house cleaning for Seattle and Bellevue.
                  Request a quote, pick a preferred date/time, and receive confirmation.
                </p>

                <div className="heroActions">
                  <a className="btn btnPrimary" href="#contact">Request a Quote</a>
                  <a className="btn" href="#services">View Services</a>
                </div>

                <div className="badges" aria-label="Trust badges">
                  <span className="badge">Background-friendly processes</span>
                  <span className="badge">Checklist-driven cleans</span>
                  <span className="badge">Transparent communication</span>
                  <span className="badge">Seattle • Bellevue</span>
                </div>
              </div>

              <div className="side">
                <div className="panel">
                  <h3>What you get</h3>
                  <div className="miniList">
                    <div className="miniItem"><span className="tick">✓</span><span>Clear scope: rooms, bathrooms, add-ons.</span></div>
                    <div className="miniItem"><span className="tick">✓</span><span>Reliable arrival window and status updates.</span></div>
                    <div className="miniItem"><span className="tick">✓</span><span>Before/after notes when needed.</span></div>
                  </div>
                </div>

                <div className="panel">
                  <h3>Fast booking request</h3>
                  <div className="miniList">
                    <div className="miniItem"><span className="tick">1</span><span>Submit details</span></div>
                    <div className="miniItem"><span className="tick">2</span><span>Receive quote</span></div>
                    <div className="miniItem"><span className="tick">3</span><span>Confirm schedule</span></div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <a className="btn btnPrimary" href="#contact">Start</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>Services</h2>
                <p>Choose a clean type and add what you need. Final scope is confirmed during quoting.</p>
              </div>
              <a className="btn" href="#contact">Get a Quote</a>
            </div>

            <div className="grid3">
              <div className="card">
                <div className="icon" />
                <h3>Standard House Cleaning</h3>
                <p>Routine cleaning for kitchens, bathrooms, bedrooms, and common areas.</p>
              </div>
              <div className="card">
                <div className="icon" />
                <h3>Deep Cleaning</h3>
                <p>Detail-focused reset clean for buildup areas and first-time cleanings.</p>
              </div>
              <div className="card">
                <div className="icon" />
                <h3>Move In / Move Out</h3>
                <p>Empty-home cleaning aligned to leasing timelines and turnover needs.</p>
              </div>
              <div className="card">
                <div className="icon" />
                <h3>Kitchen Detail Add-ons</h3>
                <p>Inside oven/fridge, cabinet fronts, backsplash, and high-touch areas.</p>
              </div>
              <div className="card">
                <div className="icon" />
                <h3>Bathroom Detail Add-ons</h3>
                <p>Shower/tub focus, grout attention as scoped, fixtures and mirrors.</p>
              </div>
              <div className="card">
                <div className="icon" />
                <h3>Custom Requests</h3>
                <p>Tell us your priorities. We build a checklist and confirm before service.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>Pricing</h2>
                <p>Quote-based to match home size, condition, and add-ons. No fixed pricing is shown unless you set it.</p>
              </div>
            </div>

            <div className="pricing">
              {pricing.map((p) => (
                <div className="priceCard" key={p.title}>
                  <div className="priceTop">
                    <div>
                      <h3>{p.title}</h3>
                      <div className="small">{p.note}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="price">{p.price}</div>
                      <div className="small">Schedule after confirmation</div>
                    </div>
                  </div>

                  <ul className="ul">
                    {p.bullets.map((b) => (
                      <li key={b}><span className="dot" /> <span>{b}</span></li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 16 }}>
                    <a className="btn btnPrimary" href="#contact">Request Quote</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="process">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>Process</h2>
                <p>Simple flow. Clear scope. Confirmed schedule.</p>
              </div>
            </div>

            <div className="grid3">
              <div className="card">
                <div className="icon" />
                <h3>1) Request</h3>
                <p>Submit home details, preferred date/time, and any add-ons.</p>
              </div>
              <div className="card">
                <div className="icon" />
                <h3>2) Quote</h3>
                <p>We confirm scope and provide a quote based on your request.</p>
              </div>
              <div className="card">
                <div className="icon" />
                <h3>3) Confirm</h3>
                <p>You approve, we schedule, and you receive confirmation.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>FAQ</h2>
                <p>Common questions. If you want these answers to match your exact policies, replace the text.</p>
              </div>
            </div>

            <div className="split">
              <div className="faq">
                <details>
                  <summary>Do you bring supplies?</summary>
                  <p>Default: yes. If you prefer specific products, list them in the request.</p>
                </details>
                <details>
                  <summary>How long does a clean take?</summary>
                  <p>Depends on size, condition, and add-ons. Time is estimated during quoting.</p>
                </details>
                <details>
                  <summary>Do I need to be home?</summary>
                  <p>No. Access details can be arranged during confirmation.</p>
                </details>
              </div>

              <div className="faq">
                <details>
                  <summary>What areas do you serve?</summary>
                  <p>{BUSINESS.serviceArea}. If you are outside the core area, submit a request for review.</p>
                </details>
                <details>
                  <summary>Do you do same-day bookings?</summary>
                  <p>Availability varies. Submit a request and include “urgent” in notes.</p>
                </details>
                <details>
                  <summary>Do you offer recurring service?</summary>
                  <p>Yes. Weekly/biweekly/monthly can be set after the first clean.</p>
                </details>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>Request a quote / booking</h2>
                <p>
                  This form uses <b>mailto:</b> (no database). It opens your email app with the details.
                  To store requests automatically, you’d need a form service or backend.
                </p>
              </div>
            </div>

            <div className="split">
              <div className="priceCard">
                <h3>Contact</h3>
                <p className="small">
                  Replace placeholders in the code with your real info.
                </p>
                <div style={{ marginTop: 12 }}>
                  <div className="miniItem"><span className="tick">✉</span><span>{BUSINESS.email}</span></div>
                  <div className="miniItem"><span className="tick">☎</span><span>{BUSINESS.phone}</span></div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <a className="btn btnPrimary" href={`mailto:${BUSINESS.email}?subject=GB%20Solutions%20Quote%20Request`}>Email Request</a>
                </div>
              </div>

              <div className="priceCard">
                <h3>Request form</h3>

                <form
                  className="form"
                  method="GET"
                  action={`mailto:${BUSINESS.email}`}
                >
                  <div className="row">
                    <input name="name" placeholder="Full name" required />
                    <input name="phone" placeholder="Phone" />
                  </div>

                  <div className="row">
                    <input name="email" placeholder="Email" required />
                    <select name="service">
                      <option>Standard Clean</option>
                      <option>Deep Clean</option>
                      <option>Move In / Move Out</option>
                      <option>Custom</option>
                    </select>
                  </div>

                  <div className="row">
                    <input name="city" placeholder="City (Seattle, Bellevue, etc.)" />
                    <input name="address" placeholder="Address (optional until confirm)" />
                  </div>

                  <div className="row">
                    <input name="bedrooms" placeholder="Bedrooms (e.g., 2)" />
                    <input name="bathrooms" placeholder="Bathrooms (e.g., 2)" />
                  </div>

                  <div className="row">
                    <input name="preferred_date" placeholder="Preferred date (e.g., Jan 10)" />
                    <input name="preferred_time" placeholder="Preferred time (e.g., Morning)" />
                  </div>

                  <textarea name="notes" placeholder="Notes / add-ons / priorities"></textarea>

                  <button className="btn btnPrimary" type="submit">
                    Send Request (opens email)
                  </button>

                  <div className="small">
                    If nothing happens: your browser/email app may block mailto. In that case, use the Email Request button.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</div>
              <div style={{ display: "flex", gap: 14 }}>
                <a href="#services">Services</a>
                <a href="#pricing">Pricing</a>
                <a href="#contact">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Optional structured data. Replace placeholders before relying on it. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: BUSINESS.name,
            areaServed: BUSINESS.serviceArea,
            email: BUSINESS.email,
            telephone: BUSINESS.phone,
            url: "REPLACE_WITH_YOUR_SITE_URL",
            serviceType: ["House Cleaning", "Deep Cleaning", "Move Out Cleaning"],
          }),
        }}
      />
    </>
  );
}
