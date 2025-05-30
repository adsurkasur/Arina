import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, HelpCircle } from "lucide-react";
import { useTranslation } from "@/contexts/useTranslation";

interface ProfileDropdownProps {
  openTool: (tool: string) => void;
}

export function ProfileDropdown({ openTool }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useTranslation();

  // Debug: log translation for verification
  console.log("ProfileDropdown language:", language);
  console.log("t(sidebar.profile):", t("sidebar.profile"));

  // Force re-render on language change
  const [, setLangTick] = useState(0);
  React.useEffect(() => {
    setLangTick((tick) => tick + 1);
  }, [language]);

  const handleOpenDashboard = (dashboardType: string) => {
    openTool(dashboardType);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none font-sans">
          <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
            <AvatarImage src={user.photoURL} alt={user.name} />
            <AvatarFallback className="bg-primary text-white">
              {user.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 font-sans">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleOpenDashboard("userProfile")}>
            <User className="mr-2 h-4 w-4" />
            <span>{t("sidebar.profile")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenDashboard("settings")}>
            {/* Opens SettingsPanel */}
            <Settings className="mr-2 h-4 w-4" />
            <span>{t("sidebar.settings")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenDashboard("help")}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>{t("sidebar.helpSupport")}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:text-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("sidebar.signOut")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
