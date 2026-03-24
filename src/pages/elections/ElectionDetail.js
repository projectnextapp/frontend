import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, Button, Card, Badge, PageLoader, ConfirmModal } from '../../components/ui/UI';
import { MdArrowBack, MdHowToVote, MdPerson, MdLock } from 'react-icons/md';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import './Elections.css';

export default function ElectionDetail() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const { isPresident, userType } = useAuth();
  const [election, setElection] = useState(null);
  const [results,  setResults]  = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [confirm,  setConfirm]  = useState(false);
  const [voting,   setVoting]   = useState(false);

  const load = () => {
    Promise.all([
      electionAPI.getAll().then(r => r.data.data.find(e => e._id === id)),
      electionAPI.getResults(id).catch(() => null)
    ]).then(([el, res]) => {
      setElection(el);
      if (res) setResults(res.data.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const castVote = async () => {
    if (!selected) return;
    setVoting(true);
    try {
      await electionAPI.vote(id, { candidateId: selected });
      toast.success('Vote cast successfully! ✅');
      setConfirm(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote');
    } finally { setVoting(false); }
  };

  const closeElection = async () => {
    try {
      await electionAPI.close(id);
      toast.success('Election closed');
      load();
    } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <PageLoader />;
  if (!election) return <p>Election not found</p>;

  const isClosed = election.status === 'closed' || isPast(new Date(election.deadline));
  const totalVotes = results?.totalVotes || 0;
  const maxVotes   = results?.results?.reduce((m, r) => Math.max(m, r.voteCount), 0) || 0;

  return (
    <div className="election-detail">
      <PageHeader
        title={election.title}
        subtitle={`Position: ${election.position}`}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" icon={<MdArrowBack />} onClick={() => navigate('/elections')}>Back</Button>
            {isPresident && !isClosed && (
              <Button variant="warning" onClick={closeElection}>Close Election</Button>
            )}
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
        <Badge color={isClosed ? 'gray' : 'green'}>{isClosed ? 'Closed' : 'Active'}</Badge>
        <Badge color="blue">{election.type === 'election' ? 'Election' : 'General Vote'}</Badge>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Deadline: {format(new Date(election.deadline), 'PPP')}
        </span>
      </div>

      {/* Voting section */}
      {!isClosed && userType === 'member' && (
        <Card style={{ marginBottom: 22 }}>
          <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <MdHowToVote style={{ color: 'var(--primary)' }} /> Cast Your Vote
          </h3>
          <div className="vote-grid">
            {election.candidates?.map(c => (
              <div
                key={c._id}
                className={`vote-candidate ${selected === c._id ? 'vote-candidate--selected' : ''}`}
                onClick={() => setSelected(c._id)}
              >
                <div className="vote-candidate__photo">
                  {c.photo ? <img src={c.photo} alt={c.name} /> : <MdPerson />}
                </div>
                <div className="vote-candidate__name">{c.name}</div>
              </div>
            ))}
          </div>
          <Button
            style={{ marginTop: 20 }}
            disabled={!selected}
            onClick={() => setConfirm(true)}
            icon={<MdHowToVote />}
          >
            Submit Vote
          </Button>
        </Card>
      )}

      {/* Results section */}
      {results ? (
        <Card>
          <h3 style={{ marginBottom: 4 }}>Results</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>
            Total votes cast: <strong>{totalVotes}</strong>
          </p>
          {results.results?.map((r, i) => {
            const pct = totalVotes > 0 ? Math.round((r.voteCount / totalVotes) * 100) : 0;
            const isWinner = r.voteCount === maxVotes && maxVotes > 0;
            return (
              <div key={i} className="results-bar-wrap">
                <div className="results-bar-label">
                  <span style={{ fontWeight: isWinner ? 700 : 400 }}>
                    {isWinner && '🏆 '}{r.name}
                  </span>
                  <span>{r.voteCount} vote{r.voteCount !== 1 ? 's' : ''} ({pct}%)</span>
                </div>
                <div className="results-bar">
                  <div
                    className={`results-bar__fill ${isWinner ? 'results-bar__fill--winner' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Card>
      ) : (
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-muted)', fontSize: 14 }}>
            <MdLock /> Results will be available after the election closes.
          </div>
        </Card>
      )}

      <ConfirmModal
        open={confirm}
        title="Confirm Your Vote"
        message={`You are voting for: ${election.candidates?.find(c => c._id === selected)?.name}. This action cannot be undone.`}
        onConfirm={castVote}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
