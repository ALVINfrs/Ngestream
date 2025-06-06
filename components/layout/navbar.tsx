"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  User,
  LogOut,
  Heart,
  Bookmark,
  Crown,
  Film,
  Tv,
  Menu, // Added for mobile menu
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Navbar() {
  const { user, profile, subscription, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMobileMenuOpen(false); // Close mobile menu on search
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
      router.push("/auth");
    }
  };

  const getTierBadge = () => {
    if (!subscription) return null;

    const tierColors = {
      free: "text-gray-400",
      basic: "text-blue-400",
      premium: "text-yellow-400",
    };

    return (
      <span
        className={`text-xs ${
          tierColors[subscription.tier]
        } flex items-center gap-1`}
      >
        {subscription.tier === "premium" && <Crown className="h-3 w-3" />}
        {subscription.tier.toUpperCase()}
      </span>
    );
  };

  // Close mobile menu on link click
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col" onClick={handleLinkClick}>
            <div className="text-2xl font-bold text-red-600">
              <span className="font-black text-3xl transition-transform duration-300 inline-block hover:scale-110">
                N
              </span>
              geStream
            </div>
            <p className="text-[10px] text-gray-500 -mt-1 tracking-wider">
              created by alvnfrss
            </p>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white hover:text-red-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/movies"
              className="text-white hover:text-red-400 transition-colors"
            >
              Movies
            </Link>
            <Link
              href="/tv"
              className="text-white hover:text-red-400 transition-colors"
            >
              TV Shows
            </Link>
            <Link
              href="/genres"
              className="text-white hover:text-red-400 transition-colors"
            >
              Genres
            </Link>
            <Link
              href="/indonesian"
              className="text-white hover:text-red-400 transition-colors flex items-center"
            >
              <span className="mr-1">Indonesian</span> 🇮🇩
            </Link>
          </div>

          <div className="flex items-center">
            {/* Desktop Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex items-center space-x-2 mr-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white w-48 lg:w-64"
                />
              </div>
            </form>

            {/* User Menu / Sign In Button */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={profile?.avatar_url || "/placeholder.svg"}
                        alt={profile?.full_name || ""}
                      />
                      <AvatarFallback className="bg-red-600">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 bg-gray-900 border-gray-700"
                  align="end"
                >
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      {getTierBadge()}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/wishlist"
                      className="text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <Bookmark className="mr-2 h-4 w-4" />
                      My Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/liked"
                      className="text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Liked Content
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 hover:bg-red-900/50 cursor-pointer focus:bg-red-900/50 focus:text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-red-600 hover:bg-red-700 hidden md:flex">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden ml-2">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-gray-800"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800">
          <div className="px-4 pt-4 pb-6 space-y-4">
            {/* Mobile Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center space-x-2"
            >
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search movies, TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white w-full"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-white hover:text-red-400"
                onClick={handleLinkClick}
              >
                Home
              </Link>
              <Link
                href="/movies"
                className="text-white hover:text-red-400"
                onClick={handleLinkClick}
              >
                Movies
              </Link>
              <Link
                href="/tv"
                className="text-white hover:text-red-400"
                onClick={handleLinkClick}
              >
                TV Shows
              </Link>
              <Link
                href="/genres"
                className="text-white hover:text-red-400"
                onClick={handleLinkClick}
              >
                Genres
              </Link>
              <Link
                href="/indonesian"
                className="text-white hover:text-red-400"
                onClick={handleLinkClick}
              >
                Indonesian 🇮🇩
              </Link>
              {!user && (
                <Link href="/auth" onClick={handleLinkClick}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 mt-2">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
