import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CompaniesPage.css";

const trendingCompanies = [
  { id: "amazon", name: "Amazon", qs: 644, logo: "https://logo.clearbit.com/amazon.com" },
  { id: "microsoft", name: "Microsoft", qs: 439, logo: "https://logo.clearbit.com/microsoft.com" },
  { id: "google", name: "Google", qs: 174, logo: "https://logo.clearbit.com/google.com" },
  { id: "flipkart", name: "Flipkart", qs: 167, logo: "https://logo.clearbit.com/flipkart.com" },
  { id: "adobe", name: "Adobe", qs: 164, logo: "https://logo.clearbit.com/adobe.com" },
  { id: "npci", name: "NPCI", qs: 143, logo: "https://logo.clearbit.com/npci.org.in" },
  { id: "samsung", name: "Samsung", qs: 127, logo: "https://logo.clearbit.com/samsung.com" },
  { id: "paytm", name: "Paytm", qs: 74, logo: "https://logo.clearbit.com/paytm.com" },
  { id: "morganstanley", name: "Morgan Stanley", qs: 73, logo: "https://logo.clearbit.com/morganstanley.com" },
  { id: "meta", name: "Meta", qs: 62, logo: "https://logo.clearbit.com/meta.com" },
  { id: "apple", name: "Apple", qs: 58, logo: "https://logo.clearbit.com/apple.com" },
  { id: "netflix", name: "Netflix", qs: 45, logo: "https://logo.clearbit.com/netflix.com" }
];

const otherCompanies = [
  { id: "accolite", name: "Accolite", qs: 110, logo: "https://logo.clearbit.com/accolite.com" },
  { id: "makemytrip", name: "MakeMyTrip", qs: 96, logo: "https://logo.clearbit.com/makemytrip.com" },
  { id: "zoho", name: "Zoho", qs: 83, logo: "https://logo.clearbit.com/zoho.com" },
  { id: "snapdeal", name: "Snapdeal", qs: 76, logo: "https://logo.clearbit.com/snapdeal.com" },
  { id: "walmart", name: "Walmart", qs: 72, logo: "https://logo.clearbit.com/walmart.com" },
  { id: "goldmansachs", name: "Goldman Sachs", qs: 72, logo: "https://logo.clearbit.com/goldmansachs.com" }
];

function CompaniesPage({ goBack }) {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelect = (company) => {
    setSelectedCompany(company);
  };

  return (
    <div className="companies-page">
      {/* Header */}
      <div className="companies-header">
        <div className="logo-section">
          <div className="logo-mark">P</div>
          <div className="logo-text">
            Prep<span>Forge</span>
          </div>
        </div>

        <div className="status-badge">
          <span className="dot"></span> AI INTERVIEWER READY
        </div>

        <button className="back-btn" onClick={goBack}>
          ← Back
        </button>
      </div>

      <div className="companies-content">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="section-container">
          <div className="section-title">
            <span className="fire-icon">🔥</span> TRENDING
          </div>
          <div className="companies-grid">
            {trendingCompanies.map((c) => (
              <div
                key={c.id}
                className={`company-card ${selectedCompany?.id === c.id ? "selected" : ""}`}
                onClick={() => handleSelect(c)}
              >
                <img src={c.logo} alt={c.name} className="company-logo" />
                <div className="company-name">{c.name}</div>
                <div className="company-qs">{c.qs} Qs</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section-container">
          <div className="section-title">OTHER COMPANIES</div>
          <div className="companies-grid">
            {otherCompanies.map((c) => (
              <div
                key={c.id}
                className={`company-card ${selectedCompany?.id === c.id ? "selected" : ""}`}
                onClick={() => handleSelect(c)}
              >
                <img src={c.logo} alt={c.name} className="company-logo" />
                <div className="company-name">{c.name}</div>
                <div className="company-qs">{c.qs} Qs</div>
              </div>
            ))}
          </div>
        </div>

        {selectedCompany && (
          <div className="proceed-container">
            <button
              className="proceed-btn"
              onClick={() => navigate("/test")}
            >
              Proceed towards interview →
            </button>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="bottom-nav">
        <div className="nav-item">
          <span className="nav-icon">💻</span> DSA & Algorithms
        </div>
        <div className="nav-item">
          <span className="nav-icon">🧠</span> Behavioral
        </div>
        <div className="nav-item">
          <span className="nav-icon">👥</span> HR Rounds
        </div>
        <div className="nav-item">
          <span className="nav-icon">🏗️</span> System Design
        </div>
        <div className="nav-item active">
          <span className="nav-icon">🏢</span> Company-Specific
        </div>
      </div>
    </div>
  );
}

export default CompaniesPage;