import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdminPanelSettings, MdLock, MdEmail } from "react-icons/md";
import toast from "react-hot-toast";
import axios from "axios";
import "./SuperAdminLogin.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://backend-083k.onrender.com";

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/superadmin/auth/login`,
        formData,
      );

      if (res.data.success) {
        localStorage.setItem("superadmin_token", res.data.token);
        localStorage.setItem(
          "superadmin_user",
          JSON.stringify(res.data.superAdmin),
        );

        toast.success("Welcome, Super Admin!");
        navigate("/superadmin/dashboard");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";

      if (err.response?.status === 423) {
        toast.error("Account locked. Try again later.");
      } else if (err.response?.status === 403) {
        toast.error("Account has been deactivated");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="superadmin-login">
      <div className="superadmin-login__container">
        <div className="superadmin-login__header">
          <div className="superadmin-login__icon">
            <MdAdminPanelSettings />
          </div>
          <h1>Super Admin Portal</h1>
          <p>Platform Management & Oversight</p>
        </div>

        <form className="superadmin-login__form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <MdEmail /> Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="superadmin@platform.com"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <MdLock /> Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Authenticating..." : "Access Portal"}
          </button>
        </form>

        <div className="superadmin-login__footer">
          <p>🔒 Secure Platform Administration</p>
        </div>
      </div>
    </div>
  );
}
