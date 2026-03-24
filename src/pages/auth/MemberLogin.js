import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui/UI';
import { MdEmail, MdLock, MdPerson, MdTag } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Auth.css';

export default function MemberLogin() {
  const { memberLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', groupId: '' });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await memberLogin(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand__icon"><MdPerson /></div>
          <h1 className="auth-brand__name">AGMS</h1>
          <p className="auth-brand__tagline">Member Portal</p>
        </div>

        <h2 className="auth-title">Member Login</h2>
        <p className="auth-sub">Sign in to your association account</p>

        <form onSubmit={submit} className="auth-form">
          <Input
            label="Group / Association ID"
            name="groupId"
            placeholder="Paste your Group ID here"
            value={form.groupId}
            onChange={handle}
            icon={<MdTag />}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={form.email}
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
          <Button type="submit" loading={loading} size="lg" style={{ width: '100%', marginTop: 8 }}>
            Sign In
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/login">← Admin Login</Link>
          <span className="auth-links__sep">|</span>
          <Link to="/register">Create Association →</Link>
        </div>
      </div>
    </div>
  );
}
