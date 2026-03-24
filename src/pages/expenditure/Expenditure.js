import React, { useState, useEffect, useCallback } from "react";
import { expenditureAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  StatCard,
  PageLoader,
  EmptyState,
  Input,
  Select,
  Textarea,
  Modal,
} from "../../components/ui/UI";
import {
  MdAccountBalance,
  MdAdd,
  MdCheck,
  MdDelete,
  MdEdit,
} from "react-icons/md";
import { format } from "date-fns";
import toast from "react-hot-toast";
import "./Expenditure.css";

const CATEGORY_OPTIONS = [
  { value: "operational", label: "Operational" },
  { value: "event", label: "Event" },
  { value: "maintenance", label: "Maintenance" },
  { value: "welfare", label: "Welfare" },
  { value: "donation", label: "Donation" },
  { value: "other", label: "Other" },
];

export default function Expenditure() {
  const { isTreasurer, isAdmin, isPresident } = useAuth();
  const canManage = isTreasurer || isAdmin;
  const canApprove = isAdmin || isPresident;

  const [expenditures, setExpenditures] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "operational",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([expenditureAPI.getAll(), expenditureAPI.getSummary()])
      .then(([expRes, sumRes]) => {
        setExpenditures(expRes.data.data);
        setSummary(sumRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
 // Listen for real-time updates
    const handleRefresh = () => {
      console.log('🔄 Expenditure refresh triggered');
      load();
    };
    
    window.addEventListener('refresh:expenditures', handleRefresh);
    window.addEventListener('refresh:dashboard', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh:expenditures', handleRefresh);
      window.removeEventListener('refresh:dashboard', handleRefresh);
    };
  }, [load]);

  const openModal = (exp = null) => {
    if (exp) {
      setEditingId(exp._id);
      setForm({
        amount: exp.amount,
        description: exp.description,
        category: exp.category,
        date: exp.date ? new Date(exp.date).toISOString().split("T")[0] : "",
        notes: exp.notes || "",
      });
    } else {
      setEditingId(null);
      setForm({
        amount: "",
        description: "",
        category: "operational",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await expenditureAPI.update(editingId, form);
        toast.success("Expenditure updated!");
      } else {
        await expenditureAPI.create(form);
        toast.success("Expenditure recorded!");
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await expenditureAPI.approve(id);
      toast.success("Expenditure approved!");
      load();
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this expenditure record?")) return;
    try {
      await expenditureAPI.delete(id);
      toast.success("Expenditure deleted!");
      load();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="expenditure">
      <PageHeader
        title="Expenditures"
        subtitle="Track withdrawals and expenses"
        actions={
          canManage && (
            <Button icon={<MdAdd />} onClick={() => openModal()}>
              Record Expenditure
            </Button>
          )
        }
      />

      {/* Summary Cards */}
      {summary && (
        <div className="expenditure__summary">
          <StatCard
            label="Total Income"
            value={`₦${summary.totalIncome?.toLocaleString() || 0}`}
            icon={<MdAccountBalance />}
            color="blue"
            subText={`₦${summary.totalDue?.toLocaleString()} due`}
          />
          <StatCard
            label="Total Expenses"
            value={`₦${summary.approvedExpenses?.toLocaleString() || 0}`}
            icon={<MdAccountBalance />}
            color="red"
            subText={`${summary.expenditureCount} records`}
          />
          <StatCard
            label="Current Balance"
            value={`₦${summary.currentBalance?.toLocaleString() || 0}`}
            icon={<MdAccountBalance />}
            color={summary.currentBalance >= 0 ? "green" : "red"}
            subText={summary.currentBalance >= 0 ? "Positive" : "Deficit"}
          />
          {canApprove && summary.pendingExpenses > 0 && (
            <StatCard
              label="Pending Approval"
              value={`₦${summary.pendingExpenses?.toLocaleString()}`}
              icon={<MdAccountBalance />}
              color="yellow"
              subText="Awaiting approval"
            />
          )}
        </div>
      )}

      {/* Expenditures Table */}
      <Card padding={false}>
        {expenditures.length === 0 ? (
          <EmptyState
            icon={<MdAccountBalance />}
            title="No expenditures yet"
            description={
              canManage
                ? "Record your first expenditure"
                : "No expenses recorded"
            }
          />
        ) : (
          <div className="expenditure__table-wrap">
            <table className="expenditure__table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Recorded By</th>
                  <th>Status</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {expenditures.map((exp) => (
                  <tr key={exp._id}>
                    <td>
                      {format(
                        new Date(exp.date || exp.createdAt),
                        "MMM d, yyyy",
                      )}
                    </td>
                    <td>
                      <div className="expenditure__desc">
                        <strong>{exp.description}</strong>
                        {exp.notes && (
                          <span className="expenditure__notes">
                            {exp.notes}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge color="default">{exp.category}</Badge>
                    </td>
                    <td className="expenditure__amount">
                      ₦{exp.amount?.toLocaleString()}
                    </td>
                    <td>
                      <div className="expenditure__recorded">
                        <div>{exp.recordedBy?.name || "—"}</div>
                        <small>{exp.recordedBy?.email}</small>
                      </div>
                    </td>
                    <td>
                      {exp.isApproved ? (
                        <div className="expenditure__approved">
                          <Badge color="green">Approved</Badge>
                          <small>by {exp.approvedBy?.name}</small>
                        </div>
                      ) : (
                        <Badge color="yellow">Pending</Badge>
                      )}
                    </td>
                    {canManage && (
                      <td>
                        <div className="expenditure__actions">
                          {!exp.isApproved && canApprove && (
                            <button
                              className="expenditure__action expenditure__action--approve"
                              onClick={() => handleApprove(exp._id)}
                              title="Approve"
                            >
                              <MdCheck />
                            </button>
                          )}
                          {!exp.isApproved && (
                            <button
                              className="expenditure__action expenditure__action--edit"
                              onClick={() => openModal(exp)}
                              title="Edit"
                            >
                              <MdEdit />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              className="expenditure__action expenditure__action--delete"
                              onClick={() => handleDelete(exp._id)}
                              title="Delete"
                            >
                              <MdDelete />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? "Edit Expenditure" : "Record Expenditure"}
      >
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
          <Input
            label="Amount (₦) *"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
          />
          <Input
            label="Description *"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="e.g. Hall maintenance, Event expenses"
            required
          />
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Optional additional details"
          />
          <div style={{ display: "flex", gap: 10 }}>
            <Button type="submit" loading={saving}>
              {editingId ? "Update" : "Record"} Expenditure
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
