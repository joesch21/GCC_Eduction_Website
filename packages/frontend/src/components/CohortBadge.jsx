export default function CohortBadge({ status }) {
  const styles = {
    locked: { background: '#444', color: '#fff', label: 'locked' },
    unlocked: { background: '#ffd166', color: '#111', label: 'unlocked' },
    completed: { background: '#4caf50', color: '#fff', label: 'completed' }
  };
  const { background, color, label } = styles[status] || { background: '#555', color: '#fff', label: status };
  return (
    <span style={{ background, color, padding: '2px 6px', borderRadius: '4px', fontSize: 12 }}>
      {label}
    </span>
  );
}
