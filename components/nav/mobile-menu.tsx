"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import {
  MenuIcon,
  XIcon,
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  CheckSquareIcon,
  CalendarIcon,
  BarChartIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  user: {
    _id: string;
    name?: string;
    email: string;
  };
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
  { name: "Contacts", href: "/contacts", icon: UsersIcon },
  { name: "Projects", href: "/projects", icon: BriefcaseIcon },
  { name: "Tasks", href: "/tasks", icon: CheckSquareIcon },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Reports", href: "/reports", icon: BarChartIcon },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between h-16 px-4 bg-white border-b">
        <h1 className="text-xl font-bold text-gray-900">ArtisanCRM</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white" style={{ top: "64px" }}>
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-6 w-6 flex-shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-shrink-0 border-t p-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="default"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
