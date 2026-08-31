// What to show a user when a request to shard_core failed.

export function errorDetail(error, fallback) {
  const data = error && error.response && error.response.data;
  const detail = data && (data.detail || data.message);
  // FastAPI answers a validation error with a list of per-field problems
  if (Array.isArray(detail)) {
    return detail.map(d => d.msg || String(d)).join('; ') || fallback;
  }
  return detail || (error && error.message) || fallback;
}
