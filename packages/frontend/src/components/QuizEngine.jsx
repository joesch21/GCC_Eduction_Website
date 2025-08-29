import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incAttempt, markPassed } from '../utils/storage';
import Toast from './Toast';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Props:
 *  - passPct (default 70)
 *  - timeLimitSec (default 480) // 8 minutes
 */
export default function QuizEngine({ passPct = 70, timeLimitSec = 480 }) {
  const { deptId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | ready | done | expired | error
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(timeLimitSec);
  const [toast, setToast] = useState(null);

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

  // timer
  useEffect(() => {
    if (status !== 'ready') return;
    setLeft(timeLimitSec);
    const t = setInterval(() => {
      setLeft(s => {
        if (s <= 1) {
          clearInterval(t);
          setStatus('expired');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status, timeLimitSec]);

  const total = items.length;
  const correctCount = useMemo(() => {
    return items.reduce((acc, it, idx) => {
      if (it.a) {
        const given = (answers[idx] || '').trim().toLowerCase();
        const exp = it.a.trim().toLowerCase();
        return acc + (given === exp ? 1 : 0);
      }
      if (it.correct) {
        const given = [...(answers[idx] || [])].sort();
        const exp = [...it.correct].sort();
        return acc + (JSON.stringify(given) === JSON.stringify(exp) ? 1 : 0);
      }
      return acc;
    }, 0);
  }, [answers, items]);

  function submit() {
    const s = correctCount;
    setScore(s);
    const pct = total ? (s / total) * 100 : 0;
    const pass = pct >= passPct;
    const attempts = incAttempt(deptId);
    if (pass) {
      markPassed(deptId, { score: s, pct: Math.round(pct), attempts });
    }
    setStatus('done');
    setToast({ message: pass ? 'Quiz passed!' : `Need ${passPct}% to pass`, type: pass ? 'success' : 'error' });
  }

  const toastEl = toast ? <Toast {...toast} onDone={() => setToast(null)} /> : null;

  if (!deptId) return <div style={{ padding: 16 }}>No department</div>;
  if (status === 'loading') return <div style={{ padding: 16 }}>{toastEl}Loading questions…</div>;
  if (status === 'error') return <div style={{ padding: 16, color: '#f66' }}>{toastEl}Failed to load {uri}</div>;

  if (status === 'expired') {
    return (
      <div style={{ padding: 16 }}>
        {toastEl}
        <h2>Time up — {deptId}</h2>
        <p>The time limit has expired. You can retry the quiz.</p>
        <button onClick={() => navigate(`/quiz/${deptId}`)}>Retry</button>
      </div>
    );
  }

  if (status === 'done') {
    const pct = total ? Math.round((score / total) * 100) : 0;
    const pass = pct >= passPct;
    return (
      <div style={{ padding: 16 }}>
        {toastEl}
        <h2>Quiz Result — {deptId}</h2>
        <p>Score: {score} / {total} ({pct}%)</p>
        <p>{pass ? '✅ Passed! Next department unlocked.' : `❌ Need ${passPct}% to pass. Try again.`}</p>
        <button onClick={() => navigate(`/learn/${deptId}/1`)} style={{ marginRight: 8 }}>Back to lessons</button>
        {!pass && <button onClick={() => navigate(`/quiz/${deptId}`)}>Retry quiz</button>}
      </div>
    );
  }

  // status === 'ready'
  const mm = String(Math.floor(left / 60)).padStart(2,'0');
  const ss = String(left % 60).padStart(2,'0');

  return (
    <div style={{ padding: 16 }}>
      {toastEl}
      <h2>Quiz — {deptId}</h2>
      <div style={{ marginBottom: 8, opacity: 0.8 }}>Time left: {mm}:{ss}</div>
      <ol>
        {items.map((it, idx) => (
          <li key={idx} style={{ margin: '12px 0' }}>
            <div style={{ marginBottom: 8 }}>{it.q}</div>
            {it.a && (
              <input
                type="text"
                placeholder="Type your answer"
                value={answers[idx] || ''}
                onChange={e => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
                style={{ width: '100%', maxWidth: 420, padding: 8, background: '#222', color: '#fff', border: '1px solid #444', borderRadius: 6 }}
              />
            )}
            {it.choices && (
              <div>
                {it.choices.map((choice, cIdx) => {
                  const single = it.correct?.length === 1;
                  const checked = (answers[idx] || []).includes(cIdx);
                  return (
                    <label key={cIdx} style={{ display: 'block', margin: '4px 0' }}>
                      <input
                        type={single ? 'radio' : 'checkbox'}
                        name={`q-${idx}`}
                        checked={checked}
                        onChange={() => {
                          if (single) {
                            // radio behaviour
                            setAnswers(a => ({ ...a, [idx]: [cIdx] }));
                          } else {
                            setAnswers(a => {
                              const prev = a[idx] || [];
                              const has = prev.includes(cIdx);
                              return { ...a, [idx]: has ? prev.filter(i => i !== cIdx) : [...prev, cIdx] };
                            });
                          }
                        }}
                      />
                      <span style={{ marginLeft: 6 }}>{choice}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ol>
      <button onClick={submit} style={{ padding: '8px 14px', borderRadius: 6 }}>Submit</button>
    </div>
  );
}
