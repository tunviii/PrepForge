import React, { useState } from "react";
import styles from '../styles/Landing.module.css';
import { useNavigate } from "react-router-dom";
function Landing({ user, logout, openPractice, openInterview, openAuth }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.bgCanvas}></div>
      <div className={styles.gridOverlay}></div>

      {/* ── NAVBAR ── */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>
          <div className={styles.logoMark}>P</div>
          <div className={styles.logoText}>Prep<span className={styles.accent}>Forge</span></div>
        </div>

        <div className={styles.navRight}>
          {!user ? (
            <button className={styles.registerBtn} onClick={openAuth}>
              Get Started →
            </button>
          ) : (
            <div className={styles.profileContainer}>
              <div
                className={styles.profileCircle}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {(user?.name || user?.email || "U")[0].toUpperCase()}
              </div>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownItem} onClick={() => alert("Leaderboard coming soon")}>🏆 Leaderboard</div>
                  <div className={styles.dropdownItem} onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}>
  📊 Your Progress
</div>
                  <div className={styles.dropdownItem} onClick={logout}>🚪 Logout</div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── LANDING SECTION ── */}
      <div id="landingSection" className={styles.landingSection}>
        <div className={styles.container}>

          {/* HERO */}
          <div className={styles.hero}>
            <div className={styles.badge}>
              <div className={styles.badgeDot}></div>
              AI-Powered Interview Prep
            </div>
            <div className={styles.siteName}>Prep<span className={styles.accent}>Forge</span></div>
            <div className={styles.siteTagline}>Forge Your Interview Edge</div>
            <p className={styles.heroDesc}>
              From DSA and system design to behavioral, HR, and company-specific rounds —
              PrepForge covers every question type with instant AI feedback so you walk in
              ready for anything.
            </p>
            <div className={styles.featurePills}>
              <div className={styles.pill}>💻 DSA &amp; System Design</div>
              <div className={styles.pill}>🧠 Behavioral &amp; HR</div>
              <div className={styles.pill}>🏢 Company-Specific Prep</div>
              <div className={styles.pill}>⚡ Real-time AI Feedback</div>
            </div>
          </div>

          {/* MODE SELECTOR */}
          <div className={styles.sectionTitle}>Choose Your Interview Mode</div>
          <div className={styles.cards}>

            {/* PRACTICE CARD */}
            <div className={`${styles.card} ${styles.clickable}`} onClick={openPractice}>
              <div className={styles.cardGlow}></div>
              <span className={`${styles.modeBadge} ${styles.free}`}>Free</span>
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrap}>📘</div>
                <div className={styles.cardTitleText}>Practice Mode</div>
              </div>
              <p className={styles.cardDesc}>Learn at your own pace with instant feedback after every answer.</p>
              <ul className={styles.cardList}>
                <li>DSA, behavioral &amp; HR questions</li>
                <li>Get scored after every answer</li>
                <li>See improved sample answers</li>
                <li>No time pressure</li>
              </ul>
              <div className={styles.cardCta}>
                <span className={styles.cardCtaText}>Start Practicing</span>
                <div className={styles.cardArrow}>
                  <svg viewBox="0 0 14 14">
                    <line x1="2" y1="7" x2="12" y2="7" />
                    <polyline points="8,3 12,7 8,11" />
                  </svg>
                </div>
              </div>
            </div>

            {/* TEST CARD */}
            <div className={`${styles.card} ${styles.clickable}`} onClick={openInterview}>
              <div className={styles.cardGlow}></div>
              <span className={`${styles.modeBadge} ${styles.pro}`}>Simulated</span>
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrap}>📋</div>
                <div className={styles.cardTitleText}>Test Mode</div>
              </div>
              <p className={styles.cardDesc}>Simulate a real 45–60 min company-specific interview under pressure.</p>
              <ul className={styles.cardList}>
                <li>4–5 mixed-round questions</li>
                <li>No hints during interview</li>
                <li>Comprehensive final report</li>
                <li>Hire recommendation included</li>
              </ul>
              <div className={styles.cardCta}>
                <span className={styles.cardCtaText}>Take the Test</span>
                <div className={styles.cardArrow}>
                  <svg viewBox="0 0 14 14">
                    <line x1="2" y1="7" x2="12" y2="7" />
                    <polyline points="8,3 12,7 8,11" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* STATS */}
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <div className={styles.statNum}>1000+</div>
              <div className={styles.statLabel}>Interview Questions</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>98%</div>
              <div className={styles.statLabel}>AI Accuracy</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>10k+</div>
              <div className={styles.statLabel}>Mock Interviews</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNum}>4.9★</div>
              <div className={styles.statLabel}>User Rating</div>
            </div>
          </div>

        </div>
      </div>

      {/* ── COMPANY TICKER ── */}
      <div className={styles.tickerSection}>
        <div className={styles.tickerLabel}>Prep for questions asked at top companies</div>
        <div className={styles.tickerTrackWrapper}>
          <div className={styles.tickerFadeLeft}></div>
          <div className={styles.tickerFadeRight}></div>
          <div className={styles.tickerTrack}>
            <div className={styles.tickerInner}>
              {[...companies, ...companies].map((company, i) => (
                <div className={styles.tickerItem} key={i}>
                  <div className={styles.companyLogo}>
                    <img src={company.logo} alt={company.name} width={32} height={32} style={{ borderRadius: 6 }} />
                  </div>
                  <span className={styles.companyName}>{company.name}</span>
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