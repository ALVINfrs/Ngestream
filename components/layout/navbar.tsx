"use client";

import { useState, useCallback } from "react";
import type React from "react";
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
import { toast } from "@/hooks/use-toast";
import {
  Search,
  User,
  LogOut,
  Heart,
  Bookmark,
  Crown,
  Film,
  Tv,
  Menu,
} from "lucide-react";

export default function Navbar() {
  const { user, profile, subscription, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setIsMobileMenuOpen(false);
      }
    },
    [searchQuery, router]
  );

  const handleSignOut = useCallback(async () => {
    // Tutup menu mobile sebelum sign out
    closeMobileMenu();
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
  }, [signOut, router]);

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

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex flex-col items-start"
            onClick={closeMobileMenu}
          >
            <div className="text-2xl font-bold text-red-600">NgeStream</div>
            <p className="text-[10px] text-gray-500 -mt-1 tracking-wider">
              created by alvnfrss
            </p>
          </Link>

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

          <div className="flex items-center gap-4">
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex items-center"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-700 text-white w-40 md:w-64"
                />
              </div>
            </form>

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
                        alt={profile?.full_name || "User Avatar"}
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
                      Liked Movies
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/movies?tab=anime"
                      className="text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <span className="mr-2">🎌</span> Anime
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/tv?tab=kdrama"
                      className="text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <span className="mr-2">🇰🇷</span> K-Drama
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/movies?tab=indonesian"
                      className="text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <Film className="mr-2 h-4 w-4" /> Indonesian Movies
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/tv?tab=indonesian"
                      className="text-white hover:bg-gray-800 cursor-pointer"
                    >
                      <Tv className="mr-2 h-4 w-4" /> Indonesian TV Shows
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
              <Link href="/auth" className="hidden md:block">
                <Button className="bg-red-600 hover:bg-red-700">Sign In</Button>
              </Link>
            )}

            <div className="md:hidden">
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                size="icon"
              >
                <Menu className="h-6 w-6 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* === PANEL MENU MOBILE (BAGIAN YANG DIPERBARUI) === */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-gray-800">
          <div className="px-4 pt-4 pb-6 flex flex-col space-y-2">
            {/* Search Bar Mobile */}
            <form onSubmit={handleSearch} className="flex sm:hidden pb-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </form>

            {/* Link Navigasi Utama */}
            <Link
              href="/"
              className="text-white hover:text-red-400 block p-2 rounded-md hover:bg-gray-800"
              onClick={closeMobileMenu}
            >
              Home
            </Link>
            <Link
              href="/movies"
              className="text-white hover:text-red-400 block p-2 rounded-md hover:bg-gray-800"
              onClick={closeMobileMenu}
            >
              Movies
            </Link>
            <Link
              href="/tv"
              className="text-white hover:text-red-400 block p-2 rounded-md hover:bg-gray-800"
              onClick={closeMobileMenu}
            >
              TV Shows
            </Link>
            <Link
              href="/genres"
              className="text-white hover:text-red-400 block p-2 rounded-md hover:bg-gray-800"
              onClick={closeMobileMenu}
            >
              Genres
            </Link>

            <hr className="border-gray-700 my-2" />

            {/* Shortcut Konten */}
            <Link
              href="/movies?tab=anime"
              className="text-white hover:text-red-400 flex items-center p-2 rounded-md hover:bg-gray-800"
              onClick={closeMobileMenu}
            >
              <span className="mr-2">🎌</span> Anime
            </Link>
            <Link
              href="/tv?tab=kdrama"
              className="text-white hover:text-red-400 flex items-center p-2 rounded-md hover:bg-gray-800"
              onClick={closeMobileMenu}
            >
              <span className="mr-2">🇰🇷</span> K-Drama
            </Link>
            <Link
              href="/indonesian"
              className="text-white hover:text-red-400 flex items-center p-2 rounded-md hover:bg-gray-800"
              onClick={closeMobileMenu}
            >
              <span className="mr-2">🇮🇩</span> Indonesian
            </Link>

            <hr className="border-gray-700 my-2" />

            {/* Menu Pengguna atau Tombol Sign In */}
            {user ? (
              <div className="flex flex-col space-y-2">
                <Link
                  href="/profile"
                  className="text-white hover:text-red-400 flex items-center p-2 rounded-md hover:bg-gray-800"
                  onClick={closeMobileMenu}
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/wishlist"
                  className="text-white hover:text-red-400 flex items-center p-2 rounded-md hover:bg-gray-800"
                  onClick={closeMobileMenu}
                >
                  <Bookmark className="mr-2 h-4 w-4" />
                  My Wishlist
                </Link>
                <Link
                  href="/liked"
                  className="text-white hover:text-red-400 flex items-center p-2 rounded-md hover:bg-gray-800"
                  onClick={closeMobileMenu}
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Liked Movies
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="destructive"
                  className="w-full mt-2 flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/auth" onClick={closeMobileMenu}>
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
