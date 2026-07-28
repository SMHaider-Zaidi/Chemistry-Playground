"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { User, LogOut } from "lucide-react";

export function Navigation() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-primary">
              Chemistry Playground
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/about" className="text-gray-700 hover:text-primary transition-colors">
                About us
              </Link>
              <Link href="/molecules" className="text-gray-700 hover:text-primary transition-colors">
                3D Molecules
              </Link>
              <Link href="/periodic" className="text-gray-700 hover:text-primary transition-colors">
                Periodic Table
              </Link>
              <Link href="/reactions" className="text-gray-700 hover:text-primary transition-colors">
                Reactions
              </Link>
              <Link href="/quizzes" className="text-gray-700 hover:text-primary transition-colors">
                Quizzes
              </Link>
              {user && (
                <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}