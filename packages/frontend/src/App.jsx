import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { gatingFor } from './lib/gating';
import { probeSubgraph } from './lib/net';
import WalletButton from './components/WalletButton';
import NetworkGuard from './components/NetworkGuard';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizEngine from './components/QuizEngine';
import AdminPanel from './pages/AdminPanel';
import RewardSummary from './components/RewardSummary';
import DebugPage from './pages/Debug';

const DEPTS = ['department1','department2','department3','department4'];
const LESSONS = ['1','2','3'];

function PendingBanner({ show, text }) {
  if (!show) return null;
  return (
    <div style={{ background:'#444', color:'#ffd166', padding:'8px 12px' }}>
      {text || 'Updating progress… this may take a moment while the indexer catches up.'}
      <button style={{ marginLeft: 12 }} onClick={()=>location.reload()}>Refresh</button>
    </div>
  );
}

export default function App() {
  const [addr, setAddr] = useState();
  const [gating, setGating] = useState({ unlocked: { department1: true }, completed: {} });
  const [pending, setPending] = useState(false);

  // Whenever address changes, refresh authoritative gating
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const g = await gatingFor(addr);
        if (live) setGating(g);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { live = false; };
  }, [addr]);

  // Simple subgraph probe to surface latency on /debug (optional)
  useEffect(() => { probeSubgraph(); }, []);

  function DeptNav({ deptId, active }) {
    return (
      <div style={{ display:'flex', gap:8, padding:'8px 16px' }}>
        {LESSONS.map(id => (
          <Link key={id}
            to={`/learn/${deptId}/${id}`}
            style={{
              padding:'4px 10px',
              borderRadius:6,
              textDecoration:'none',
              background: active === id ? '#ffd166' : '#333',
              color: active === id ? '#111' : '#fff'
            }}>
            Lesson {id}
          </Link>
        ))}
        <Link to={`/quiz/${deptId}`} style={{ marginLeft:'auto', color:'#ffd166' }}>Take Quiz →</Link>
      </div>
    );
  }

  function DeptLessonPage() {
    const { deptId, lessonId } = useParams();
    const navigate = useNavigate();
    if (!DEPTS.includes(deptId || '')) return <div style={{ padding:16 }}>Unknown department</div>;

    // authoritative guard
    if (!gating.unlocked[deptId]) {
      return <div style={{ padding:16 }}>🔒 Locked — complete the previous department to unlock.</div>;
    }

    if (!LESSONS.includes(lessonId || '')) {
      navigate(`/learn/${deptId}/1`, { replace: true });
      return null;
    }
    const uri = `/content/${deptId}/lesson${lessonId}.md`;
    return (
      <div>
        <PendingBanner show={pending} />
        <DeptNav deptId={deptId} active={lessonId} />
        <div style={{ padding: 16 }}>
          <MarkdownRenderer uri={uri} title={`${deptId} • Lesson ${lessonId}`} />
        </div>
      </div>
    );
  }

  function LearnHub() {
    return (
      <div style={{ padding:16 }}>
        <h2>Learn Hub</h2>
        <ul>
          {DEPTS.map(d => {
            const unlocked = !!gating.unlocked[d];
            const done = !!gating.completed[d];
            return (
              <li key={d} style={{ margin:'8px 0' }}>
                <Link to={unlocked ? `/learn/${d}/1` : '#'} style={{ color: unlocked ? '#ffd166' : '#888' }}>
                  {d} {done ? '✅' : unlocked ? '' : '🔒'}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <NetworkGuard>
        <div style={{ padding:12 }}>
          <WalletButton onAddressChange={setAddr} />
          <Link to="/debug" style={{ float:'right', color:'#aaa' }}>debug</Link>
        </div>
        <Routes>
          <Route path="/" element={<LearnHub />} />
          <Route path="/learn" element={<LearnHub />} />
          <Route path="/learn/:deptId/:lessonId" element={<DeptLessonPage />} />
          <Route path="/quiz/:deptId" element={<QuizEngine onSubmitted={() => setPending(true)} />} />
          <Route path="/admin" element={<AdminPanel address={addr} />} />
          <Route path="/dashboard" element={<RewardSummary address={addr} />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      </NetworkGuard>
    </BrowserRouter>
  );
}
