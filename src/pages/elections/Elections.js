import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { electionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Button, Card, Badge, EmptyState, PageLoader } from '../../components/ui/UI';
import { MdHowToVote, MdAdd, MdLock } from 'react-icons/md';
import { format, isPast } from 'date-fns';
import './Elections.css';

export default function Elections() {
  const { isPresident } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    electionAPI.getAll()
      .then(res => setElections(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const active   = elections.filter(e => e.status === 'active' && !isPast(new Date(e.deadline)));
  const upcoming = elections.filter(e => e.status === 'upcoming');
  const closed   = elections.filter(e => e.status === 'closed' || isPast(new Date(e.deadline)));

  const ElCard = ({ el }) => {
    const isClosed = el.status === 'closed' || isPast(new Date(el.deadline));
    return (
      <Link to={`/elections/${el._id}`} className="el-card">
        <div className="el-card__top">
          <Badge color={isClosed ? 'gray' : el.status === 'active' ? 'green' : 'blue'}>
            {isClosed ? 'Closed' : el.status}
          </Badge>
          <span className="el-card__type">
            {el.type === 'election' ? '🗳️ Election' : '📊 General Vote'}
          </span>
        </div>
        <h3 className="el-card__title">{el.title}</h3>
        <p className="el-card__position">Position: <strong>{el.position}</strong></p>
        <div className="el-card__footer">
          <span className="el-card__candidates">{el.candidates?.length || 0} candidate{el.candidates?.length !== 1 ? 's' : ''}</span>
          <span className="el-card__deadline">
            {isClosed ? <><MdLock /> Closed</> : <>Ends {format(new Date(el.deadline), 'MMM d, yyyy')}</>}
          </span>
        </div>
      </Link>
    );
  };

  const Section = ({ title, items }) =>
    items.length === 0 ? null : (
      <div className="elections__section">
        <h3 className="elections__section-title">{title}</h3>
        <div className="elections__grid">
          {items.map(el => <ElCard key={el._id} el={el} />)}
        </div>
      </div>
    );

  return (
    <div>
      <PageHeader
        title="Elections & Votes"
        subtitle="Manage elections and general votes for your association"
        actions={
          isPresident && (
            <Link to="/elections/create">
              <Button icon={<MdAdd />}>Create Election</Button>
            </Link>
          )
        }
      />

      {elections.length === 0 ? (
        <Card>
          <EmptyState
            icon={<MdHowToVote />}
            title="No elections yet"
            description="Create your first election or general vote"
            action={isPresident && <Link to="/elections/create"><Button>Create Election</Button></Link>}
          />
        </Card>
      ) : (
        <>
          <Section title="🔴 Active" items={active} />
          <Section title="🔵 Upcoming" items={upcoming} />
          <Section title="✅ Closed" items={closed} />
        </>
      )}
    </div>
  );
}
