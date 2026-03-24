import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { memberAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  PageHeader,
  Button,
  Card,
  Badge,
  Avatar,
  PageLoader,
  Modal,
  Input,
  Textarea,
} from "../../components/ui/UI";
import { MdArrowBack, MdEdit, MdCake } from "react-icons/md";
import toast from "react-hot-toast";
import "./Members.css";

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // NEW: Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // NEW: Separate load function with useCallback (FIXED)
  const loadMember = useCallback(() => {
    setLoading(true);
    memberAPI
      .getOne(id)
      .then((res) => {
        setMember(res.data.data);
        // Pre-populate edit form
        const m = res.data.data;
        setEditForm({
          name: m.name || "",
          email: m.email || "",
          phone: m.phone || "",
          dateOfBirth: m.dateOfBirth?.split("T")[0] || "",
          career: m.career || "",
          role: m.role || "member",
          status: m.status || "active",
          maritalStatus: m.privateInfo?.maritalStatus || "",
          occupation: m.privateInfo?.occupation || "",
          stateOfOrigin: m.privateInfo?.stateOfOrigin || "",
          localGovernment: m.privateInfo?.localGovernment || "",
          countryOfResidence: m.privateInfo?.countryOfResidence || "",
          residentialAddress: m.privateInfo?.residentialAddress || "",
          nextOfKinName: m.privateInfo?.nextOfKin?.name || "",
          nextOfKinPhone: m.privateInfo?.nextOfKin?.phone || "",
          nextOfKinRelationship: m.privateInfo?.nextOfKin?.relationship || "",
        });
      })
      .catch(() => {
        toast.error("Member not found");
        navigate("/members");
      })
      .finally(() => setLoading(false));
  }, [id, navigate]); // FIXED: Added dependencies

  useEffect(() => {
    loadMember();
  }, [loadMember]); // FIXED: Now includes loadMember

  // NEW: Handle form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // NEW: Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        dateOfBirth: editForm.dateOfBirth,
        career: editForm.career,
        role: editForm.role,
        status: editForm.status,
        maritalStatus: editForm.maritalStatus,
        occupation: editForm.occupation,
        stateOfOrigin: editForm.stateOfOrigin,
        localGovernment: editForm.localGovernment,
        countryOfResidence: editForm.countryOfResidence,
        residentialAddress: editForm.residentialAddress,
        nextOfKin: JSON.stringify({
          name: editForm.nextOfKinName,
          phone: editForm.nextOfKinPhone,
          relationship: editForm.nextOfKinRelationship,
        }),
      };

      await memberAPI.update(id, updates);
      toast.success("Member updated successfully! ✅");
      setShowEditModal(false);
      loadMember(); // Refresh data
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update member");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!member) return null;

  const field = (label, value) => (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{value || "—"}</span>
    </div>
  );

  return (
    <div className="member-detail">
      <PageHeader
        title="Member Profile"
        actions={
          <>
            {/* NEW: Edit Button (Admin Only) */}
            {isAdmin && (
              <Button
                variant="outline"
                icon={<MdEdit />}
                onClick={() => setShowEditModal(true)}
                style={{ marginRight: 10 }}
              >
                Edit Member
              </Button>
            )}
            <Button
              variant="ghost"
              icon={<MdArrowBack />}
              onClick={() => navigate("/members")}
            >
              Back
            </Button>
          </>
        }
      />

      {/* Header card */}
      <Card style={{ marginBottom: 20 }}>
        <div className="member-detail__header">
          <Avatar src={member.profilePhoto} name={member.name} size="xl" />
          <div className="member-detail__info">
            <h2 className="member-detail__name">{member.name}</h2>
            <div className="member-detail__meta">
              <Badge
                color={
                  {
                    admin: "purple",
                    president: "blue",
                    secretary: "blue",
                    treasurer: "green",
                    member: "default",
                  }[member.role] || "default"
                }
              >
                {member.role}
              </Badge>
              <Badge
                color={
                  { active: "green", pending: "yellow", inactive: "gray" }[
                    member.status
                  ]
                }
              >
                {member.status}
              </Badge>
              <Badge
                color={
                  member.paymentStatus === "paid"
                    ? "green"
                    : member.paymentStatus === "partial"
                      ? "yellow"
                      : "red"
                }
              >
                {member.paymentStatus} dues
              </Badge>
            </div>
            <p
              style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}
            >
              Member since {new Date(member.joinDate).toLocaleDateString()}
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              icon={<MdCake />}
              onClick={() => {
                memberAPI
                  .birthdayWish(member._id, {})
                  .then(() => toast.success("Birthday wish sent! 🎂"))
                  .catch(() => toast.error("Failed"));
              }}
            >
              Birthday Wish
            </Button>
          )}
        </div>
      </Card>

      <div className="member-detail__grid">
        {/* Contact */}
        <Card>
          <h4 className="detail-card__title">Contact Information</h4>

          {isAdmin && (
            <div
              className="detail-row"
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (member?._id) {
                  navigator.clipboard.writeText(member._id);
                  toast.success("Member ID copied!");
                } else {
                  toast.error("ID not found");
                }
              }}
            >
              <span className="detail-row__label">Member ID</span>
              <span className="detail-row__value">{member._id}</span>
            </div>
          )}

          {field("Email", member.email)}
          {field("Phone", member.phone)}
          {field("Career", member.career)}
          {field(
            "Date of Birth",
            member.dateOfBirth
              ? new Date(member.dateOfBirth).toLocaleDateString()
              : null,
          )}
        </Card>

        {/* Admin-only private info */}
        {isAdmin && member.privateInfo && (
          <Card>
            <h4 className="detail-card__title">🔒 Private Info (Admin Only)</h4>
            {field("Marital Status", member.privateInfo.maritalStatus)}
            {field("Occupation", member.privateInfo.occupation)}
            {field("State of Origin", member.privateInfo.stateOfOrigin)}
            {field("Local Government", member.privateInfo.localGovernment)}
            {field(
              "Country of Residence",
              member.privateInfo.countryOfResidence,
            )}
            {field(
              "Residential Address",
              member.privateInfo.residentialAddress,
            )}
            {member.privateInfo.nextOfKin && (
              <>
                {field("Next of Kin", member.privateInfo.nextOfKin.name)}
                {field("Next of Kin Phone", member.privateInfo.nextOfKin.phone)}
                {field(
                  "Relationship",
                  member.privateInfo.nextOfKin.relationship,
                )}
              </>
            )}
          </Card>
        )}
      </div>

      {/* NEW: Edit Modal */}
      {/* NEW: Edit Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Member Details"
        width="650px"
      >
        <form
          onSubmit={handleEditSubmit}
          style={{ maxHeight: "70vh", overflowY: "auto", padding: 20 }}
        >
          {/* Contact Information */}
          <fieldset
            style={{
              border: "1px solid var(--border)",
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <legend
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              Contact Information
            </legend>

            <Input
              label="Full Name *"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              required
            />
            <Input
              label="Email *"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditChange}
              required
            />
            <Input
              label="Phone"
              name="phone"
              value={editForm.phone}
              onChange={handleEditChange}
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={editForm.dateOfBirth}
              onChange={handleEditChange}
            />
            <Input
              label="Career"
              name="career"
              value={editForm.career}
              onChange={handleEditChange}
            />
          </fieldset>

          {/* Role & Status */}
          <fieldset
            style={{
              border: "1px solid var(--border)",
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <legend
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              Role & Status
            </legend>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Role *
              </label>
              <select
                name="role"
                value={editForm.role}
                onChange={handleEditChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                }}
                required
              >
                <option value="member">Member</option>
                <option value="treasurer">Treasurer</option>
                <option value="secretary">Secretary</option>
                <option value="president">President</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Status *
              </label>
              <select
                name="status"
                value={editForm.status}
                onChange={handleEditChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                }}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </fieldset>

          {/* Private Information */}
          <fieldset
            style={{
              border: "1px solid var(--border)",
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <legend
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              Private Information
            </legend>

            <div style={{ marginBottom: 15 }}>
              <label
                style={{
                  display: "block",
                  marginBottom: 5,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Marital Status
              </label>
              <select
                name="maritalStatus"
                value={editForm.maritalStatus}
                onChange={handleEditChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                }}
              >
                <option value="">Not specified</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            <Input
              label="Occupation"
              name="occupation"
              value={editForm.occupation}
              onChange={handleEditChange}
            />
            <Input
              label="State of Origin"
              name="stateOfOrigin"
              value={editForm.stateOfOrigin}
              onChange={handleEditChange}
            />
            <Input
              label="Local Government"
              name="localGovernment"
              value={editForm.localGovernment}
              onChange={handleEditChange}
            />
            <Input
              label="Country of Residence"
              name="countryOfResidence"
              value={editForm.countryOfResidence}
              onChange={handleEditChange}
            />
            <Textarea
              label="Residential Address"
              name="residentialAddress"
              value={editForm.residentialAddress}
              onChange={handleEditChange}
              rows={3}
            />
          </fieldset>

          {/* Next of Kin */}
          <fieldset
            style={{
              border: "1px solid var(--border)",
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <legend
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: "var(--text-primary)",
              }}
            >
              Next of Kin
            </legend>

            <Input
              label="Name"
              name="nextOfKinName"
              value={editForm.nextOfKinName}
              onChange={handleEditChange}
            />
            <Input
              label="Phone"
              name="nextOfKinPhone"
              value={editForm.nextOfKinPhone}
              onChange={handleEditChange}
            />
            <Input
              label="Relationship"
              name="nextOfKinRelationship"
              value={editForm.nextOfKinRelationship}
              onChange={handleEditChange}
              placeholder="e.g., Spouse, Parent, Sibling"
            />
          </fieldset>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Button type="submit" loading={saving} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
