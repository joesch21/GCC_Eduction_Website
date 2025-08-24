import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WalletButton from './components/WalletButton';
import NetworkGuard from './components/NetworkGuard';
import MarkdownRenderer from './components/MarkdownRenderer';
import QuizEngine from './components/QuizEngine';
import AdminPublisher from './components/AdminPublisher';
import ProgressBar from './components/ProgressBar';
import CohortBadge from './components/CohortBadge';
import RewardSummary from './components/RewardSummary';

function Placeholder({ text }) {
  return <div>{text}</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <NetworkGuard>
        <WalletButton />
        <Routes>
          <Route path="/" element={<Placeholder text="home" />} />
          <Route path="/profile" element={<Placeholder text="profile" />} />
          <Route path="/learn" element={<Placeholder text="learn" />} />
          <Route path="/learn/:deptId" element={<MarkdownRenderer />} />
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