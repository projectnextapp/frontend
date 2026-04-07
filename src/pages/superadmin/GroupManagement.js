import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdSearch,
  MdGroup,
  MdCheckCircle,
  MdCancel,
  MdArrowBack,
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import "./GroupManagement.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://backend-083k.onrender.com/api";

export default function GroupManagement() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchGroups = useCallback(async () => {
    try {
      const token = localStorage.getItem("superadmin_token");
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await axios.get(`${API_URL}/superadmin/groups`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load groups");
      if (err.response?.status === 401) {
        navigate("/superadmin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, search, statusFilter]);

  useEffect(() => {
    const token = localStorage.getItem("superadmin_token");
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    fetchGroups();
  }, [navigate, fetchGroups]);

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && group.isActive) ||
      (statusFilter === "inactive" && !group.isActive);
    return matchesSearch && matchesStatus;
  });

  const handleDeleteGroup = async (groupId, groupName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${groupName}"?\n\nThis will remove ALL members and data permanently.`,
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("superadmin_token");

      const res = await axios.delete(
        `${API_URL}/superadmin/groups/${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.success) {
        toast.success("Group deleted successfully");

        // Remove from UI instantly
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
      }
    } catch (err) {
      console.error("Delete group error:", err);
      toast.error(err.response?.data?.message || "Failed to delete group");
    }
  };

  return (
    <div className="group-management">
      <div className="page-header">
        <div>
          <Link to="/superadmin/dashboard" className="back-link">
            <MdArrowBack /> Back to Dashboard
          </Link>
          <h1>Group Management</h1>
          <p>Manage all associations on the platform</p>
        </div>
      </div>

      <div className="filters">
        <div className="search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search groups by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Groups</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading groups...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="empty-state">
          <MdGroup className="empty-icon" />
          <h3>No groups found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="groups-grid">
          {filteredGroups.map((group) => (
            <div key={group._id} className="group-card">
              <div className="group-card__header">
                <div className="group-card__logo">
                  {group.logo ? (
                    <img src={group.logo} alt={group.name} />
                  ) : (
                    <MdGroup />
                  )}
                </div>
                <div className="group-card__status">
                  {group.isActive ? (
                    <span className="status-badge status-badge--active">
                      <MdCheckCircle /> Active
                    </span>
                  ) : (
                    <span className="status-badge status-badge--inactive">
                      <MdCancel /> Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="group-card__body">
                <h3>{group.name}</h3>
                <p className="group-email">{group.email}</p>
                {group.phone && <p className="group-phone">{group.phone}</p>}

                <div className="group-stats">
                  <div className="stat">
                    <span className="stat-value">{group.memberCount || 0}</span>
                    <span className="stat-label">Members</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{group.adminCount || 0}</span>
                    <span className="stat-label">Admins</span>
                  </div>
                </div>

                <div className="group-meta">
                  <span>
                    Joined: {new Date(group.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="group-card__footer">
                <Link
                  to={`/superadmin/groups/${group._id}`}
                  className="btn-view-details"
                >
                  View Details
                </Link>

                <button
                  className="btn-delete"
                  onClick={() => handleDeleteGroup(group._id, group.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="results-summary">
        Showing {filteredGroups.length} of {groups.length} groups
      </div>
    </div>
  );
}
