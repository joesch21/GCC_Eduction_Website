import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import WalletButton from './components/WalletButton';
import NetworkGuard from './components/NetworkGuard';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizEngine from './components/QuizEngine';
import AdminPublisher from './components/AdminPublisher';
import RewardSummary from './components/RewardSummary';
import ChainStatus from './components/ChainStatus';
import Layout from './components/Layout';
import Toast from './components/Toast';
import Hero from './components/Hero';
import { hasPassed } from './utils/storage';

function Placeholder({ text }) { return <div style={{ padding: 16 }}>{text}</div>; }

const DEPTS = ['department1','department2','department3','department4'];
const LESSONS = ['1','2','3'];

function DeptNav({ deptId, active }) {
  const idx = DEPTS.indexOf(deptId);
  const locked = idx > 0 && !hasPassed(DEPTS[idx - 1]);
  return (
    <div style={{ display: 'flex', gap: 8, padding: '8px 16px' }}>
      {LESSONS.map(id => {
        const to = `/learn/${deptId}/${id}`;
        const isActive = active === id;
        return (
          <Link key={id} to={to} style={{
            padding: '4px 10px',
            borderRadius: 6,
            textDecoration: locked ? 'line-through' : 'none',
            pointerEvents: locked ? 'none' : 'auto',
            background: isActive ? '#ffd166' : '#333',
            color: isActive ? '#111' : '#fff',
            opacity: locked ? 0.5 : 1
          }}>
            Lesson {id}
          </Link>
        );
      })}
      <Link
        to={`/quiz/${deptId}`}
        style={{
          marginLeft: 'auto',
          color: '#ffd166',
          textDecoration: locked ? 'line-through' : 'none',
          pointerEvents: locked ? 'none' : 'auto',
          opacity: locked ? 0.5 : 1
        }}
      >
        {locked ? 'Locked (pass previous dept)' : 'Take Quiz →'}
      </Link>
    </div>
  );
}

function DeptLessonPage() {
  const { deptId, lessonId } = useParams();
  const navigate = useNavigate();
  if (!DEPTS.includes(deptId || '')) return <Placeholder text="Unknown department" />;
  if (!LESSONS.includes(lessonId || '')) {
    navigate(`/learn/${deptId}/1`, { replace: true });
    return null;
  }
  const idx = DEPTS.indexOf(deptId);
  const locked = idx > 0 && !hasPassed(DEPTS[idx - 1]);
  const uri = `/content/${deptId}/lesson${lessonId}.md`;
  return (
    <div>
      {locked && (
        <Toast message="Locked. Pass the previous department’s quiz to unlock." type="warn" />
      )}
      <DeptNav deptId={deptId} active={lessonId} />
      <div style={{ padding: 16 }}>
        {locked ? (
          <em>Locked. Pass the previous department’s quiz to unlock.</em>
        ) : (
          <MarkdownRenderer uri={uri} title={`${deptId} • Lesson ${lessonId}`} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <NetworkGuard>
        <Layout headerRight={<><WalletButton /><ChainStatus /></>}>
          <Routes>
            <Route path="/" element={<Hero />} />
            <Route path="/profile" element={<Placeholder text="profile" />} />
            <Route path="/learn" element={<Placeholder text="Pick a department: /learn/department1/1" />} />
            <Route path="/learn/:deptId/:lessonId" element={<DeptLessonPage />} />
            <Route path="/quiz/:deptId" element={<QuizEngine passPct={70} timeLimitSec={480} />} />
            <Route path="/dashboard" element={<RewardSummary />} />
            <Route path="/admin" element={<AdminPublisher />} />
            <Route path="/community" element={<Placeholder text="community" />} />
            <Route path="/blog" element={<Placeholder text="blog" />} />
            <Route path="/legal/*" element={<Placeholder text="legal" />} />
          </Routes>
        </Layout>
      </NetworkGuard>
    </BrowserRouter>
  );
}
