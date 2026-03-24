import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { dashboardAPI } from "../../services/api";
import {
  PageLoader,
  StatCard,
  Card,
  Badge,
  PageHeader,
} from "../../components/ui/UI";
import {
  MdPeople,
  MdHowToVote,
  MdAccountBalance,
  MdCampaign,
  MdPersonAdd,
  MdArrowForward,
} from "react-icons/md";
import { format } from "date-fns";
import "./Dashboard.css";

import AdvertBanner from "../../components/AdvertBanner";
import AdvertCard from "../../components/AdvertCard";

function statusBadge(status) {
  const map = {
    active: "green",
    pending: "yellow",
    inactive: "gray",
    closed: "gray",
    upcoming: "blue",
  };
  return <Badge color={map[status] || "default"}>{status}</Badge>;
}

export default function Dashboard() {
  const { user, isAdmin, isTreasurer } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    dashboardAPI
      .get()
      .then((res) => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadData();

    // Listen for real-time updates
    const handleRefresh = () => loadData();
    window.addEventListener("refresh:dashboard", handleRefresh);

    return () => {
      window.removeEventListener("refresh:dashboard", handleRefresh);
    };
  }, [loadData]);

  if (loading) return <PageLoader />;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="dashboard">
      <PageHeader
        title={`${greeting()}, ${user?.name?.split(" ")[0]} 👋`}
        subtitle="Here's what's happening in your association today"
        actions={
          isAdmin && (
            <Link to="/members/add">
              <button className="btn btn--primary btn--md">
                <MdPersonAdd /> Add Member
              </button>
            </Link>
          )
        }
      />

      {/* Header Advert */}
      <AdvertBanner position="header" />

      {/* Stats grid */}
      <div className="dashboard__stats">
        <StatCard
          label="Total Members"
          value={data?.members?.total ?? 0}
          icon={<MdPeople />}
          color="blue"
          sub={`${data?.members?.active ?? 0} active`}
        />
        <StatCard
          label="Pending Approvals"
          value={data?.members?.pending ?? 0}
          icon={<MdPersonAdd />}
          color="yellow"
          sub="Awaiting review"
        />
        <StatCard
          label="Active Elections"
          value={data?.elections?.ongoing?.length ?? 0}
          icon={<MdHowToVote />}
          color="purple"
          sub={`${data?.elections?.upcoming?.length ?? 0} upcoming`}
        />
        {(isAdmin || isTreasurer) && (
          <>
            <StatCard
              label="Outstanding Dues"
              value={`₦${data?.financialSummary?.outstanding?.toLocaleString() ?? 0}`}
              icon={<MdAccountBalance />}
              color="red"
              sub={`₦${data?.financialSummary?.totalPaid?.toLocaleString() ?? 0} collected`}
            />
            <StatCard
              label="Current Balance"
              value={`₦${data?.financialSummary?.currentBalance?.toLocaleString() ?? 0}`}
              icon={<MdAccountBalance />}
              color={
                data?.financialSummary?.currentBalance >= 0 ? "green" : "red"
              }
              sub={`₦${data?.financialSummary?.totalExpenses?.toLocaleString() ?? 0} spent`}
            />
          </>
        )}
      </div>

      <div className="dashboard__grid">
        <AdvertCard />
        {/* Active Elections */}
        <Card className="dashboard__section">
          <div className="section-header">
            <h3 className="section-title">
              <MdHowToVote /> Active Elections
            </h3>
            <Link to="/elections" className="section-link">
              View all <MdArrowForward />
            </Link>
          </div>
          {data?.elections?.ongoing?.length === 0 ? (
            <p className="dashboard__empty">No ongoing elections right now.</p>
          ) : (
            <div className="election-list">
              {data?.elections?.ongoing?.map((el) => (
                <Link
                  key={el._id}
                  to={`/elections/${el._id}`}
                  className="election-item"
                >
                  <div>
                    <div className="election-item__title">{el.title}</div>
                    <div className="election-item__sub">
                      Position: {el.position}
                    </div>
                  </div>
                  <div className="election-item__right">
                    {statusBadge("active")}
                    <span className="election-item__deadline">
                      Ends {format(new Date(el.deadline), "MMM d")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Notices */}
        <Card className="dashboard__section">
          <div className="section-header">
            <h3 className="section-title">
              <MdCampaign /> Recent Notices
            </h3>
            <Link to="/notices" className="section-link">
              View all <MdArrowForward />
            </Link>
          </div>
          {data?.recentNotices?.length === 0 ? (
            <p className="dashboard__empty">No notices posted yet.</p>
          ) : (
            <div className="notice-list">
              {data?.recentNotices?.map((notice) => (
                <div key={notice._id} className="notice-item">
                  <Badge
                    color={notice.type === "meeting_minutes" ? "blue" : "gray"}
                  >
                    {notice.type === "meeting_minutes" ? "Minutes" : "Notice"}
                  </Badge>
                  <div className="notice-item__title">{notice.title}</div>
                  <div className="notice-item__date">
                    {format(new Date(notice.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Footer Advert */}
      <AdvertBanner position="footer" />

      {/* Notifications badge */}
      {data?.unreadNotifications > 0 && (
        <Link to="/notifications">
          <div className="dashboard__notif-banner">
            <span>
              🔔 You have <strong>{data.unreadNotifications}</strong> unread
              notification{data.unreadNotifications !== 1 ? "s" : ""}
            </span>
            <MdArrowForward />
          </div>
        </Link>
      )}
    </div>
  );
}
