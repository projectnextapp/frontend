import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdGroup,
  MdPeople,
  MdTrendingUp,
  MdLogout,
  MdSettings,
  MdCampaign,
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import "./SuperAdminDashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.get(`${API_URL}/api/superadmin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load statistics");
      if (err.response?.status === 401) {
        navigate("/superadmin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("superadmin_token");
    const userData = localStorage.getItem("superadmin_user");

    if (!token) {
      navigate("/superadmin/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchStats();
  }, [navigate, fetchStats]);

  const handleLogout = () => {
    localStorage.removeItem("superadmin_token");
    localStorage.removeItem("superadmin_user");
    toast.success("Logged out successfully");
    navigate("/superadmin/login");
  };

  if (loading) {
    return (
      <div className="superadmin-dashboard loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>🔐 Super Admin Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="Settings">
              <MdSettings />
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              <MdLogout /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__icon">
            <MdGroup />
          </div>
          <div className="stat-card__content">
            <h3>Total Groups</h3>
            <p className="stat-number">{stats?.groups?.total || 0}</p>
            <div className="stat-meta">
              <span className="stat-badge stat-badge--success">
                Active: {stats?.groups?.active || 0}
              </span>
              <span className="stat-badge stat-badge--danger">
                Inactive: {stats?.groups?.inactive || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card__icon">
            <MdPeople />
          </div>
          <div className="stat-card__content">
            <h3>Total Members</h3>
            <p className="stat-number">
              {stats?.members?.total?.toLocaleString() || 0}
            </p>
            <div className="stat-meta">
              <span className="stat-badge stat-badge--info">
                Active: {stats?.members?.active?.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card--purple">
          <div className="stat-card__icon">
            <MdPeople />
          </div>
          <div className="stat-card__content">
            <h3>Executives</h3>
            <p className="stat-number">{stats?.members?.executives || 0}</p>
            <div className="stat-meta">
              <span className="stat-badge">
                President, Treasurer, Secretary
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-card--orange">
          <div className="stat-card__icon">
            <MdTrendingUp />
          </div>
          <div className="stat-card__content">
            <h3>Recent Signups</h3>
            <p className="stat-number">{stats?.groups?.recent || 0}</p>
            <div className="stat-meta">
              <span className="stat-badge">Last 7 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/superadmin/groups" className="action-card">
            <MdGroup className="action-icon" />
            <h3>Manage Groups</h3>
            <p>View and manage all associations</p>
          </Link>

          <Link to="/superadmin/groups" className="action-card">
            <MdPeople className="action-icon" />
            <h3>View Executives</h3>
            <p>See all platform executives</p>
          </Link>

          <Link to="/superadmin/adverts" className="action-card">
            <MdCampaign className="action-icon" />
            <h3>Manage Adverts</h3>
            <p>Create and manage advertisements</p>
          </Link>
        </div>
      </div>

      {/* Platform Health */}
      <div className="platform-health">
        <h2>Platform Health</h2>
        <div className="health-metrics">
          <div className="health-metric">
            <div className="health-metric__label">Active Groups</div>
            <div className="health-bar">
              <div
                className="health-bar__fill health-bar__fill--success"
                style={{
                  width: `${(stats?.groups?.active / stats?.groups?.total) * 100 || 0}%`,
                }}
              ></div>
            </div>
            <div className="health-metric__value">
              {Math.round(
                (stats?.groups?.active / stats?.groups?.total) * 100,
              ) || 0}
              %
            </div>
          </div>

          <div className="health-metric">
            <div className="health-metric__label">Active Members</div>
            <div className="health-bar">
              <div
                className="health-bar__fill health-bar__fill--info"
                style={{
                  width: `${(stats?.members?.active / stats?.members?.total) * 100 || 0}%`,
                }}
              ></div>
            </div>
            <div className="health-metric__value">
              {Math.round(
                (stats?.members?.active / stats?.members?.total) * 100,
              ) || 0}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
