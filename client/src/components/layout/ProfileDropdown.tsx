import { useState } from "react";
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
import {
  User,
  Settings,
  CreditCard,
  BarChart2,
  LogOut,
  HelpCircle,
  FileText,
  Activity,
} from "lucide-react";

interface ProfileDropdownProps {
  openTool: (tool: string) => void;
}

export function ProfileDropdown({ openTool }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

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
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenDashboard("businessFeasibility")}
          >
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Feasibility Analysis</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenDashboard("demandForecasting")}
          >
            <Activity className="mr-2 h-4 w-4" />
            <span>Demand Forecasting</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenDashboard("optimizationAnalysis")}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Optimization Tools</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleOpenDashboard("recommendations")}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span>Recommendations</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handleOpenDashboard("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleOpenDashboard("help")}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
