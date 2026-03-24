import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import {
  MdDashboard,
  MdPeople,
  MdHowToVote,
  MdAccountBalance,
  MdCampaign,
  MdNotifications,
  MdPerson,
  MdLogout,
  MdMenu,
  MdClose,
  MdChevronRight,
  MdDownload,
} from "react-icons/md";
import "./AppLayout.css";

const NAV_ITEMS = [
  { to: "/dashboard", icon: <MdDashboard />, label: "Dashboard" },
  { to: "/members", icon: <MdPeople />, label: "Members" },
  { to: "/elections", icon: <MdHowToVote />, label: "Elections & Votes" },
  { to: "/finance", icon: <MdAccountBalance />, label: "Finance" },
  { to: "/expenditures", icon: <MdAccountBalance />, label: "Expenditures" },
  { to: "/notices", icon: <MdCampaign />, label: "Notices & Minutes" },
  { to: "/notifications", icon: <MdNotifications />, label: "Notifications" },
  { to: "/export", icon: <MdDownload />, label: "Export Records" },
  { to: "/profile", icon: <MdPerson />, label: "My Profile" },
];

export default function AppLayout() {
  const { user, userType, logout } = useAuth();
  const { connect, disconnect, connected, onlineUsers } = useSocket();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Connect socket when layout mounts
  useEffect(() => {
    const token = localStorage.getItem("agms_token");
    if (token) {
      connect(token);
    }
    return () => disconnect();
  }, [connect, disconnect]);

  const handleLogout = () => {
    disconnect();
    logout();
    navigate("/login");
  };

  const displayName = userType === "group" ? user?.name : user?.name;
  const displayRole =
    userType === "group" ? "Group Admin" : user?.role || "Member";

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {open && (
        <div className="sidebar-overlay" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            {user?.logo || user?.profilePhoto ? (
              <img src={user.logo || user.profilePhoto} alt="logo" />
            ) : (
              <span>{displayName?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="sidebar__brand-text">
            <span className="sidebar__org-name">{displayName}</span>
            <span className="sidebar__role">{displayRole}</span>
          </div>
          <button className="sidebar__close" onClick={() => setOpen(false)}>
            <MdClose />
          </button>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
              }
              onClick={() => setOpen(false)}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span className="sidebar__link-label">{item.label}</span>
              <MdChevronRight className="sidebar__link-arrow" />
            </NavLink>
          ))}
        </nav>

        <button className="sidebar__logout" onClick={handleLogout}>
          <MdLogout /> Logout
        </button>
      </aside>

      {/* Main area */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <button className="topbar__hamburger" onClick={() => setOpen(true)}>
            <MdMenu />
          </button>
          <div className="topbar__breadcrumb">
            {connected && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  color: "#10b981",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#10b981",
                    animation: "pulse 2s infinite",
                  }}
                />
                <span>Live ({onlineUsers.length} online)</span>
              </div>
            )}
          </div>
          <div className="topbar__actions">
            <NavLink to="/notifications" className="topbar__notif-btn">
              <MdNotifications />
            </NavLink>
            <NavLink to="/profile" className="topbar__avatar">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="avatar" />
              ) : (
                <span>{user?.name?.[0]?.toUpperCase()}</span>
              )}
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
