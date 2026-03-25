import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MdArrowBack,
  MdGroup,
  MdPerson,
  MdToggleOn,
  MdToggleOff,
  MdNotifications,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import "./GroupDetail.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://backend-083k.onrender.com/api";

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: "",
    message: "",
    target: "all",
  });

  const fetchGroupDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.get(`${API_URL}/superadmin/groups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load group details");
      if (err.response?.status === 401) {
        navigate("/superadmin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("superadmin_token");
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    fetchGroupDetails();
  }, [navigate, fetchGroupDetails]);

  const handleToggleAdmin = async () => {
    const action = data.group.isActive ? "deactivate" : "activate";

    if (
      !window.confirm(`Are you sure you want to ${action} this group admin?`)
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.patch(
        `${API_URL}/api/superadmin/groups/${id}/admin/toggle`,
        { activate: !data.group.isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        toast.success(`Group admin ${action}d successfully`);
        fetchGroupDetails();
      }
    } catch (err) {
      toast.error(`Failed to ${action} admin`);
    }
  };

  const handleToggleExecutive = async (memberId, isActive) => {
    const action = isActive ? "deactivate" : "activate";

    if (!window.confirm(`Are you sure you want to ${action} this executive?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.patch(
        `${API_URL}/api/superadmin/groups/${id}/executives/${memberId}/toggle`,
        { activate: !isActive },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        toast.success(`Executive ${action}d successfully`);
        fetchGroupDetails();
      }
    } catch (err) {
      toast.error(`Failed to ${action} executive`);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!notificationData.title || !notificationData.message) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.post(
        `${API_URL}/api/superadmin/groups/${id}/notify`,
        {
          title: notificationData.title,
          message: notificationData.message,
          targetAudience: notificationData.target,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (res.data.success) {
        toast.success("Notification sent successfully!");
        setShowNotificationModal(false);
        setNotificationData({ title: "", message: "", target: "all" });
      }
    } catch (err) {
      toast.error("Failed to send notification");
    }
  };

  if (loading) {
    return (
      <div className="group-detail loading">
        <div className="spinner-large"></div>
        <p>Loading group details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="group-detail">
        <div className="error-state">
          <h2>Group not found</h2>
          <Link to="/superadmin/groups">Back to Groups</Link>
        </div>
      </div>
    );
  }

  const executives = data.executives || [];
  const roleOrder = { president: 1, treasurer: 2, secretary: 3, admin: 4 };
  const sortedExecutives = [...executives].sort(
    (a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99),
  );

  return (
    <div className="group-detail">
      <div className="detail-header">
        <Link to="/superadmin/groups" className="back-link">
          <MdArrowBack /> Back to Groups
        </Link>
        <h1>{data.group.name}</h1>
      </div>

      <div className="detail-grid">
        {/* Group Info Card */}
        <div className="detail-card">
          <div className="card-header">
            <MdGroup /> Group Information
          </div>
          <div className="card-body">
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{data.group.email}</span>
            </div>
            {data.group.phone && (
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{data.group.phone}</span>
              </div>
            )}
            {data.group.address && (
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">{data.group.address}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Joined:</span>
              <span className="info-value">
                {new Date(data.group.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="detail-card">
          <div className="card-header">
            <MdPerson /> Member Statistics
          </div>
          <div className="card-body">
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-number">{data.stats.totalMembers}</div>
                <div className="stat-label">Total Members</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{data.stats.activeMembers}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{data.stats.executiveCount}</div>
                <div className="stat-label">Executives</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Status */}
      <div className="detail-card">
        <div className="card-header">🔐 Group Admin Status</div>
        <div className="card-body">
          <div className="admin-status-section">
            <div className="status-info">
              <div className="status-badge-large">
                {data.group.isActive ? (
                  <>
                    <MdCheckCircle className="status-icon status-icon--active" />
                    <span>Admin is Active</span>
                  </>
                ) : (
                  <>
                    <MdCancel className="status-icon status-icon--inactive" />
                    <span>Admin is Inactive</span>
                  </>
                )}
              </div>
              <p className="status-description">
                {data.group.isActive
                  ? "The group admin can login and manage their association."
                  : "The group admin cannot login or perform any operations."}
              </p>
            </div>
            <button
              className={`btn-toggle ${!data.group.isActive ? "btn-toggle--activate" : ""}`}
              onClick={handleToggleAdmin}
            >
              {data.group.isActive ? <MdToggleOff /> : <MdToggleOn />}
              {data.group.isActive ? "Deactivate Admin" : "Activate Admin"}
            </button>
          </div>
        </div>
      </div>

      {/* Executives */}
      <div className="detail-card">
        <div className="card-header">
          👔 Executives ({sortedExecutives.length})
        </div>
        <div className="card-body">
          {sortedExecutives.length === 0 ? (
            <div className="empty-executives">
              <p>No executives found for this group</p>
            </div>
          ) : (
            <div className="executives-list">
              {sortedExecutives.map((exec) => (
                <div key={exec._id} className="executive-item">
                  <div className="executive-info">
                    <div className="executive-avatar">
                      {exec.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="executive-name">{exec.name}</div>
                      <div className="executive-role">
                        {exec.role.charAt(0).toUpperCase() + exec.role.slice(1)}
                      </div>
                      <div className="executive-email">{exec.email}</div>
                    </div>
                  </div>
                  <div className="executive-actions">
                    <div className="executive-status">
                      {exec.isActive ? (
                        <span className="badge-active">Active</span>
                      ) : (
                        <span className="badge-inactive">Inactive</span>
                      )}
                    </div>
                    <button
                      className={`btn-toggle-small ${!exec.isActive ? "btn-toggle--activate" : ""}`}
                      onClick={() =>
                        handleToggleExecutive(exec._id, exec.isActive)
                      }
                    >
                      {exec.isActive ? <MdToggleOff /> : <MdToggleOn />}
                      {exec.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Button */}
      <div className="action-bar">
        <button
          className="btn-send-notification"
          onClick={() => setShowNotificationModal(true)}
        >
          <MdNotifications /> Send Notification
        </button>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowNotificationModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Notification</h2>
              <button
                className="modal-close"
                onClick={() => setShowNotificationModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSendNotification}>
              <div className="form-group">
                <label>Send To:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="target"
                      value="admin"
                      checked={notificationData.target === "admin"}
                      onChange={(e) =>
                        setNotificationData({
                          ...notificationData,
                          target: e.target.value,
                        })
                      }
                    />
                    Admin Only
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="target"
                      value="executives"
                      checked={notificationData.target === "executives"}
                      onChange={(e) =>
                        setNotificationData({
                          ...notificationData,
                          target: e.target.value,
                        })
                      }
                    />
                    Executives Only
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="target"
                      value="all"
                      checked={notificationData.target === "all"}
                      onChange={(e) =>
                        setNotificationData({
                          ...notificationData,
                          target: e.target.value,
                        })
                      }
                    />
                    Admin + Executives
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  value={notificationData.title}
                  onChange={(e) =>
                    setNotificationData({
                      ...notificationData,
                      title: e.target.value,
                    })
                  }
                  placeholder="Notification title..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Message:</label>
                <textarea
                  value={notificationData.message}
                  onChange={(e) =>
                    setNotificationData({
                      ...notificationData,
                      message: e.target.value,
                    })
                  }
                  placeholder="Your message here..."
                  rows="5"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowNotificationModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
