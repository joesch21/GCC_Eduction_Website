import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Expected seed format (simple):
 * [
 *   {"q": "Question 1?", "a": "Answer"},
 *   ...
 * ]
 * Later we can support multi-choice { choices: [...], correct: [...] }.
 */
export default function QuizEngine() {
  const { deptId } = useParams();
  const [status, setStatus] = useState('loading'); // loading | ready | done | error
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);

  const uri = deptId ? `/content/${deptId}/questions.json` : null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (!uri) return;
        const res = await fetch(uri);
        if (!res.ok) throw new Error(`Cannot load ${uri}`);
        const json = await res.json();
        if (!cancelled) {
          // light randomization
          setItems(shuffle(json).slice(0, Math.min(10, json.length)));
          setStatus('ready');
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus('error');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [uri]);

  const total = items.length;
  const correctCount = useMemo(() => {
    return items.reduce((acc, item, idx) => {
      if (answers[idx] === item.a) return acc + 1;
      return acc;
    }, 0);
  }, [answers, items]);

  function submit() {
    setScore(correctCount);
    setStatus('done');
  }

  if (!deptId) return <div style={{ padding: 16 }}>No department</div>;
  if (status === 'loading') return <div style={{ padding: 16 }}>Loading questions…</div>;
  if (status === 'error') return <div style={{ padding: 16, color: '#f66' }}>Failed to load {uri}</div>;

  if (status === 'done') {
    const pct = total ? Math.round((score / total) * 100) : 0;
    return (
      <div style={{ padding: 16 }}>
        <h2>Quiz Result — {deptId}</h2>
        <p>Score: {score} / {total} ({pct}%)</p>
        <Link to={`/learn/${deptId}/1`} style={{ color: '#ffd166' }}>Back to lessons</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Quiz — {deptId}</h2>
      <ol>
        {items.map((it, idx) => (
          <li key={idx} style={{ margin: '12px 0' }}>
            <div style={{ marginBottom: 8 }}>{it.q}</div>
            <input
              type="text"
              placeholder="Type your answer"
              value={answers[idx] || ''}
              onChange={e => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
              style={{
                width: '100%',
                maxWidth: 420,
                padding: 8,
                background: '#222',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: 6
              }}
            />
          </li>
        ))}
      </ol>
      <button onClick={submit} style={{ padding: '8px 14px', borderRadius: 6 }}>Submit</button>
    </div>
  );
}

