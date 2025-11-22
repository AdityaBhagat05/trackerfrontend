import API_URL from './config';

export async function authenticatedFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // Redirect to login if no token
    localStorage.clear();
    window.location.reload();
    throw new Error("No authentication token");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle expired token
  if (response.status === 401) {
    localStorage.clear();
    alert("Session expired. Please login again.");
    window.location.reload();
    throw new Error("Unauthorized");
  }

  return response;
}