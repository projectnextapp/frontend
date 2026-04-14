// ================================================================
// CREATE: frontend/src/pages/members/PendingMembers.js
// ================================================================
// Admin interface to approve/reject pending member registrations
// ================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { memberAPI } from '../../services/api';
// import { useAuth } from '../../context/AuthContext';
import { 
  PageHeader, 
  Button, 
  Card, 
  Badge, 
  EmptyState, 
  PageLoader,
  ConfirmModal 
} from '../../components/ui/UI';
import { MdCheckCircle, MdCancel, MdPeople, MdSelectAll } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Members.css';

export default function PendingMembers() {
//   const { isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [actionModal, setActionModal] = useState({ open: false, type: null, member: null });

  const loadPendingMembers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await memberAPI.getPending();
      setMembers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load pending members');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingMembers();
  }, [loadPendingMembers]);

  // Handle single approval
  const handleApprove = async (memberId) => {
    try {
      await memberAPI.approve(memberId);
      toast.success('Member approved successfully! ✅');
      loadPendingMembers();
      setSelectedMembers([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve member');
    }
  };

  // Handle single rejection
  const handleReject = async (memberId, reason = '') => {
    try {
      await memberAPI.reject(memberId, { reason });
      toast.success('Member registration rejected');
      loadPendingMembers();
      setSelectedMembers([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject member');
    }
  };

  // Handle bulk approval
  const handleBulkApprove = async () => {
    if (selectedMembers.length === 0) {
      toast.error('Please select members to approve');
      return;
    }

    try {
      await memberAPI.bulkApprove({ memberIds: selectedMembers });
      toast.success(`${selectedMembers.length} member(s) approved! ✅`);
      loadPendingMembers();
      setSelectedMembers([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve members');
    }
  };

  // Toggle member selection
  const toggleSelect = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Select all members
  const selectAll = () => {
    if (selectedMembers.length === members.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(members.map(m => m._id));
    }
  };

  // Open confirmation modal
  const openActionModal = (type, member = null) => {
    setActionModal({ open: true, type, member });
  };

  // Execute action from modal
  const executeAction = async () => {
    const { type, member } = actionModal;
    setActionModal({ open: false, type: null, member: null });

    if (type === 'approve') {
      await handleApprove(member._id);
    } else if (type === 'reject') {
      await handleReject(member._id);
    } else if (type === 'bulk-approve') {
      await handleBulkApprove();
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="pending-members">
      <PageHeader
        title="Pending Registrations"
        subtitle={`${members.length} member${members.length !== 1 ? 's' : ''} awaiting approval`}
        actions={
          selectedMembers.length > 0 && (
            <Button 
              icon={<MdCheckCircle />}
              onClick={() => openActionModal('bulk-approve')}
            >
              Approve Selected ({selectedMembers.length})
            </Button>
          )
        }
      />

      {members.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MdPeople />}
            title="No pending registrations"
            description="All member registrations have been processed"
          />
        </Card>
      ) : (
        <>
          {/* Bulk Actions Bar */}
          {members.length > 0 && (
            <Card style={{ marginBottom: '20px', padding: '12px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<MdSelectAll />}
                  onClick={selectAll}
                >
                  {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {selectedMembers.length} selected
                </span>
              </div>
            </Card>
          )}

          {/* Members List */}
          <div className="members-grid">
            {members.map(member => (
              <Card key={member._id} className="member-card">
                {/* Selection Checkbox */}
                <div className="member-card__select">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member._id)}
                    onChange={() => toggleSelect(member._id)}
                  />
                </div>

                {/* Member Info */}
                <div className="member-card__header">
                  <div className="member-card__avatar">
                    {member.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="member-card__info">
                    <h3 className="member-card__name">{member.name}</h3>
                    <Badge color="yellow">Pending Approval</Badge>
                  </div>
                </div>

                {/* Details */}
                <div className="member-card__details">
                  <div className="member-card__detail">
                    <span className="label">Email:</span>
                    <span className="value">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="member-card__detail">
                      <span className="label">Phone:</span>
                      <span className="value">{member.phone}</span>
                    </div>
                  )}
                  {member.career && (
                    <div className="member-card__detail">
                      <span className="label">Career:</span>
                      <span className="value">{member.career}</span>
                    </div>
                  )}
                  <div className="member-card__detail">
                    <span className="label">Registered:</span>
                    <span className="value">
                      {new Date(member.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="member-card__actions">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<MdCheckCircle />}
                    onClick={() => openActionModal('approve', member)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<MdCancel />}
                    onClick={() => openActionModal('reject', member)}
                  >
                    Reject
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        open={actionModal.open}
        title={
          actionModal.type === 'approve'
            ? 'Approve Member?'
            : actionModal.type === 'reject'
            ? 'Reject Registration?'
            : 'Approve Selected Members?'
        }
        message={
          actionModal.type === 'approve'
            ? `Are you sure you want to approve ${actionModal.member?.name}? They will be able to login immediately.`
            : actionModal.type === 'reject'
            ? `Are you sure you want to reject ${actionModal.member?.name}'s registration? This action cannot be undone.`
            : `Approve ${selectedMembers.length} selected member(s)? They will all be able to login immediately.`
        }
        onConfirm={executeAction}
        onCancel={() => setActionModal({ open: false, type: null, member: null })}
        danger={actionModal.type === 'reject'}
      />
    </div>
  );
}