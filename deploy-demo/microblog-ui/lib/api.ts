import { Post, User, AuthResponse } from "./types";
import { setCookie, removeCookie } from "./cookies";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const AUTH_BASE_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || API_BASE_URL + "/auth";

// Helper function to get the stored token
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Helper function to handle authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token might be expired - try to refresh
    const newToken = await refreshToken();
    if (newToken) {
      // Retry the request with the new token
      headers["Authorization"] = `Bearer ${newToken}`;
      return fetch(url, { ...options, headers });
    }
    throw new Error("Authentication failed");
  }

  return response;
}

// Get user avatar URL
export function getUserAvatar(userId: number): string {
  return `${API_BASE_URL}/users/${userId}/avatar.png`;
}

// Existing functions with authentication
export async function fetchPosts(): Promise<Post[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/posts/feed`);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export async function fetchUserPosts(username: string): Promise<Post[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/${username}/posts`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user posts");
  }
  return response.json();
}

export async function fetchUser(username: string): Promise<User> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/users/${username}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }
  return response.json();
}

export async function createPost(data: { content: string }) {
  const response = await authenticatedFetch(`${API_BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return response.json();
}

// New authentication functions
export async function signIn(
  username: string,
  password: string
): Promise<{ token: string; user: User }> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Failed to sign in");
  }

  const data = await response.json();
  // Set the token as a cookie instead of localStorage
  setCookie("token", data.token);

  // Fetch user data after successful login
  const user = await getCurrentUser();
  return { token: data.token, user };
}

export async function signUp(userData: {
  username: string;
  password: string;
  email: string;
  fullname: string;
}): Promise<void> {
  const response = await fetch(`${AUTH_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to sign up");
  }
}

export async function refreshToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/refresh`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      return null;
    }

    const data = await response.json();
    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.token);
    }
    return data.token;
  } catch (error) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    return null;
  }
}

export function signOut(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export async function getCurrentUser(): Promise<User> {
  const response = await authenticatedFetch(`${API_BASE_URL}/users/me`);
  if (!response.ok) {
    throw new Error("Failed to fetch current user");
  }
  return response.json();
}

export async function likePost(postId: number) {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/posts/${postId}/like`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to like post");
  }
  return response.json();
}

export async function sendFriendRequest(friendId: number) {
  const response = await authenticatedFetch(`${API_BASE_URL}/friendships`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ friend_id: friendId }),
  });

  if (!response.ok) {
    throw new Error("Failed to send friend request");
  }
  return response.json();
}

export async function acceptFriendRequest(userId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/friendships/${userId}/accept`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to accept friend request");
  }
}

export async function rejectFriendRequest(userId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/friendships/${userId}/reject`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to reject friend request");
  }
}

export async function getFriendRequests() {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/friendships/pending`
  );
  if (!response.ok) {
    throw new Error("Failed to get friend requests");
  }
  return response.json();
}

export type FriendshipStatus = {
  status: "none" | "pending_sent" | "pending_received" | "friends";
};

export async function checkFriendshipStatus(
  userId: number
): Promise<FriendshipStatus> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/friendships/${userId}/status`
  );
  if (!response.ok) {
    throw new Error("Failed to check friendship status");
  }
  return response.json();
}

export async function cancelFriendRequest(userId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/friendships/${userId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to cancel friend request");
  }
}

export async function logout() {
  // Remove the cookie instead of localStorage item
  removeCookie("token");
  // Additional logout logic...
}

export type Friendship = {
  id: string;
  status: "pending" | "accepted";
  user: {
    id: number;
    username: string;
    fullname: string;
    email: string;
  };
};

export async function getFriendships(): Promise<Friendship[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/friendships`);
  if (!response.ok) {
    throw new Error("Failed to fetch friendships");
  }
  return response.json();
}

export async function removeFriend(userId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/friendships/${userId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove friend");
  }
}

export const createComment = async (
  postId: number,
  data: { content: string }
) => {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/posts/${postId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create comment");
  }

  return response.json();
};
