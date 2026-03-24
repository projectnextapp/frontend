import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { electionAPI } from '../../services/api';
import { PageHeader, Button, Input, Select, Card } from '../../components/ui/UI';
import { MdArrowBack, MdAdd, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';
import './Elections.css';

const TYPE_OPTIONS = [
  { value: 'election',     label: '🗳️ Election (candidates)' },
  { value: 'general_vote', label: '📊 General Vote (yes/no or options)' },
];

export default function CreateElection() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', position: '', type: 'election',
    deadline: '', showResultsLive: false
  });
  const [candidates, setCandidates] = useState([]);
  const [newCand,    setNewCand]    = useState('');
  const [loading, setLoading]       = useState(false);

  const handle = e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
  };

  const addCandidate = () => {
    if (!newCand.trim()) return;
    setCandidates(c => [...c, { name: newCand.trim() }]);
    setNewCand('');
  };

  const removeCandidate = (i) => setCandidates(c => c.filter((_, idx) => idx !== i));

  const submit = async e => {
    e.preventDefault();
    if (form.type === 'election' && candidates.length < 2) {
      toast.error('Add at least 2 candidates'); return;
    }

    const payload = {
      ...form,
      candidates: JSON.stringify(candidates)
    };

    setLoading(true);
    try {
      await electionAPI.create(payload);
      toast.success('Election created!');
      navigate('/elections');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader
        title="Create Election"
        subtitle="Set up a new election or general vote"
        actions={
          <Button variant="ghost" icon={<MdArrowBack />} onClick={() => navigate('/elections')}>Back</Button>
        }
      />

      <Card>
        <form onSubmit={submit} className="create-election__form">
          <Select
            label="Type"
            name="type"
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={handle}
          />
          <Input
            label="Title *"
            name="title"
            placeholder="e.g. 2024 Presidential Election"
            value={form.title}
            onChange={handle}
            required
          />
          <Input
            label="Position / Subject *"
            name="position"
            placeholder="e.g. Association President"
            value={form.position}
            onChange={handle}
            required
          />
          <Input
            label="Voting Deadline *"
            name="deadline"
            type="datetime-local"
            value={form.deadline}
            onChange={handle}
            required
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <input
              type="checkbox"
              name="showResultsLive"
              checked={form.showResultsLive}
              onChange={handle}
            />
            Show results live (members see results during voting)
          </label>

          {/* Candidates */}
          {form.type === 'election' && (
            <div>
              <div className="add-member__section-title" style={{ marginBottom: 12 }}>
                Candidates ({candidates.length})
              </div>
              {candidates.map((c, i) => (
                <div key={i} className="candidate-row" style={{ marginBottom: 8 }}>
                  <span className="candidate-row__name">{c.name}</span>
                  <Button variant="ghost" size="sm" icon={<MdDelete />} onClick={() => removeCandidate(i)} type="button">
                    Remove
                  </Button>
                </div>
              ))}
              <div className="add-candidate">
                <input
                  className="field__input"
                  placeholder="Candidate name..."
                  value={newCand}
                  onChange={e => setNewCand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCandidate())}
                  style={{ flex: 1 }}
                />
                <Button type="button" variant="outline" icon={<MdAdd />} onClick={addCandidate}>Add</Button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Button type="submit" loading={loading}>Create Election</Button>
            <Button type="button" variant="ghost" onClick={() => navigate('/elections')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
