import { Link } from "@tanstack/react-router";
import { Bell, BookMarked, Compass, Home, Search, User } from "lucide-react";
import { useNotifications, useProfile } from "@/hooks/use-library";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

export const userNav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/my-library", label: "My Library", icon: BookMarked },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-fit items-center gap-2 rounded-full border bg-card/95 p-2 shadow-float backdrop-blur-xl md:hidden"
    >
      {userNav.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          aria-label={label}
          className="grid size-11 place-items-center rounded-full text-bluegray transition-colors"
          activeProps={{ className: "!bg-primary !text-primary-foreground" }}
          inactiveProps={{ className: "text-muted-foreground/70 hover:text-foreground" }}
        >
          <Icon className="size-5" strokeWidth={2.2} />
        </Link>
      ))}
    </nav>
  );
}

export function DesktopNavigation() {
  return (
    <header className="sticky top-0 z-40 hidden border-b bg-background/85 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link to="/dashboard" aria-label="গ্রন্থাগার home">
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 rounded-full bg-card p-1 shadow-soft">
          {userNav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <HeaderActions />
      </div>
    </header>
  );
}

export function HeaderActions({ className }: { className?: string }) {
  const { data: notes = [] } = useNotifications();
  const { data: profile } = useProfile();
  const unread = notes.filter((n) => !n.readAt).length;
  const initials = (profile?.fullName || profile?.email || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link to="/explore" aria-label="Search books" className="grid size-10 place-items-center rounded-full bg-ink text-primary-foreground transition-colors hover:bg-primary">
        <Search className="size-4" />
      </Link>
      <Link to="/notifications" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} className="relative grid size-10 place-items-center rounded-full bg-ink text-primary-foreground transition-colors hover:bg-primary">
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-lime px-1 text-[10px] font-bold text-lime-foreground ring-2 ring-background">
            {unread}
          </span>
        )}
      </Link>
      <Link to="/profile" aria-label="Your profile" className="grid size-10 place-items-center overflow-hidden rounded-full bg-lime text-xs font-extrabold">
        {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="size-full object-cover" /> : initials}
      </Link>
    </div>
  );
}

/** Compact mobile header (Readly-style: brand chip left, round icon buttons right). */
export function UserHeader() {
  return (
    <div className="flex items-center justify-between px-5 pt-5 md:hidden">
      <Link to="/dashboard" aria-label="গ্রন্থাগার home">
        <Logo compact />
      </Link>
      <HeaderActions />
    </div>
  );
}
