import { useState } from 'react';

export default function QuizEngine() {
  const [mode, setMode] = useState('A');

  return (
    <div>
      <p>Quiz Engine (Mode {mode})</p>
      {/* TODO: commit-reveal and attest logic */}
    </div>
  );
}