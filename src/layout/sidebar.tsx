import {
  User,
  History,
  Settings,
  LogOut,
  X,
  Navigation,
  ChevronLeft,
  Home,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { getCurrentUser, logout } from "../utils/auth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-background shadow-2xl z-50 transition-all duration-300 lg:relative lg:shadow-none  ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "w-72"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="px-6 pt-12 pb-6 bg-primary text-primary-foreground relative lg:border-r lg:border-muted/30">
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-background/10 rounded-lg transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Toggle collapse button for desktop */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:block absolute top-4 right-4 p-2 hover:bg-background/10 rounded-lg transition-colors"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
              />
            </button>

            {!isCollapsed && (
              <>
                <h2 className="text-xl font-semibold mb-4">Menu</h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-background/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      {currentUser?.name}
                    </p>
                    <p className="text-sm opacity-75 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
              </>
            )}

            {isCollapsed && (
              <div className="flex justify-center pt-4">
                <div className="w-12 h-12 bg-background/20 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Menu */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <button
              onClick={() => handleNavigation("/home")}
              className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ${
                isActive("/home") ? "bg-gray-50 border-l-4 border-primary" : ""
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? "Início" : ""}
            >
              <Home className="w-5 h-5 text-foreground flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-foreground font-medium">Início</span>
              )}
            </button>

            <button
              onClick={() => handleNavigation("/profile")}
              className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ${
                isActive("/profile")
                  ? "bg-gray-50 border-l-4 border-primary"
                  : ""
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? "Perfil" : ""}
            >
              <User className="w-5 h-5 text-foreground flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-foreground font-medium">Perfil</span>
              )}
            </button>

            <button
              onClick={() => handleNavigation("/my-rides")}
              className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ${
                isActive("/my-rides")
                  ? "bg-gray-50 border-l-4 border-primary"
                  : ""
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? "Em andamento" : ""}
            >
              <Navigation className="w-5 h-5 text-foreground flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-foreground font-medium">
                  Em andamento
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavigation("/history")}
              className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ${
                isActive("/history")
                  ? "bg-gray-50 border-l-4 border-primary"
                  : ""
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? "Histórico" : ""}
            >
              <History className="w-5 h-5 text-foreground flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-foreground font-medium">Histórico</span>
              )}
            </button>

            <button
              onClick={() => handleNavigation("/settings")}
              className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left ${
                isActive("/settings")
                  ? "bg-gray-50 border-l-4 border-primary"
                  : ""
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? "Configurações" : ""}
            >
              <Settings className="w-5 h-5 text-foreground flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-foreground font-medium">
                  Configurações
                </span>
              )}
            </button>
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-gray-200">
            <button
              onClick={handleLogout}
              className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-destructive-muted transition-colors text-left ${
                isCollapsed ? "justify-center" : ""
              }`}
              title={isCollapsed ? "Sair" : ""}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-destructive" />
              {!isCollapsed && (
                <span className="text-destructive font-medium">Sair</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
