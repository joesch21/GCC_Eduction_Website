import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', duration = 3000, onDone }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setShow(false);
      onDone && onDone();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onDone]);

  if (!show) return null;

  const colors = {
    info: '#2196f3',
    success: '#4caf50',
    error: '#f44336',
    warn: '#ff9800'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: colors[type] || '#333',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: 8,
      boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
    }}>
      {message}
    </div>
  );
}
