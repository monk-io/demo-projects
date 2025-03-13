'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button"
import { Home, User, Bell, MessageSquare, Settings } from "lucide-react"
import UserAvatar from "./UserAvatar"

export default function LeftSidebar() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = () => {
    signOut();
    router.push("/login");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center space-x-4 mb-6 bg-white p-4 rounded-lg">
        <UserAvatar user={user} />
        <div>
          <h2 className="font-bold text-lg">{user.fullname}</h2>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>
      <nav className="space-y-4">
        <Link
          href="/"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Home
        </Link>
        <Link
          href="/profile"
          className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          Profile
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-lg"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}

