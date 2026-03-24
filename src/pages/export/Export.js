import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  MdDownload,
  MdTableChart,
  MdReceipt,
  MdAccountBalance,
} from "react-icons/md";
import toast from "react-hot-toast";
import "./Export.css";

export default function Export() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState({});

  const handleExport = async (type, format = "excel") => {
    const key = `${type}-${format}`;
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const token = localStorage.getItem("agms_token");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/exports/${type}/${format}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = format === "excel" ? "xlsx" : "csv";
      a.download = `${type}-export-${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} exported as ${format.toUpperCase()}!`,
      );
    } catch (err) {
      toast.error("Export failed: " + err.message);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (!isAdmin) {
    return (
      <div className="export-page">
        <div className="empty-state">
          <span className="empty-emoji">🔒</span>
          <h3>Access Denied</h3>
          <p>Only administrators can export records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="export-page">
      <div className="page-header">
        <h1>📥 Export Records</h1>
        <p>Download your data in professional Excel or CSV format</p>
      </div>

      <div className="export-cards">
        {/* Members Export */}
        <div className="export-card">
          <div className="export-card__icon" style={{ background: "#dbeafe" }}>
            <MdTableChart style={{ color: "#1d4ed8" }} />
          </div>
          <div className="export-card__content">
            <h3>Members Records</h3>
            <p>
              Professional directory with auto-formatted columns and zebra
              striping
            </p>
            <ul className="export-includes">
              <li>✓ Frozen headers & auto-fit columns</li>
              <li>✓ Date formatting & summary row</li>
              <li>✓ Professional styling & borders</li>
            </ul>
          </div>
          <div className="export-btn-group">
            <button
              className="export-btn export-btn-primary"
              onClick={() => handleExport("members", "excel")}
              disabled={loading["members-excel"]}
            >
              {loading["members-excel"] ? (
                <>
                  <span className="spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <MdDownload />
                  Excel
                </>
              )}
            </button>
            <button
              className="export-btn export-btn-secondary"
              onClick={() => handleExport("members", "csv")}
              disabled={loading["members-csv"]}
            >
              {loading["members-csv"] ? (
                <>
                  <span className="spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <MdDownload />
                  CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expenditures Export */}
        <div className="export-card">
          <div className="export-card__icon" style={{ background: "#fee2e2" }}>
            <MdReceipt style={{ color: "#dc2626" }} />
          </div>
          <div className="export-card__content">
            <h3>Expenditures</h3>
            <p>Financial report with currency formatting and bold totals</p>
            <ul className="export-includes">
              <li>✓ Currency formatting (₦50,000.00)</li>
              <li>✓ Highlighted totals row</li>
              <li>✓ Category breakdown & dates</li>
            </ul>
          </div>
          <div className="export-btn-group">
            <button
              className="export-btn export-btn-primary"
              onClick={() => handleExport("expenditures", "excel")}
              disabled={loading["expenditures-excel"]}
            >
              {loading["expenditures-excel"] ? (
                <>
                  <span className="spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <MdDownload />
                  Excel
                </>
              )}
            </button>
            <button
              className="export-btn export-btn-secondary"
              onClick={() => handleExport("expenditures", "csv")}
              disabled={loading["expenditures-csv"]}
            >
              {loading["expenditures-csv"] ? (
                <>
                  <span className="spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <MdDownload />
                  CSV
                </>
              )}
            </button>
          </div>
        </div>

        {/* Transactions Export */}
        <div className="export-card">
          <div className="export-card__icon" style={{ background: "#dcfce7" }}>
            <MdAccountBalance style={{ color: "#15803d" }} />
          </div>
          <div className="export-card__content">
            <h3>Transactions</h3>
            <p>Complete payment history with professional formatting</p>
            <ul className="export-includes">
              <li>✓ Auto-calculated totals</li>
              <li>✓ Zebra striping for readability</li>
              <li>✓ Status tracking & references</li>
            </ul>
          </div>
          <div className="export-btn-group">
            <button
              className="export-btn export-btn-primary"
              onClick={() => handleExport("transactions", "excel")}
              disabled={loading["transactions-excel"]}
            >
              {loading["transactions-excel"] ? (
                <>
                  <span className="spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <MdDownload />
                  Excel
                </>
              )}
            </button>
            <button
              className="export-btn export-btn-secondary"
              onClick={() => handleExport("transactions", "csv")}
              disabled={loading["transactions-csv"]}
            >
              {loading["transactions-csv"] ? (
                <>
                  <span className="spinner"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <MdDownload />
                  CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="export-info">
        <h3>💎 Professional Features</h3>
        <p>
          <strong>Excel Format:</strong> Frozen headers, auto-fit columns,
          currency formatting (₦), zebra row striping, bold totals, professional
          colors
        </p>
        <p>
          <strong>CSV Format:</strong> Universal format for importing into other
          systems, spreadsheets, or databases
        </p>
        <p>
          <strong>Production Ready:</strong> Looks like reports from Fortune 500
          companies - perfect for presentations and audits
        </p>
        <p>
          <strong>Privacy:</strong> Handle exported files securely as they
          contain sensitive information
        </p>
      </div>
    </div>
  );
}
