import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import {
  PageHeader,
  Card,
  Button,
  Input,
  Avatar,
  Badge,
} from "../../components/ui/UI";
import { MdLock } from "react-icons/md";
import toast from "react-hot-toast";
import "./Profile.css";

export default function Profile() {
  const { user, userType } = useAuth();
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [saving, setSaving] = useState(false);

  const handlePw = (e) =>
    setPwForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const field = (label, value) =>
    value ? (
      <div className="detail-row">
        <span className="detail-row__label">{label}</span>
        <span className="detail-row__value">{value}</span>
      </div>
    ) : null;

  return (
    <div className="profile">
      <PageHeader title="My Profile" subtitle="Your account information" />

      <div className="profile__grid">
        {/* Info card */}
        <Card>
          <div className="profile__header">
            <Avatar
              src={user?.profilePhoto || user?.logo}
              name={user?.name}
              size="xl"
            />
            <div>
              <h2 className="profile__name">{user?.name}</h2>
              <p className="profile__email">
                {user?.contactEmail || user?.email}
              </p>
              {userType === "member" && (
                <Badge
                  color={
                    {
                      admin: "purple",
                      president: "blue",
                      secretary: "blue",
                      treasurer: "green",
                      member: "default",
                    }[user?.role] || "default"
                  }
                >
                  {user?.role}
                </Badge>
              )}
              {userType === "group" && (
                <Badge color="purple">Group Admin</Badge>
              )}
            </div>
          </div>

          <div className="detail-card__title" style={{ marginTop: 20 }}>
            Account Details
          </div>
          {(userType === "group" || userType === "member") && (
            <>
              {field(
                userType === "group" ? "Group ID" : "Member ID",
                (user?._id || user?.id)?.slice(0, 10) + "...",
              )}

              <Button
                variant="ghost"
                onClick={() => {
                  const id = user?._id || user?.id;

                  if (id) {
                    navigator.clipboard.writeText(id);
                    toast.success(
                      userType === "group"
                        ? "Group ID copied to clipboard!"
                        : "Member ID copied to clipboard!",
                    );
                  } else {
                    toast.error("ID not found");
                  }
                }}
                style={{ marginTop: 10, marginBottom: 10 }}
              >
                📋 Copy {userType === "group" ? "Group" : "Member"} ID
              </Button>
            </>
          )}
          {field("Email", user?.contactEmail || user?.email)}
          {field("Phone", user?.phone)}
          {field("Career", user?.career)}
          {field("Status", user?.status)}
          {field(
            "Member since",
            user?.joinDate
              ? new Date(user.joinDate).toLocaleDateString()
              : null,
          )}
          {field("Location", user?.location)}
          {field("Membership size", user?.memberSizeRange)}
        </Card>

        {/* Change password */}
        <Card>
          <h3
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <MdLock style={{ color: "var(--primary)" }} /> Change Password
          </h3>
          <form
            onSubmit={changePassword}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={pwForm.currentPassword}
              onChange={handlePw}
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              placeholder="Min 6 characters"
              value={pwForm.newPassword}
              onChange={handlePw}
              required
            />
            <Input
              label="Confirm New Password"
              name="confirm"
              type="password"
              value={pwForm.confirm}
              onChange={handlePw}
              required
            />
            <Button type="submit" loading={saving}>
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
