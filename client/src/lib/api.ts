const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://node2.gervhosting.my.id:5056/api';

export async function fetchApi<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.statusText}`);
  }
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error?.message || 'API returned failure');
  }
  return json;
}
