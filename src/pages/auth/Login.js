import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Input } from "../../components/ui/UI";
import { MdEmail, MdLock, MdGroups } from "react-icons/md";
import toast from "react-hot-toast";
import "./Auth.css";

export default function Login() {
  const { groupLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ contactEmail: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await groupLogin(form);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      // toast.error(err.response?.data?.message || "Login failed");
      toast.error("Login failed");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand__icon">
            <MdGroups />
          </div>
          <h1 className="auth-brand__name">AGMS</h1>
          <p className="auth-brand__tagline">
            Association /Group Management System
          </p>
        </div>

        <h2 className="auth-title">Admin Login</h2>
        <p className="auth-sub">Sign in to manage your Group/Association</p>

        <form onSubmit={submit} className="auth-form">
          <Input
            label="Association Email"
            name="contactEmail"
            type="email"
            placeholder="info@pncnigeria.org"
            value={form.contactEmail}
            onChange={handle}
            icon={<MdEmail />}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handle}
            icon={<MdLock />}
            required
          />
          <Button
            type="submit"
            loading={loading}
            size="lg"
            style={{ width: "100%", marginTop: 8 }}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/member-login">Sign in as a Member →</Link>
          <span className="auth-links__sep">|</span>
          <Link to="/register">Create Association →</Link>
        </div>

        <div className="auth-links auth-links--bottom">
          <a href="/support">Help / Support</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms</a>
          <a href="/pricing">Pricing</a>
        </div>

        <div className="auth-links">
          <p style={{ fontSize: 12 }}>
            By continuing, you agree to our <a href="/terms">Terms</a> and{" "}
            <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
