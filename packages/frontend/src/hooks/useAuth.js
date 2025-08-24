import { useEffect, useState } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  return { user };
}
