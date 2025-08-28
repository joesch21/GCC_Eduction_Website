import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { markDeptCompleted, readProgress } from '../store/progress';

const PASS_PCT = 70;
const TIMER_SEC = 8 * 60;
const COOLDOWN_SEC = 5 * 60;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cooldownKey(deptId) { return `lythera_cooldown_${deptId}`; }

export default function QuizEngine() {
  const { deptId } = useParams();
  const [status, setStatus] = useState('loading'); // loading | ready | done | error | locked
  const [items, setItems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(TIMER_SEC); // seconds
  const [cooldownLeft, setCooldownLeft] = useState(0);

  const uri = deptId ? `/content/${deptId}/questions.json` : null;

  useEffect(() => {
    if (!deptId) return;
    // cooldown check
    const until = Number(localStorage.getItem(cooldownKey(deptId)) || 0);
    const now = Math.floor(Date.now() / 1000);
    if (until > now) {
      setCooldownLeft(until - now);
      setStatus('locked');
      const t = setInterval(() => {
        const now2 = Math.floor(Date.now() / 1000);
        const remain = Math.max(0, until - now2);
        setCooldownLeft(remain);
        if (remain === 0) { clearInterval(t); setStatus('loading'); }
      }, 1000);
      return () => clearInterval(t);
    }
  }, [deptId]);

  useEffect(() => {
    if (status !== 'loading') return;
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
          setLeft(TIMER_SEC);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus('error');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [uri, status]);

  // timer
  useEffect(() => {
    if (status !== 'ready') return;
    const id = setInterval(() => {
      setLeft(s => {
        const n = s - 1;
        if (n <= 0) {
          clearInterval(id);
          handleSubmit(true);
          return 0;
        }
        return n;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [status]); // eslint-disable-line

  function toggleChoice(qIdx, cIdx) {
    setAnswers(a => {
      const prev = a[qIdx] || [];
      const has = prev.includes(cIdx);
      return { ...a, [qIdx]: has ? prev.filter(i => i !== cIdx) : [...prev, cIdx] };
    });
  }

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

  function handleSubmit(auto = false) {
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    setScore(correctCount);
    const passed = pct >= PASS_PCT;
    setStatus('done');

    if (passed) {
      markDeptCompleted(deptId);
    } else if (!auto) {
      const until = Math.floor(Date.now() / 1000) + COOLDOWN_SEC;
      localStorage.setItem(cooldownKey(deptId), String(until));
      setCooldownLeft(COOLDOWN_SEC);
    }
  }

  if (!deptId) return <div style={{ padding: 16 }}>No department</div>;
  if (status === 'locked') {
    return <div style={{ padding: 16, color: '#ffd166' }}>Retry available in {Math.ceil(cooldownLeft)}s…</div>;
  }
  if (status === 'loading') return <div style={{ padding: 16 }}>Loading questions…</div>;
  if (status === 'error') return <div style={{ padding: 16, color: '#f66' }}>Failed to load {uri}</div>;

  if (status === 'done') {
    const pct = total ? Math.round((score / total) * 100) : 0;
    const p = readProgress();
    const next = ['department1','department2','department3','department4']
      .find((_, i, arr) => p.unlocked[arr[i + 1]]);
    return (
      <div style={{ padding: 16 }}>
        <h2>Quiz Result — {deptId}</h2>
        <p>Score: {score} / {total} ({pct}%)</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to={`/learn/${deptId}/1`} style={{ color: '#ffd166' }}>Back to lessons</Link>
          <Link to="/learn" style={{ color: '#ffd166' }}>Learn Hub</Link>
        </div>
      </div>
    );
  }

  // status === 'ready'
  return (
    <div style={{ padding: 16 }}>
      <h2>Quiz — {deptId}</h2>
      <div style={{ marginBottom: 10 }}>Time left: {Math.ceil(left)}s • Pass: {PASS_PCT}%</div>
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
                {it.choices.map((choice, cIdx) => (
                  <label key={cIdx} style={{ display: 'block', margin: '4px 0' }}>
                    <input
                      type={it.correct.length === 1 ? 'radio' : 'checkbox'}
                      name={`q-${idx}`}
                      value={cIdx}
                      checked={(answers[idx] || []).includes(cIdx)}
                      onChange={() => toggleChoice(idx, cIdx)}
                    />
                    <span style={{ marginLeft: 6 }}>{choice}</span>
                  </label>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      <button onClick={() => handleSubmit(false)} style={{ padding: '8px 14px', borderRadius: 6 }}>Submit</button>
    </div>
  );
}
