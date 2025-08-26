import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import WalletButton from './components/WalletButton';
import NetworkGuard from './components/NetworkGuard';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizEngine from './components/QuizEngine';
import AdminPublisher from './components/AdminPublisher';
import ProgressBar from './components/ProgressBar';
import CohortBadge from './components/CohortBadge';
import RewardSummary from './components/RewardSummary';

function Placeholder({ text }) { return <div style={{ padding: 16 }}>{text}</div>; }

const DEPTS = ['department1','department2','department3','department4'];
const LESSONS = ['1','2','3'];

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

function DeptLessonPage() {
  const { deptId, lessonId } = useParams();
  const navigate = useNavigate();
  if (!DEPTS.includes(deptId || '')) return <Placeholder text="Unknown department" />;
  if (!LESSONS.includes(lessonId || '')) {
    // default to lesson 1 if missing/bad
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
  return (
    <BrowserRouter>
      <NetworkGuard>
        <div style={{ padding: 12 }}>
          <WalletButton />
        </div>
        <Routes>
          <Route path="/" element={<Placeholder text="home" />} />
          <Route path="/profile" element={<Placeholder text="profile" />} />
          <Route path="/learn" element={<Placeholder text="Pick a department: /learn/department1/1" />} />
          <Route path="/learn/:deptId/:lessonId" element={<DeptLessonPage />} />
          <Route path="/quiz/:deptId" element={<QuizEngine />} />
          <Route path="/dashboard" element={<RewardSummary />} />
          <Route path="/admin" element={<AdminPublisher />} />
          <Route path="/community" element={<Placeholder text="community" />} />
          <Route path="/blog" element={<Placeholder text="blog" />} />
          <Route path="/legal/*" element={<Placeholder text="legal" />} />
        </Routes>
      </NetworkGuard>
    </BrowserRouter>
  );
}

