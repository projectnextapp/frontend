import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdAdd,
  MdEdit,
  MdDelete,
  MdToggleOn,
  MdToggleOff,
  //   MdVisibility,
} from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import "./AdvertManagement.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://backend-083k.onrender.com/api";

export default function AdvertManagement() {
  const navigate = useNavigate();
  const [adverts, setAdverts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    position: "dashboard",
    startDate: "",
    endDate: "",
    targetAudience: "all",
    targetGroups: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdverts = useCallback(async () => {
    try {
      const token = localStorage.getItem("superadmin_token");
      const params = filter !== "all" ? { status: filter } : {};

      const res = await axios.get(`${API_URL}/superadmin/adverts`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (res.data.success) {
        setAdverts(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load adverts");
      if (err.response?.status === 401) {
        navigate("/superadmin/login");
      }
    } finally {
      setLoading(false);
    }
  }, [filter, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("superadmin_token");
      const res = await axios.get(`${API_URL}/superadmin/adverts/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load stats");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("superadmin_token");
    if (!token) {
      navigate("/superadmin/login");
      return;
    }
    fetchAdverts();
    fetchStats();
  }, [navigate, fetchAdverts, fetchStats]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem("superadmin_token");
      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("position", formData.position);
      data.append("startDate", formData.startDate);
      data.append("endDate", formData.endDate);
      data.append("targetAudience", formData.targetAudience);

      if (formData.link) data.append("link", formData.link);
      if (imageFile) data.append("image", imageFile);
      if (formData.targetAudience === "specific_groups") {
        data.append("targetGroups", JSON.stringify(formData.targetGroups));
      }

      const url = editingAdvert
        ? `${API_URL}/superadmin/adverts/${editingAdvert._id}`
        : `${API_URL}/superadmin/adverts`;

      const method = editingAdvert ? "put" : "post";

      const res = await axios[method](url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success(editingAdvert ? "Advert updated!" : "Advert created!");
        setShowModal(false);
        resetForm();
        fetchAdverts();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (advert) => {
    setEditingAdvert(advert);
    setFormData({
      title: advert.title,
      description: advert.description,
      link: advert.link || "",
      position: advert.position,
      startDate: advert.startDate?.split("T")[0] || "",
      endDate: advert.endDate?.split("T")[0] || "",
      targetAudience: advert.targetAudience,
      targetGroups: advert.targetGroups || [],
    });
    setImagePreview(advert.image);
    setShowModal(true);
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("superadmin_token");
      await axios.patch(
        `${API_URL}/superadmin/adverts/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success(`Advert ${currentStatus ? "deactivated" : "activated"}!`);
      fetchAdverts();
      fetchStats();
    } catch (err) {
      // console.log("TOGGLE ERROR:", err.response);
      toast.error(err.response?.data?.message || "Failed to toggle advert");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advert?")) return;

    try {
      const token = localStorage.getItem("superadmin_token");
      await axios.delete(`${API_URL}/superadmin/adverts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Advert deleted!");
      fetchAdverts();
      fetchStats();
    } catch (err) {
      toast.error("Failed to delete advert");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      link: "",
      position: "dashboard",
      startDate: "",
      endDate: "",
      targetAudience: "all",
      targetGroups: [],
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingAdvert(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="advert-management">
      <div className="page-header">
        <div>
          <Link to="/superadmin/dashboard" className="back-link">
            <MdArrowBack /> Back to Dashboard
          </Link>
          <h1>📢 Advert Management</h1>
          <p>Create and manage platform-wide advertisements</p>
        </div>
        <button className="btn-create" onClick={openCreateModal}>
          <MdAdd /> Create Advert
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Adverts</h3>
            <p className="stat-number">{stats.totalAdverts}</p>
          </div>
          <div className="stat-card stat-card--active">
            <h3>Active Now</h3>
            <p className="stat-number">{stats.activeAdverts}</p>
          </div>
          <div className="stat-card stat-card--scheduled">
            <h3>Scheduled</h3>
            <p className="stat-number">{stats.scheduledAdverts}</p>
          </div>
          <div className="stat-card stat-card--expired">
            <h3>Expired</h3>
            <p className="stat-number">{stats.expiredAdverts}</p>
          </div>
          <div className="stat-card stat-card--impressions">
            <h3>Total Impressions</h3>
            <p className="stat-number">
              {stats.totalImpressions.toLocaleString()}
            </p>
          </div>
          <div className="stat-card stat-card--clicks">
            <h3>Total Clicks</h3>
            <p className="stat-number">{stats.totalClicks.toLocaleString()}</p>
            <p className="stat-meta">
              CTR:{" "}
              {stats.totalImpressions > 0
                ? ((stats.totalClicks / stats.totalImpressions) * 100).toFixed(
                    2,
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === "active" ? "active" : ""}`}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === "inactive" ? "active" : ""}`}
          onClick={() => setFilter("inactive")}
        >
          Inactive
        </button>
      </div>

      {/* Adverts List */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading adverts...</p>
        </div>
      ) : adverts.length === 0 ? (
        <div className="empty-state">
          <h3>No adverts found</h3>
          <p>Create your first advert to get started</p>
          <button className="btn-create" onClick={openCreateModal}>
            <MdAdd /> Create Advert
          </button>
        </div>
      ) : (
        <div className="adverts-list">
          {adverts.map((advert) => (
            <div key={advert._id} className="advert-item">
              {advert.image && (
                <div className="advert-item__image">
                  <img src={advert.image} alt={advert.title} />
                </div>
              )}
              <div className="advert-item__content">
                <div className="advert-item__header">
                  <h3>{advert.title}</h3>
                  <div className="advert-badges">
                    <span className={`badge badge--${advert.position}`}>
                      {advert.position}
                    </span>
                    <span
                      className={`badge ${advert.isActive ? "badge--active" : "badge--inactive"}`}
                    >
                      {advert.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <p className="advert-description">{advert.description}</p>
                <div className="advert-meta">
                  <span>
                    📅 {new Date(advert.startDate).toLocaleDateString()} -{" "}
                    {new Date(advert.endDate).toLocaleDateString()}
                  </span>
                  <span>👁️ {advert.impressions} impressions</span>
                  <span>🖱️ {advert.clicks} clicks</span>
                  {advert.link && <span>🔗 Has link</span>}
                </div>
              </div>
              <div className="advert-item__actions">
                <button
                  className="btn-icon"
                  onClick={() => handleEdit(advert)}
                  title="Edit"
                >
                  <MdEdit />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => handleToggle(advert._id, advert.isActive)}
                  title={advert.isActive ? "Deactivate" : "Activate"}
                >
                  {advert.isActive ? <MdToggleOn /> : <MdToggleOff />}
                </button>
                <button
                  className="btn-icon btn-icon--danger"
                  onClick={() => handleDelete(advert._id)}
                  title="Delete"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAdvert ? "Edit Advert" : "Create Advert"}</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Advert title..."
                    maxLength="100"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Advert description..."
                  rows="3"
                  maxLength="500"
                  required
                />
              </div>

              <div className="form-group">
                <label>Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Link (optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  placeholder="https://pncnigeria.org"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Position *</label>
                  <select
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                  >
                    <option value="header">Header Banner</option>
                    <option value="footer">Footer Banner</option>
                    <option value="dashboard">Dashboard Card</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Audience *</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetAudience: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="all">All Users</option>
                    <option value="specific_groups">Specific Groups</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : editingAdvert
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
