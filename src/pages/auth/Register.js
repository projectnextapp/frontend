import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Select } from '../../components/ui/UI';
import { MdBusiness, MdEmail, MdLock, MdLocationOn, MdPerson } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Auth.css';

const SIZE_OPTIONS = [
  { value: '', label: 'Select membership size...' },
  { value: '1-10', label: '1 – 10 members' },
  { value: '11-500', label: '11 – 500 members' },
  { value: '501-1000', label: '501 – 1,000 members' },
  { value: '1001-5000', label: '1,001 – 5,000 members' },
];

export default function Register() {
  const { createGroup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', location: '', contactEmail: '', password: '', memberSizeRange: '',
    adminName: '', adminEmail: '', adminPhone: ''
  });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.memberSizeRange) { toast.error('Please select membership size'); return; }

    // Build form data for multipart (supports logo upload later)
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('location', form.location);
    fd.append('contactEmail', form.contactEmail);
    fd.append('password', form.password);
    fd.append('memberSizeRange', form.memberSizeRange);
    fd.append('adminInfo[name]', form.adminName);
    fd.append('adminInfo[email]', form.adminEmail);
    fd.append('adminInfo[phone]', form.adminPhone);

    setLoading(true);
    try {
      await createGroup(fd);
      toast.success('Association created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page--wide">
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">
          <div className="auth-brand__icon"><MdBusiness /></div>
          <h1 className="auth-brand__name">AGMS</h1>
          <p className="auth-brand__tagline">Create Your Association</p>
        </div>

        <h2 className="auth-title">Register Association</h2>
        <p className="auth-sub">Set up your group management account</p>

        <form onSubmit={submit} className="auth-form">
          <div className="auth-form__section">
            <h4 className="auth-form__section-title">Association Details</h4>
            <div className="auth-form__grid">
              <Input label="Association Name" name="name" placeholder="e.g. Old Boys Alumni" value={form.name} onChange={handle} icon={<MdBusiness />} required />
              <Input label="Location / City" name="location" placeholder="e.g. Lagos, Nigeria" value={form.location} onChange={handle} icon={<MdLocationOn />} required />
              <Input label="Contact Email" name="contactEmail" type="email" placeholder="contact@association.org" value={form.contactEmail} onChange={handle} icon={<MdEmail />} required />
              <Input label="Password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handle} icon={<MdLock />} required />
            </div>
            <Select label="Membership Size Range" name="memberSizeRange" options={SIZE_OPTIONS} value={form.memberSizeRange} onChange={handle} />
          </div>

          <div className="auth-form__section">
            <h4 className="auth-form__section-title">Admin / Representative</h4>
            <div className="auth-form__grid">
              <Input label="Full Name" name="adminName" placeholder="Your name" value={form.adminName} onChange={handle} icon={<MdPerson />} required />
              <Input label="Email" name="adminEmail" type="email" placeholder="admin@email.com" value={form.adminEmail} onChange={handle} icon={<MdEmail />} required />
            </div>
          </div>

          <Button type="submit" loading={loading} size="lg" style={{ width: '100%', marginTop: 8 }}>
            Create Association
          </Button>
        </form>

        <div className="auth-links">
          <Link to="/login">← Already registered? Sign in</Link>
        </div>
      </div>
    </div>
  );
}
