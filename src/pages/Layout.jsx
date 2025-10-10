

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutGrid,
  Archive,
  MessageSquare,
  CheckCircle2,
  Clock,
  Settings,
  Plus,
  User as UserIcon, // Keep UserIcon as it might be used elsewhere
  Menu,
  X,
  BarChart3,
  LogOut,
  Crown // Removed CreditCard import
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
// User management now handled through Supabase auth
import { motion, AnimatePresence } from "framer-motion";
import { UserProvider, useUser } from '../components/auth/UserProvider';
import NotificationCenter from '../components/notifications/NotificationCenter';

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: BarChart3, pageName: "Dashboard" },
  { title: "All Projects", url: createPageUrl("Projects?filter=all"), icon: LayoutGrid, filter: "all", pageName: "Projects" },
  { title: "Active", url: createPageUrl("Projects?filter=active"), icon: Clock, filter: "active", pageName: "Projects" },
  { title: "Pending", url: createPageUrl("Projects?filter=pending"), icon: MessageSquare, filter: "pending", pageName: "Projects" },
  { title: "Approved", url: createPageUrl("Projects?filter=approved"), icon: CheckCircle2, filter: "approved", pageName: "Projects" },
  { title: "Archived", url: createPageUrl("Projects?filter=archived"), icon: Archive, filter: "archived", pageName: "Projects" },
];


const mobileNavItems = [
  { title: "Projects", url: createPageUrl("Projects"), icon: LayoutGrid, pageName: "Projects" },
  { title: "Settings", url: createPageUrl("Settings"), icon: Settings, pageName: "Settings" }
];


const publicPages = ['Review', 'Home', 'Features', 'Pricing', 'Faq', 'About', 'Contact', 'Terms', 'Privacy', 'Refund', 'SupabaseOnly', 'Login', 'Register', 'ForgotPassword'];

const BottomNavItem = ({ item, isActive }) =>
  <Link to={item.url} className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${isActive ? 'text-[rgb(var(--accent-primary))]' : 'text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]'}`}>
    <item.icon className="w-5 h-5" />
    <span className="text-xs font-medium">{item.title}</span>
  </Link>;


function AppLayout({ children, currentPageName }) {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const currentFilter = urlParams.get("filter") || "all";
  const { user, isAuthenticated, signOut } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isScrollingDown, setIsScrollingDown] = React.useState(0);
  const [lastScrollY, setLastScrollY] = React.useState(0);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      await signOut();
      // Redirect to home page
      window.location.href = '/Home';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to home
      window.location.href = '/Home';
    }
  };

  const getActivePath = () => {
    if (currentPageName === "Projects") {
      return createPageUrl(`Projects?filter=${currentFilter}`);
    }
    if (currentPageName === "Dashboard") {
      return createPageUrl("Dashboard");
    }
    return location.pathname;
  };

  const activePath = getActivePath();

  // App is now fully running on Supabase - no Base44 dependencies

  // Handle scroll behavior for mobile header
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsScrollingDown(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const pagesWithoutLayout = ['Home', 'Review', 'Features', 'Pricing', 'Faq', 'About', 'Contact', 'Terms', 'Privacy', 'Refund', 'Login', 'Register', 'ForgotPassword'];
  if (pagesWithoutLayout.includes(currentPageName)) {
    return (
      <div className="dark min-h-screen bg-[rgb(var(--surface-dark))]">
        <style>{`
          :root { --surface-dark: 17 24 39; --text-primary: 229 231 235; --accent-primary: 139 92 246; }
          html, body { background-color: rgb(var(--surface-dark)); color: rgb(var(--text-primary)); }
        `}</style>
        {children}
      </div>);
  }

  // Public pages can be accessed without authentication
  if (publicPages.includes(currentPageName)) {
    return (
      <div className="dark min-h-screen bg-[rgb(var(--surface-dark))]">
        <style>{`
          :root { --surface-dark: 17 24 39; --text-primary: 229 231 235; --accent-primary: 139 92 246; }
          html, body { background-color: rgb(var(--surface-dark)); color: rgb(var(--text-primary)); }
        `}</style>
        {children}
      </div>);
  }

  // Only redirect to login for protected pages when not authenticated
  if (!isAuthenticated && !publicPages.includes(currentPageName)) {
    return (
      <div className="dark min-h-screen bg-[rgb(var(--surface-dark))] flex items-center justify-center text-white">
        <p>Redirecting to login...</p>
      </div>);
  }

  return (
    <>
      <style>{`
        :root {
          --surface-dark: 17 24 39;
          --surface-light: 31 41 55;
          --border-dark: 55 65 81;
          --accent-primary: 139 92 246;
          --accent-glow: 139 92 246;
          --text-primary: 229 231 235;
          --text-secondary: 156 163 175;
        }
        html, body { 
          font-family: 'Inter', sans-serif; 
          background-color: rgb(var(--surface-dark)); 
          color: rgb(var(--text-primary)); 
          font-weight: 300;
        }
        .desktop-sidebar { width: 260px; }
        .brand-gradient { background: linear-gradient(135deg, rgb(var(--accent-primary)), #a855f7); }
        .accent-glow { box-shadow: 0 0 15px 0 rgba(var(--accent-glow), 0.4); }
        .mobile-content { padding-bottom: 85px; }
        .mobile-menu-overlay { backdrop-filter: blur(8px); }
        .mobile-header-hidden { transform: translateY(-100%); }
        .mobile-header-visible { transform: translateY(0); }
        .glass-effect { 
          background: rgba(15, 23, 42, 0.8); 
          backdrop-filter: blur(20px); 
          -webkit-backdrop-filter: blur(20px);
        }
        
        /* Custom toast styling for notifications */
        [data-sonner-toast] {
          background: rgb(31, 41, 55) !important;
          border: 1px solid rgb(55, 65, 81) !important;
          color: white !important;
        }
        
        [data-sonner-toast] [data-description] {
          color: rgb(156, 163, 175) !important;
        }
        
        /* Notification bell animation */
        .notification-bell-shake {
          animation: bellShake 0.5s ease-in-out;
        }
        
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
      `}</style>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      
      <div className="dark flex w-full h-screen bg-background">
        <aside className="bg-slate-900 hidden lg:flex flex-col desktop-sidebar border-r border-[rgb(var(--border-dark))] flex-shrink-0">
          <div className="p-4 mb-4">
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d644f855b_smalllogo.png" 
                alt="Editable Logo" 
                className="w-10 h-10 rounded-lg"
              />
              <span className="text-2xl font-bold">Editable</span>
            </Link>
          </div>
          <nav className="px-2 flex-1 space-y-2">
            {navigationItems.map((item) =>
              <Link key={item.title} to={item.url}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start items-center gap-3 h-11 px-4 text-base font-light rounded-xl transition-all duration-300 ease-in-out hover:rounded-xl hover:shadow-sm
                          ${activePath === item.url ?
                      'text-white bg-gradient-to-r from-violet-500/20 to-violet-600/20 border-l-4 border-violet-400 shadow-lg' :
                      'text-gray-300 hover:bg-gradient-to-r hover:from-gray-700/30 hover:to-gray-600/20 hover:text-white hover:shadow-md'}`

                  }>

                  <item.icon className="w-5 h-5" />
                  <span className="font-light">{item.title}</span>
                </Button>
              </Link>
            )}
          </nav>
          <div className="bg-slate-900 p-2">
            {/* User dropdown moved to desktop header */}
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-[rgb(var(--surface-dark))] overflow-y-auto relative">
          {/* Mobile Header with Auto-hide */}
          <div className={`sticky top-0 left-0 right-0 z-30 lg:hidden transition-transform duration-300 ease-in-out ${
            isScrollingDown ? 'mobile-header-hidden' : 'mobile-header-visible'
          }`}>
            <div className="glass-effect border-b border-[rgb(var(--border-dark))] p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="hover:bg-violet-500/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d644f855b_smalllogo.png" 
                    alt="Editable Logo" 
                    className="w-10 h-10 rounded-lg"
                  />
                  <span className="text-2xl font-bold">Editable</span>
                </Link>
              </div>
              
              {/* Mobile Notifications */}
              <div className="flex items-center gap-2">
                <NotificationCenter />
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-end p-4 sticky top-0 z-20 bg-slate-900/50 backdrop-blur-md border-b border-[rgb(var(--border-dark))]">
            <div className="flex items-center gap-4">
              <NotificationCenter />
              {user &&
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="justify-start h-auto p-2 text-left hover:bg-[rgb(var(--surface-dark))] rounded-full">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.profile_picture_url} />
                          <AvatarFallback>{(user.display_name || user.full_name)?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 mt-2" align="end">
                    <DropdownMenuLabel>{user.display_name || user.full_name || user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to={createPageUrl("Settings")}><Settings className="w-4 h-4 mr-2" />Settings</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to={createPageUrl("Upgrade")}><Crown className="w-4 h-4 mr-2" />Upgrade Plan</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-400 focus:bg-red-500/10"><LogOut className="w-4 h-4 mr-2" />Log Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
            </div>
          </div>

          {/* Page Content */}
          <div className="mobile-content lg:contents">
            <AnimatePresence mode="wait">
              <motion.div 
                key={location.pathname + location.search} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                transition={{ duration: 0.2 }} 
                className="flex-1"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Side Menu - Improved */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="lg:hidden fixed inset-0 bg-black/70 mobile-menu-overlay z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  mass: 1
                }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-[rgb(var(--border-dark))] z-50 shadow-2xl"
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-[rgb(var(--border-dark))]">
                    <div className="flex items-center justify-between">
                      <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d644f855b_smalllogo.png" 
                          alt="Editable Logo" 
                          className="w-10 h-10 rounded-lg"
                        />
                        <span className="text-xl font-bold text-white">Editable</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="hover:bg-violet-500/10 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <nav className="flex-1 p-3 space-y-1">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant="ghost"
                          className={`w-full justify-start items-center gap-3 h-10 px-3 text-sm font-normal rounded-lg transition-all duration-200 ease-in-out
                            ${activePath === item.url
                              ? 'text-white bg-violet-500/15 border-l-3 border-violet-400'
                              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                            }`
                          }
                        >
                          <item.icon className="w-4 h-4" />
                          <span className="font-normal text-sm">{item.title}</span>
                        </Button>
                      </Link>
                    ))}
                  </nav>

                  {user && (
                    <div className="p-3 border-t border-[rgb(var(--border-dark))]">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-700/30">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.profile_picture_url} />
                          <AvatarFallback className="bg-violet-500/20 text-white text-sm">
                            {(user.display_name || user.full_name)?.charAt(0) || user.email?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white text-sm truncate">
                            {user.display_name || user.full_name || user.email}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <Link to={createPageUrl("Settings")} onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white text-sm h-8">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                        </Link>
                        <Link to={createPageUrl("Upgrade")} onClick={() => setIsMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white text-sm h-8">
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade Plan
                          </Button>
                        </Link>
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm h-8"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Bottom Navigation - Glass Effect */}
        {currentPageName !== "Review" && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 h-20 glass-effect border-t border-[rgb(var(--border-dark))]/30 flex items-center justify-around pb-[env(safe-area-inset-bottom)] shadow-2xl">
            <BottomNavItem item={mobileNavItems[0]} isActive={currentPageName === "Projects"} />
            <Link to={createPageUrl("Import")} className="relative">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25" 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                style={{ marginTop: '-6px' }}
              >
                <Plus className="w-6 h-6" />
              </motion.div>
            </Link>
            <BottomNavItem item={mobileNavItems[1]} isActive={currentPageName === "Settings"} />
          </div>
        )}
      </div>
    </>);

}

export default function LayoutWrapper(props) {
  return (
    <UserProvider>
      <AppLayout {...props} />
    </UserProvider>);

}

