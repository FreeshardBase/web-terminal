export function errorMessage(error) {
  const data = error && error.response && error.response.data;
  if (data) {
    return data.detail || data.error || data.message || data;
  }
  return (error && error.message) || error;
}
