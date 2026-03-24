import React, { useEffect, useState } from "react";
import { notificationAPI } from "../../services/api";
import {
  PageHeader,
  Button,
  Card,
  PageLoader,
  EmptyState,
} from "../../components/ui/UI";
import { MdNotifications, MdDoneAll } from "react-icons/md";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import "./Notifications.css";

const typeIcon = (t) =>
  ({
    payment_reminder: "💰",
    election_announced: "🗳️",
    election_result: "🏆",
    birthday_wish: "🎂",
    meeting_notice: "📋",
    member_approved: "✅",
    member_deactivated: "⛔",
    general: "📢",
  })[t] || "🔔";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationAPI
      .getAll()
      .then((res) => setNotifications(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    await notificationAPI.markRead(id).catch(() => {});
    setNotifications((ns) =>
      ns.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    toast.success("All marked as read");
    setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
  };

  if (loading) return <PageLoader />;

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread notification${unread !== 1 ? "s" : ""}`}
        actions={
          unread > 0 && (
            <Button variant="ghost" icon={<MdDoneAll />} onClick={markAllRead}>
              Mark All Read
            </Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MdNotifications />}
            title="No notifications"
            description="You're all caught up!"
          />
        </Card>
      ) : (
        <Card padding={false}>
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item ${!n.isRead ? "notif-item--unread" : ""}`}
                onClick={() => !n.isRead && markRead(n._id)}
              >
                <div className="notif-item__icon">{typeIcon(n.type)}</div>
                <div className="notif-item__body">
                  <div className="notif-item__title">{n.title}</div>
                  <div className="notif-item__msg">{n.message}</div>
                  <div className="notif-item__time">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                {!n.isRead && <div className="notif-item__dot" />}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
