export default function ProgressBar({ value = 0, max = 100 }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: '#333', borderRadius: '4px' }}>
      <div style={{ width: pct + '%', background: '#0f0', height: '10px', borderRadius: '4px' }} />
    </div>
  );
}