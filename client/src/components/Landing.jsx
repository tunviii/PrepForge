import React, { useState } from "react";
import '../styles/Landing.css';

function Landing({ user, logout, openPractice, openInterview, openAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-canvas"></div>
      <div className="grid-overlay"></div>

      {/* ── NAV LOGO ── */}
      <div className="nav-logo">
        <div className="logo-mark">P</div>
        <div className="logo-text">Prep<span>Forge</span></div>
      </div>

      {/* ── TOP RIGHT AUTH ── */}
      <div className="top-right">
        {!user ? (
          <button className="register-btn" onClick={openAuth}>
            Get Started →
          </button>
        ) : (
          <div className="profile-container">
            <div
              className="profile-circle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            {menuOpen && (
              <div className="dropdown">
                <div onClick={() => alert("Leaderboard coming soon")}>🏆 Leaderboard</div>
                <div onClick={() => alert("Progress dashboard coming soon")}>📊 Your Progress</div>
                <div onClick={logout}>🚪 Logout</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── LANDING SECTION ── */}
      <div id="landingSection">
        <div style={{ width: "100%", maxWidth: "860px", margin: "0 auto" }}>

          {/* HERO */}
          <div className="hero">
            <div className="badge">
              <div className="badge-dot"></div>
              AI-Powered Interview Prep
            </div>
            <div className="site-name">Prep<span className="accent">Forge</span></div>
            <div className="site-tagline">Forge Your Interview Edge</div>
            <p className="hero-desc">
              From DSA and system design to behavioral, HR, and company-specific rounds —
              PrepForge covers every question type with instant AI feedback so you walk in
              ready for anything.
            </p>
            <div className="feature-pills">
              <div className="pill">💻 DSA &amp; System Design</div>
              <div className="pill">🧠 Behavioral &amp; HR</div>
              <div className="pill">🏢 Company-Specific Prep</div>
              <div className="pill">⚡ Real-time AI Feedback</div>
            </div>
          </div>

          {/* MODE SELECTOR */}
          <div className="section-label">Choose Your Interview Mode</div>
          <div className="cards">

            {/* PRACTICE CARD */}
            <div className="card" onClick={openPractice}>
              <div className="card-glow"></div>
              <span className="mode-badge free">Free</span>
              <div className="card-icon-wrap">📘</div>
              <div className="card-title-text">Practice Mode</div>
              <p className="card-desc">Learn at your own pace with instant feedback after every answer.</p>
              <ul>
                <li>DSA, behavioral &amp; HR questions</li>
                <li>Get scored after every answer</li>
                <li>See improved sample answers</li>
                <li>No time pressure</li>
              </ul>
              <div className="card-cta">
                <span className="card-cta-text">Start Practicing</span>
                <div className="card-arrow">
                  <svg viewBox="0 0 14 14">
                    <line x1="2" y1="7" x2="12" y2="7" />
                    <polyline points="8,3 12,7 8,11" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TEST CARD */}
            <div className="card" onClick={openInterview}>
              <div className="card-glow"></div>
              <span className="mode-badge pro">Simulated</span>
              <div className="card-icon-wrap">📋</div>
              <div className="card-title-text">Test Mode</div>
              <p className="card-desc">Simulate a real 45–60 min company-specific interview under pressure.</p>
              <ul>
                <li>4–5 mixed-round questions</li>
                <li>No hints during interview</li>
                <li>Comprehensive final report</li>
                <li>Hire recommendation included</li>
              </ul>
              <div className="card-cta">
                <span className="card-cta-text">Take the Test</span>
                <div className="card-arrow">
                  <svg viewBox="0 0 14 14">
                    <line x1="2" y1="7" x2="12" y2="7" />
                    <polyline points="8,3 12,7 8,11" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* STATS */}
          <div className="stats-bar">
            <div className="stat">
              <div className="stat-num">1000+</div>
              <div className="stat-label">Interview Questions</div>
            </div>
            <div className="stat">
              <div className="stat-num">98%</div>
              <div className="stat-label">AI Accuracy</div>
            </div>
            <div className="stat">
              <div className="stat-num">10k+</div>
              <div className="stat-label">Mock Interviews</div>
            </div>
            <div className="stat">
              <div className="stat-num">4.9★</div>
              <div className="stat-label">User Rating</div>
            </div>
          </div>

        </div>
      </div>

      {/* ── COMPANY TICKER ── */}
      <div className="ticker-section">
        <div className="ticker-label">Prep for questions asked at top companies</div>
        <div className="ticker-track-wrapper">
          <div className="ticker-fade-left"></div>
          <div className="ticker-fade-right"></div>
          <div className="ticker-track">
            <div className="ticker-inner">
              {[...companies, ...companies].map((company, i) => (
                <div className="ticker-item" key={i}>
                  <div className="company-logo">
                    <img src={company.logo} alt={company.name} width={32} height={32} style={{ borderRadius: 6 }} />
                  </div>
                  <span className="company-name">{company.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const companies = [
  { name: "Amazon",        logo: "https://logo.clearbit.com/amazon.com" },
  { name: "Google",        logo: "https://logo.clearbit.com/google.com" },
  { name: "Meta",          logo: "https://logo.clearbit.com/meta.com" },
  { name: "Microsoft",     logo: "https://logo.clearbit.com/microsoft.com" },
  { name: "Apple",         logo: "https://logo.clearbit.com/apple.com" },
  { name: "Netflix",       logo: "https://logo.clearbit.com/netflix.com" },
  { name: "Flipkart",      logo: "https://logo.clearbit.com/flipkart.com" },
  { name: "Uber",          logo: "https://logo.clearbit.com/uber.com" },
  { name: "Salesforce",    logo: "https://logo.clearbit.com/salesforce.com" },
  { name: "Adobe",         logo: "https://logo.clearbit.com/adobe.com" },
  { name: "Goldman Sachs", logo: "https://logo.clearbit.com/goldmansachs.com" },
  { name: "Infosys",       logo: "https://logo.clearbit.com/infosys.com" },
  { name: "TCS",           logo: "https://logo.clearbit.com/tcs.com" },
  { name: "Wipro",         logo: "https://logo.clearbit.com/wipro.com" },
];

export default Landing;