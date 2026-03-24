import React, { useEffect, useState } from "react";
import { financeAPI } from "../../services/api";
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
} from "../../components/ui/UI";
import { MdAccountBalance, MdAdd, MdSend, MdPayment } from "react-icons/md";
import { format } from "date-fns";
import toast from "react-hot-toast";
import "./Finance.css";

const TYPE_OPT = [
  { value: "", label: "All types" },
  { value: "dues", label: "Dues" },
  { value: "levy", label: "Levy" },
  { value: "fine", label: "Fine" },
  { value: "donation", label: "Donation" },
  { value: "other", label: "Other" },
];

const TYPE_CREATE = [
  { value: "dues", label: "Dues" },
  { value: "levy", label: "Levy" },
  { value: "fine", label: "Fine" },
  { value: "donation", label: "Donation" },
  { value: "other", label: "Other" },
];

export default function Finance() {
  const { isTreasurer, isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [myRecords, setMyRecords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    memberId: "",
    type: "dues",
    description: "",
    amountDue: "",
    amountPaid: 0,
    dueDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  // NEW: Add payment modal
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDesc, setPaymentDesc] = useState("");

  const isManager = isTreasurer || isAdmin;

  const loadData = () => {
    setLoading(true);
    const requests = isManager
      ? [financeAPI.getAll(), financeAPI.getSummary()]
      : [financeAPI.getMyRecords()];

    Promise.all(requests)
      .then((results) => {
        if (isManager) {
          setPayments(results[0].data.data);
          setSummary(results[1].data.data);
        } else {
          setMyRecords(results[0].data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createPayment = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await financeAPI.create(form);
      toast.success("Payment record created!");
      setShowForm(false);
      setForm({
        memberId: "",
        type: "dues",
        description: "",
        amountDue: "",
        amountPaid: 0,
        dueDate: "",
        notes: "",
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const sendReminder = async () => {
    try {
      await financeAPI.sendReminder({
        message: "You have outstanding dues. Please make your payment.",
      });
      toast.success("Payment reminders sent to all members!");
    } catch (err) {
      toast.error("Failed");
    }
  };

  // NEW: Open add payment modal
  const openAddPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentAmount("");
    setPaymentDesc("");
    setShowAddPayment(true);
  };

  // NEW: Submit additional payment
  const submitAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      const res = await financeAPI.addPayment(selectedPayment._id, {
        amount: parseFloat(paymentAmount),
        description: paymentDesc || undefined,
      });

      toast.success(res.data.message || "Payment added successfully!");
      setShowAddPayment(false);
      setSelectedPayment(null);
      setPaymentAmount("");
      setPaymentDesc("");
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add payment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const statusColor = (s) =>
    ({ paid: "green", partial: "yellow", unpaid: "red" })[s] || "gray";

  // Member own view
  if (!isManager && myRecords) {
    return (
      <div>
        <PageHeader
          title="My Payment Records"
          subtitle="Your dues and payment history"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <StatCard
            label="Total Due"
            value={`₦${myRecords.summary?.total?.toLocaleString() || 0}`}
            icon={<MdAccountBalance />}
            color="blue"
          />
          <StatCard
            label="Total Paid"
            value={`₦${myRecords.summary?.paid?.toLocaleString() || 0}`}
            icon={<MdAccountBalance />}
            color="green"
          />
          <StatCard
            label="Outstanding"
            value={`₦${myRecords.summary?.outstanding?.toLocaleString() || 0}`}
            icon={<MdAccountBalance />}
            color="red"
          />
        </div>
        <Card padding={false}>
          <PaymentsTable payments={myRecords.data} statusColor={statusColor} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Financial Records"
        subtitle="Track dues, payments, and outstanding balances"
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="outline" icon={<MdSend />} onClick={sendReminder}>
              Send Reminder
            </Button>
            <Button icon={<MdAdd />} onClick={() => setShowForm((s) => !s)}>
              New Record
            </Button>
          </div>
        }
      />

      {/* Summary */}
      {summary && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <StatCard
            label="Total Due"
            value={`₦${summary.totalDue?.toLocaleString()}`}
            icon={<MdAccountBalance />}
            color="blue"
          />
          <StatCard
            label="Total Paid"
            value={`₦${summary.totalPaid?.toLocaleString()}`}
            icon={<MdAccountBalance />}
            color="green"
          />
          <StatCard
            label="Outstanding"
            value={`₦${summary.outstanding?.toLocaleString()}`}
            icon={<MdAccountBalance />}
            color="red"
          />
          <StatCard
            label="Records"
            value={summary.recordCount}
            icon={<MdAccountBalance />}
            color="yellow"
          />
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Create Payment Record</h3>
          <form
            onSubmit={createPayment}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Input
              label="Member ID *"
              name="memberId"
              placeholder="Paste member ID"
              value={form.memberId}
              onChange={handle}
              required
            />
            <Select
              label="Type"
              name="type"
              options={TYPE_CREATE}
              value={form.type}
              onChange={handle}
            />
            <Input
              label="Description *"
              name="description"
              placeholder="e.g. Annual dues 2024"
              value={form.description}
              onChange={handle}
              required
            />
            <Input
              label="Amount Due (₦) *"
              name="amountDue"
              type="number"
              min="0"
              value={form.amountDue}
              onChange={handle}
              required
            />
            <Input
              label="Amount Paid (₦)"
              name="amountPaid"
              type="number"
              min="0"
              value={form.amountPaid}
              onChange={handle}
            />
            <Input
              label="Due Date"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handle}
            />
            <div style={{ gridColumn: "span 2" }}>
              <Textarea
                label="Notes"
                name="notes"
                value={form.notes}
                onChange={handle}
                rows={2}
              />
            </div>
            <div style={{ gridColumn: "span 2", display: "flex", gap: 10 }}>
              <Button type="submit" loading={saving}>
                Create Record
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* NEW: Add Payment Modal */}
      {showAddPayment && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowAddPayment(false)}>
          <Card
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 500 }}
          >
            <h3 style={{ marginBottom: 8 }}>Add Payment</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
              {selectedPayment.description} - {selectedPayment.member?.name}
            </p>

            <div
              style={{
                marginBottom: 16,
                padding: 12,
                background: "var(--bg-secondary)",
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span>Amount Due:</span>
                <strong>₦{selectedPayment.amountDue?.toLocaleString()}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span>Already Paid:</span>
                <span style={{ color: "var(--accent)" }}>
                  ₦{selectedPayment.amountPaid?.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <span>
                  <strong>Outstanding:</strong>
                </span>
                <strong style={{ color: "var(--danger)" }}>
                  ₦
                  {(
                    (selectedPayment.amountDue || 0) -
                    (selectedPayment.amountPaid || 0)
                  ).toLocaleString()}
                </strong>
              </div>
            </div>

            <form onSubmit={submitAddPayment}>
              <Input
                label="Payment Amount (₦) *"
                type="number"
                min="0.01"
                step="0.01"
                max={selectedPayment.amountDue - selectedPayment.amountPaid}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                required
                style={{ marginBottom: 12 }}
              />

              <Input
                label="Description (optional)"
                type="text"
                value={paymentDesc}
                onChange={(e) => setPaymentDesc(e.target.value)}
                placeholder="e.g., Cash payment on March 15"
                style={{ marginBottom: 16 }}
              />

              <div
                style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddPayment(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={saving} icon={<MdPayment />}>
                  Add Payment
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Table */}
      <Card padding={false}>
        {payments.length === 0 ? (
          <EmptyState
            icon={<MdAccountBalance />}
            title="No payment records yet"
            description="Create your first financial record."
          />
        ) : (
          <PaymentsTable
            payments={payments}
            statusColor={statusColor}
            showMember
            onAddPayment={openAddPayment}
            isManager={isManager}
          />
        )}
      </Card>
    </div>
  );
}

function PaymentsTable({
  payments,
  statusColor,
  showMember,
  onAddPayment,
  isManager,
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="members-table">
        <thead>
          <tr>
            {showMember && <th>Member</th>}
            <th>Description</th>
            <th>Type</th>
            <th>Amount Due</th>
            <th>Paid</th>
            <th>Status</th>
            <th>Due Date</th>
            {isManager && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => {
            const outstanding = (p.amountDue || 0) - (p.amountPaid || 0);
            const canAddPayment = p.status !== "paid" && outstanding > 0;

            return (
              <tr key={p._id}>
                {showMember && (
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>
                      {p.member?.name || "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {p.member?.email}
                    </div>
                  </td>
                )}
                <td style={{ fontSize: 14 }}>{p.description}</td>
                <td>
                  <Badge color="default">{p.type}</Badge>
                </td>
                <td style={{ fontWeight: 600 }}>
                  ₦{p.amountDue?.toLocaleString()}
                </td>
                <td style={{ color: "var(--accent)" }}>
                  ₦{p.amountPaid?.toLocaleString()}
                </td>
                <td>
                  <Badge color={statusColor(p.status)}>{p.status}</Badge>
                </td>
                <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  {p.dueDate ? format(new Date(p.dueDate), "MMM d, yyyy") : "—"}
                </td>
                {isManager && (
                  <td>
                    {canAddPayment && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddPayment(p)}
                        icon={<MdPayment />}
                      >
                        Add Payment
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
