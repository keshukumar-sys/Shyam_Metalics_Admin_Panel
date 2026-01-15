export const saveAuth = ({ token, role, email }) => {
  localStorage.setItem("shyam_token", token);
  localStorage.setItem("shyam_role", role);
  localStorage.setItem("shyam_email", email);
};

export const clearAuth = () => {
  localStorage.removeItem("shyam_token");
  localStorage.removeItem("shyam_role");
  localStorage.removeItem("shyam_email");
};

export const getToken = () => localStorage.getItem("shyam_token");
export const getRole = () => localStorage.getItem("shyam_role");
export const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// For FormData requests (file uploads), only include Authorization header
// Don't set Content-Type - let browser set it as multipart/form-data
export const authHeaderForFormData = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

