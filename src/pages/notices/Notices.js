import React, { useEffect, useState } from 'react';
import { noticeAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  PageHeader, Button, Card, Badge, EmptyState, PageLoader, Input, Select, Textarea
} from '../../components/ui/UI';
import { MdCampaign, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import './Notices.css';

const TYPE_OPT = [
  { value: 'notice',         label: '📢 Notice' },
  { value: 'meeting_minutes', label: '📋 Meeting Minutes' },
  { value: 'announcement',   label: '📣 Announcement' },
];

const FILTER_OPT = [
  { value: '',                label: 'All' },
  { value: 'notice',          label: 'Notices' },
  { value: 'meeting_minutes', label: 'Meeting Minutes' },
  { value: 'announcement',   label: 'Announcements' },
];

const typeColor = t => ({ notice: 'blue', meeting_minutes: 'purple', announcement: 'green' })[t] || 'default';
const typeLabel = t => ({ notice: 'Notice', meeting_minutes: 'Meeting Minutes', announcement: 'Announcement' })[t] || t;

export default function Notices() {
  const { isSecretary } = useAuth();
  const [notices,   setNotices]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editNotice, setEditNotice] = useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'notice' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    noticeAPI.getAll(filter ? { type: filter } : {})
      .then(res => setNotices(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editNotice) {
        await noticeAPI.update(editNotice._id, { ...form, changes: 'Content updated via edit' });
        toast.success('Notice updated!');
        setEditNotice(null);
      } else {
        await noticeAPI.create(form);
        toast.success('Notice posted!');
        setShowForm(false);
      }
      setForm({ title: '', content: '', type: 'notice' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const startEdit = (notice) => {
    setEditNotice(notice);
    setForm({ title: notice.title, content: notice.content, type: notice.type });
    setShowForm(false);
  };

  const deleteNotice = async (id) => {
    try {
      await noticeAPI.delete(id);
      toast.success('Notice archived');
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title="Notices & Meeting Minutes"
        subtitle="Stay informed with the latest announcements"
        actions={
          isSecretary && (
            <Button icon={<MdAdd />} onClick={() => { setShowForm(s => !s); setEditNotice(null); setForm({ title: '', content: '', type: 'notice' }); }}>
              Post Notice
            </Button>
          )
        }
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTER_OPT.map(o => (
          <button
            key={o.value}
            className={`members__tab ${filter === o.value ? 'members__tab--active' : ''}`}
            onClick={() => setFilter(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Create / Edit form */}
      {(showForm || editNotice) && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>{editNotice ? 'Edit Notice' : 'Post New Notice'}</h3>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="Title *" name="title" placeholder="Notice title" value={form.title} onChange={handle} required />
              <Select label="Type" name="type" options={TYPE_OPT} value={form.type} onChange={handle} />
            </div>
            <Textarea label="Content *" name="content" placeholder="Write your notice here..." value={form.content} onChange={handle} rows={5} required />
            <div style={{ display: 'flex', gap: 10 }}>
              <Button type="submit" loading={saving}>{editNotice ? 'Save Changes' : 'Post Notice'}</Button>
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditNotice(null); }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {notices.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MdCampaign />}
            title="No notices yet"
            description="Post your first notice or meeting minutes"
            action={isSecretary && <Button onClick={() => setShowForm(true)}>Post Notice</Button>}
          />
        </Card>
      ) : (
        <div className="notice-cards">
          {notices.map(n => (
            <Card key={n._id} className="notice-card" padding={false}>
              <div className="notice-card__header" onClick={() => setExpanded(expanded === n._id ? null : n._id)}>
                <div className="notice-card__meta">
                  <Badge color={typeColor(n.type)}>{typeLabel(n.type)}</Badge>
                  <span className="notice-card__date">{format(new Date(n.createdAt), 'PPP')}</span>
                </div>
                <h3 className="notice-card__title">{n.title}</h3>
                <div className="notice-card__footer">
                  <span className="notice-card__author">
                    By {n.postedBy?.name || 'Admin'}
                    {n.editHistory?.length > 0 && <span className="notice-card__edited"> · edited {n.editHistory.length}×</span>}
                  </span>
                  {isSecretary && (
                    <div className="notice-card__actions" onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="ghost" icon={<MdEdit />} onClick={() => startEdit(n)}>Edit</Button>
                      <Button size="sm" variant="danger" icon={<MdDelete />} onClick={() => deleteNotice(n._id)}>Remove</Button>
                    </div>
                  )}
                </div>
              </div>
              {expanded === n._id && (
                <div className="notice-card__body">{n.content}</div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
