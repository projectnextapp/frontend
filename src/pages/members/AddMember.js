import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memberAPI } from '../../services/api';
import { PageHeader, Button, Input, Select, Card } from '../../components/ui/UI';
import { MdArrowBack } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Members.css';

const ROLE_OPTIONS = [
  { value: 'member',    label: 'Member' },
  { value: 'executive', label: 'Executive' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'secretary', label: 'Secretary' },
  { value: 'president', label: 'President' },
];

export default function AddMember() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    dateOfBirth: '', career: '', role: 'member',
    stateOfOrigin: '', localGovernment: '', countryOfResidence: '', residentialAddress: ''
  });
  const [loading, setLoading] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });

    setLoading(true);
    try {
      await memberAPI.add(fd);
      toast.success('Member added successfully!');
      navigate('/members');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="Add New Member"
        subtitle="Fill in member details to add them to the association"
        actions={
          <Button variant="ghost" icon={<MdArrowBack />} onClick={() => navigate('/members')}>
            Back
          </Button>
        }
      />

      <Card>
        <form onSubmit={submit} className="add-member__form">
          {/* Personal Info */}
          <div className="add-member__section">
            <div className="add-member__section-title">Personal Information</div>
            <div className="add-member__grid">
              <Input label="Full Name *" name="name" placeholder="Jane Doe" value={form.name} onChange={handle} required />
              <Input label="Email Address *" name="email" type="email" placeholder="jane@email.com" value={form.email} onChange={handle} required />
              <Input label="Password *" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handle} required />
              <Input label="Phone Number" name="phone" placeholder="+234..." value={form.phone} onChange={handle} />
              <Input label="Date of Birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handle} />
              <Input label="Career / Profession" name="career" placeholder="e.g. Software Engineer" value={form.career} onChange={handle} />
            </div>
            <Select label="Role in Association" name="role" options={ROLE_OPTIONS} value={form.role} onChange={handle} />
          </div>

          {/* Private Info (Admin only) */}
          <div className="add-member__section">
            <div className="add-member__section-title">Private Information (Admin-only)</div>
            <div className="add-member__grid">
              <Input label="State of Origin" name="stateOfOrigin" value={form.stateOfOrigin} onChange={handle} />
              <Input label="Local Government" name="localGovernment" value={form.localGovernment} onChange={handle} />
              <Input label="Country of Residence" name="countryOfResidence" value={form.countryOfResidence} onChange={handle} />
              <Input label="Residential Address" name="residentialAddress" value={form.residentialAddress} onChange={handle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="submit" loading={loading}>Add Member</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/members')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
