export default function Home() {
  const BUSINESS = {
    name: "GB Solutions",
    tagline: "House Cleaning • Seattle & Bellevue",
    serviceArea: "Seattle, Bellevue, and surrounding areas",
    phone: "YOUR_PHONE_HERE",
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="nav">
            <a className="brand" href="/" aria-label="GB Solutions home">
              <img className="logoImg" src="/logo.png" alt="GB Solutions logo" />
              <div className="brandText">
                <b>{BUSINESS.name}</b>
                <span>{BUSINESS.tagline}</span>
              </div>
            </a>

            <nav className="links" aria-label="Primary">
              <a href="#services">Services</a>
              <a href="#how">How it works</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
            </nav>

            <div className="navCtas">
              <a className="btn btnGhost" href="/book">Get a Quote</a>
              <a className="btn btnPrimary" href="/book">Book Now</a>
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

                <h1 className="h1">Instant pricing. Fully online booking.</h1>

                <p className="sub">
                  Choose your home size, frequency, and add-ons — see the total update instantly and book online.
                </p>

                <div className="heroActions">
                  <a className="btn btnPrimary" href="/book">Book Now</a>
                  <a className="btn" href="/book">Get Instant Price</a>
                </div>

                <div className="badges" aria-label="Trust badges">
                  <span className="badge">Upfront totals</span>
                  <span className="badge">Phone required</span>
                  <span className="badge">Email optional</span>
                  <span className="badge">Seattle • Bellevue</span>
                </div>
              </div>

              <div className="side">
                <div className="panel">
                  <h3>What you get</h3>
                  <div className="miniList">
                    <div className="miniItem"><span className="tick">✓</span><span>Clear scope: size, bathrooms, extras, frequency.</span></div>
                    <div className="miniItem"><span className="tick">✓</span><span>Live price updates as you select options.</span></div>
                    <div className="miniItem"><span className="tick">✓</span><span>Book online in minutes.</span></div>
                  </div>
                </div>

                <div className="panel">
                  <h3>Fast booking</h3>
                  <div className="miniList">
                    <div className="miniItem"><span className="tick">1</span><span>Select options</span></div>
                    <div className="miniItem"><span className="tick">2</span><span>See instant total</span></div>
                    <div className="miniItem"><span className="tick">3</span><span>Confirm booking</span></div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <a className="btn btnPrimary" href="/book">Start</a>
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
                <p>Standard, Deep Clean, and Move In/Out with optional add-ons.</p>
              </div>
              <a className="btn" href="/book">Book Now</a>
            </div>

            <div className="grid3">
              <div className="card">
                <h3>Standard Cleaning</h3>
                <p>Routine cleaning for kitchens, bathrooms, bedrooms, and common areas.</p>
              </div>
              <div className="card">
                <h3>Deep Cleaning</h3>
                <p>Detail-focused reset clean for buildup areas and first-time cleans.</p>
              </div>
              <div className="card">
                <h3>Move In / Move Out</h3>
                <p>Empty-home cleaning aligned to leasing timelines and turnovers.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="how">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>How it works</h2>
                <p>Select, price updates instantly, then book.</p>
              </div>
            </div>

            <div className="grid3">
              <div className="card">
                <h3>1) Choose options</h3>
                <p>Home size, bedrooms/bathrooms, frequency, and extras.</p>
              </div>
              <div className="card">
                <h3>2) See total</h3>
                <p>Total updates immediately when you select options.</p>
              </div>
              <div className="card">
                <h3>3) Book online</h3>
                <p>Enter details and confirm your booking.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>FAQ</h2>
                <p>Basic questions. Edit anytime.</p>
              </div>
            </div>

            <div className="split">
              <div className="faq">
                <details>
                  <summary>What areas do you serve?</summary>
                  <p>{BUSINESS.serviceArea}.</p>
                </details>
                <details>
                  <summary>Do you offer recurring service?</summary>
                  <p>Yes — you can choose frequency during booking.</p>
                </details>
              </div>

              <div className="faq">
                <details>
                  <summary>How do I get a price?</summary>
                  <p>Use the booking page — the total updates instantly as you select options.</p>
                </details>
                <details>
                  <summary>Is email required?</summary>
                  <p>No. Phone is required; email is optional.</p>
                </details>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="sectionHead">
              <div>
                <h2>Contact</h2>
                <p>For fastest service, book online.</p>
              </div>
              <a className="btn btnPrimary" href="/book">Book Now</a>
            </div>

            <div className="priceCard">
              <div className="miniItem"><span className="tick">☎</span><span>{BUSINESS.phone}</span></div>
              <div className="miniItem"><span className="tick">📍</span><span>{BUSINESS.serviceArea}</span></div>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>© {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.</div>
              <div style={{ display: "flex", gap: 14 }}>
                <a href="#services">Services</a>
                <a href="/book">Book</a>
                <a href="#contact">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
