export function isAdmin(address) {
  if (!address) return false;
  const list = (import.meta.env.VITE_ADMIN_ADDRESSES || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(address.toLowerCase());
}
