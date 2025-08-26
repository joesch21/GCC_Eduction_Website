import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizEngine() {
  const { deptId } = useParams();
  const [status, setStatus] = useState('loading');
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

  function toggleChoice(qIdx, cIdx) {
    setAnswers(a => {
      const prev = a[qIdx] || [];
      const has = prev.includes(cIdx);
      return { ...a, [qIdx]: has ? prev.filter(i => i !== cIdx) : [...prev, cIdx] };
    });
  }

  function submit() {
    let correct = 0;
    items.forEach((it, idx) => {
      if (it.a) {
        if ((answers[idx] || '').trim().toLowerCase() === it.a.trim().toLowerCase()) correct++;
      } else if (it.correct) {
        const given = [...(answers[idx] || [])].sort();
        const exp = [...it.correct].sort();
        if (JSON.stringify(given) === JSON.stringify(exp)) correct++;
      }
    });
    setScore(correct);
    setStatus('done');
  }

  if (!deptId) return <div style={{ padding: 16 }}>No department</div>;
  if (status === 'loading') return <div style={{ padding: 16 }}>Loading…</div>;
  if (status === 'error') return <div style={{ padding: 16, color: '#f66' }}>Failed to load {uri}</div>;

  if (status === 'done') {
    return (
      <div style={{ padding: 16 }}>
        <h2>Quiz Result — {deptId}</h2>
        <p>Score: {score} / {items.length}</p>
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
      <button onClick={submit} style={{ padding: '8px 14px', borderRadius: 6 }}>Submit</button>
    </div>
  );
}

