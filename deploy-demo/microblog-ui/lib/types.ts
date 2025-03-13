export interface User {
  id: number;
  username: string;
  fullname?: string;
  email: string;
}

interface Like {
  id: number;
  user_id: number;
  post_id: number;
}

export interface Post {
  id: number;
  content: string;
  author_id: number;
  timestamp: string;
  author?: User;
  comments: Comment[];
  likes: Like[];
  likeCount: number;
  isLiked?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  author_id: number;
  post_id: number;
  timestamp: string;
  author?: User;
}

export interface AuthResponse {
  token: string;
}

export interface SignUpData {
  username: string;
  password: string;
  email: string;
  fullname: string;
}
