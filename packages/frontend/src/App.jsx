import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WalletButton from './components/WalletButton';
import NetworkGuard from './components/NetworkGuard';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizEngine from './components/QuizEngine';
import RewardSummary from './components/RewardSummary';
import CohortBadge from './components/CohortBadge';
import { gatingFor } from './lib/gating';
import AdminPanel from './pages/AdminPanel';

function Placeholder({ text }) { return <div style={{ padding: 16 }}>{text}</div>; }

const DEPTS = ['department1','department2','department3','department4'];
const LESSONS = ['1','2','3'];

function DeptHub({ address }) {
  const [gating, setGating] = useState({ unlocked: { department1: true }, completed: {} });

  useEffect(() => {
    let live = true;
    (async () => {
      const g = await gatingFor(address);
      if (live) setGating(g);
    })();
    return () => { live = false; };
  }, [address]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Learn Hub</h2>
      <div style={{ margin: '12px 0' }}>
        <CohortBadge address={address} cohortId={1} cap={100} />
      </div>
      <ul>
        {DEPTS.map(d => {
          const unlocked = gating.unlocked[d];
          const done = gating.completed[d];
          const status = done ? 'completed' : unlocked ? 'unlocked' : 'locked';
          return (
            <li key={d} style={{ margin: '8px 0' }}>
              <Link to={unlocked ? `/learn/${d}/1` : '#'} style={{ color: unlocked ? '#ffd166' : '#888' }}>
                {d}
              </Link>
              <span style={{ marginLeft: 8, fontSize: 12 }}>{status}</span>
              {unlocked && <span style={{ marginLeft: 8 }}><Link to={`/quiz/${d}`}>Quiz</Link></span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DeptNav({ deptId, active }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
      {LESSONS.map(id => {
        const to = `/learn/${deptId}/${id}`;
        const isActive = active === id;
        return (
          <Link key={id} to={to} style={{
            padding: '4px 10px',
            borderRadius: 6,
            textDecoration: 'none',
            background: isActive ? '#ffd166' : '#333',
            color: isActive ? '#111' : '#fff'
          }}>
            Lesson {id}
          </Link>
        );
      })}
      <Link to={`/quiz/${deptId}`} style={{ marginLeft: 'auto', color: '#ffd166' }}>Take Quiz →</Link>
    </div>
  );
}

function DeptLessonPage({ address }) {
  const { deptId, lessonId } = useParams();
  const navigate = useNavigate();
  const [gating, setGating] = useState({ unlocked: { department1: true }, completed: {} });

  useEffect(() => {
    let live = true;
    (async () => {
      const g = await gatingFor(address);
      if (live) setGating(g);
    })();
    return () => { live = false; };
  }, [address]);

  if (!DEPTS.includes(deptId || '')) return <Placeholder text="Unknown department" />;

  if (!gating.unlocked[deptId]) return <Placeholder text="This department is locked. Pass the previous quiz to unlock." />;

  if (!LESSONS.includes(lessonId || '')) {
    navigate(`/learn/${deptId}/1`, { replace: true });
    return null;
  }
  const uri = `/content/${deptId}/lesson${lessonId}.md`;
  return (
    <div>
      <DeptNav deptId={deptId} active={lessonId} />
      <div style={{ padding: 16 }}>
        <MarkdownRenderer uri={uri} title={`${deptId} • Lesson ${lessonId}`} />
      </div>
    </div>
  );
}

export default function App() {
  const [addr, setAddr] = useState();

  return (
    <BrowserRouter>
      <NetworkGuard>
        <div style={{ padding: 12 }}>
          <WalletButton onAddressChange={setAddr} />
        </div>
        <Routes>
          <Route path="/" element={<Placeholder text="home" />} />
          <Route path="/profile" element={<Placeholder text="profile" />} />
          <Route path="/learn" element={<DeptHub address={addr} />} />
          <Route path="/learn/:deptId/:lessonId" element={<DeptLessonPage address={addr} />} />
          <Route path="/quiz/:deptId" element={<QuizEngine />} />
            <Route path="/dashboard" element={<RewardSummary address={addr} />} />
            <Route path="/admin" element={<AdminPanel address={addr} />} />
          <Route path="/community" element={<Placeholder text="community" />} />
          <Route path="/blog" element={<Placeholder text="blog" />} />
          <Route path="/legal/*" element={<Placeholder text="legal" />} />
        </Routes>
      </NetworkGuard>
    </BrowserRouter>
  );
}
