import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { memberAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader, Button, Card, Badge, Avatar,
  EmptyState, PageLoader, Input, ConfirmModal
} from '../../components/ui/UI';
import { MdPersonAdd, MdSearch, MdPeople } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Members.css';

const roleBadge = role => {
  const map = { admin: 'purple', president: 'blue', secretary: 'blue', treasurer: 'green', executive: 'blue', member: 'default' };
  return <Badge color={map[role] || 'default'}>{role}</Badge>;
};

const statusBadge = status => {
  const map = { active: 'green', pending: 'yellow', inactive: 'gray' };
  return <Badge color={map[status]}>{status}</Badge>;
};

export default function Members() {
  const { isPresident } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('');
  const [confirm, setConfirm] = useState(null);

  const load = () => {
    setLoading(true);
    memberAPI.getAll({ search, status: filter })
      .then(res => setMembers(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filter]);

  const handleApprove = async (id) => {
    try {
      await memberAPI.approve(id);
      toast.success('Member approved!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleToggle = async (id) => {
    try {
      await memberAPI.toggleStatus(id);
      toast.success('Status updated');
      load();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    try {
      await memberAPI.delete(confirm.id);
      toast.success('Member removed');
      setConfirm(null);
      load();
    } catch (err) { toast.error('Failed'); }
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${members.length} total member${members.length !== 1 ? 's' : ''}`}
        actions={
          isPresident && (
            <Link to="/members/add">
              <Button icon={<MdPersonAdd />}>Add Member</Button>
            </Link>
          )
        }
      />

      {/* Filters */}
      <div className="members__filters">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={<MdSearch />}
          className="members__search"
        />
        <div className="members__tabs">
          {['', 'active', 'pending', 'inactive'].map(s => (
            <button
              key={s}
              className={`members__tab ${filter === s ? 'members__tab--active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MdPeople />}
            title="No members found"
            description="Add your first member to get started"
            action={isPresident && <Link to="/members/add"><Button>Add Member</Button></Link>}
          />
        </Card>
      ) : (
        <Card padding={false}>
          <div className="members-table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Joined</th>
                  {isPresident && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m._id}>
                    <td>
                      <Link to={`/members/${m._id}`} className="member-row">
                        <Avatar src={m.profilePhoto} name={m.name} size="sm" />
                        <div>
                          <div className="member-row__name">{m.name}</div>
                          <div className="member-row__email">{m.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td>{roleBadge(m.role)}</td>
                    <td>{statusBadge(m.status)}</td>
                    <td>
                      <Badge color={m.paymentStatus === 'paid' ? 'green' : m.paymentStatus === 'partial' ? 'yellow' : 'red'}>
                        {m.paymentStatus}
                      </Badge>
                    </td>
                    <td className="table-date">
                      {m.joinDate ? new Date(m.joinDate).toLocaleDateString() : '—'}
                    </td>
                    {isPresident && (
                      <td>
                        <div className="table-actions">
                          {m.status === 'pending' && (
                            <Button size="sm" variant="accent" onClick={() => handleApprove(m._id)}>Approve</Button>
                          )}
                          {m.status !== 'pending' && (
                            <Button size="sm" variant="ghost" onClick={() => handleToggle(m._id)}>
                              {m.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                          <Button size="sm" variant="danger" onClick={() => setConfirm({ id: m._id, name: m.name })}>
                            Remove
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ConfirmModal
        open={!!confirm}
        title="Remove Member"
        message={`Are you sure you want to remove ${confirm?.name} from the association? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
        danger
      />
    </div>
  );
}
