const BASE_URL = "http://localhost:4000";

export const registerUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    credentials: "include",
  });
  return response.json();
};

export const loginUser = async (userData) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    credentials: "include",
  });
  return response.json();
};

export const getSession = async () => {
  const response = await fetch(`${BASE_URL}/session`, {
    method: "GET",
    credentials: "include",
  });
  return response.json();
};

export const logoutUser = async () => {
  const response = await fetch(`${BASE_URL}/logout`, {
    method: "POST",
    credentials: "include",
  });
  return response.json();
};

export const updateProfilePicture = async (formData) => {
  const response = await fetch(`${BASE_URL}/userUpdated`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    const errorText = await response.text();
    throw new Error(`Error: ${errorText}`);
  }
};

export const getLoggedUser = async () => {
  const response = await fetch(`${BASE_URL}/profile`, {
    method: "GET",
    credentials: "include",
  });

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  } else {
    const errorText = await response.text();
    throw new Error(`Error: ${errorText}`);
  }
};
