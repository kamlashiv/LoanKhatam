import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, ClipboardList, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function Layout({ children, showBottomNav = false }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: ClipboardList, label: "Requests", path: "/requests" },
    { icon: Bell, label: "Alerts", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-100">
      <div className="app-container">
        <div className="app-content pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {showBottomNav && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-card border-t border-border flex items-center justify-around px-2 z-50">
            {navItems.map((item) => {
              const isActive = location === item.path || location.startsWith(item.path + "/");
              const Icon = item.icon;
              
              return (
                <Link key={item.path} href={item.path} className="flex-1 flex flex-col items-center justify-center gap-1">
                  <div className={`p-2 rounded-full transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>
                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
