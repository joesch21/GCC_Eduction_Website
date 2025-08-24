import RewardSummary from '../components/RewardSummary';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      {user && (
        <div style={{ background: '#eee', padding: '10px', textAlign: 'center' }}>
          Hello, {user.email}!
        </div>
      )}
      <RewardSummary />
    </div>
  );
}
