
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Project } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  FolderPlus,
  RefreshCw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useUser } from '../components/auth/UserProvider';
import { toast } from "sonner";
import AnalyticsDashboard from "../components/dashboard/AnalyticsDashboard";
import ProjectReminders from "../components/dashboard/ProjectReminders";

// Define project limits based on plan tiers
const PLAN_PROJECT_LIMITS = {
  free: 3,
  basic: 12,
  pro: Infinity // Unlimited for Pro users
};

// Helper function to add delay between API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to retry API calls with exponential backoff
const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.response?.status === 429 && attempt < maxRetries) {
        const delayMs = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Rate limit hit, retrying in ${delayMs}ms (attempt ${attempt}/${maxRetries})`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
};

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useUser();
  const loadingRef = useRef(false);

  const loadAnalyticsData = useCallback(async () => {
    if (loadingRef.current || !user) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const userProjects = await retryApiCall(() => Project.filter({ user_id: user.id }, "-created_date"));
      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading analytics data:", error);
      if (error.response?.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
        toast.error("Rate limit exceeded. Please wait a moment before refreshing.");
      } else {
        setError("Failed to load analytics data");
        toast.error("Failed to load analytics data");
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user && !loadingRef.current) {
      // Safety logic: Ensure display_user_id is set
      if (!user.display_user_id) {
        // Asynchronously update user data without blocking the render or API call
        // This will trigger a re-render of UserProvider and then this component
        User.updateMyUserData({ display_user_id: user.id });
      }
      loadAnalyticsData();
    }
  }, [user, isAuthenticated, loadAnalyticsData]);

  const greeting = `Welcome back${user ? ", " + (user.full_name?.split(' ')[0] || user.email.split('@')[0]) : ''}!`;

  // Calculate project usage (non-archived projects count towards limit)
  const activeProjects = projects.filter((p) => p.status !== 'archived');
  const userPlan = user?.plan_level || 'free';
  const maxProjects = PLAN_PROJECT_LIMITS[userPlan];
  const projectsUsed = activeProjects.length;

  const analyticsData = {
    total: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    pending: projects.filter((p) => p.status === 'pending').length,
    approved: projects.filter((p) => p.status === 'approved').length,
    archived: projects.filter((p) => p.status === 'archived').length
  };

  if (error && !isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 dark text-center py-16">
        <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Dashboard</h2>
        <p className="text-[rgb(var(--text-secondary))] mb-6">{error}</p>
        <Button onClick={loadAnalyticsData} disabled={isLoading} className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow">
          {isLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Retrying...</> : <><RefreshCw className="w-4 h-4 mr-2" /> Try Again</>}
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 text-zinc-50 p-4 sm:p-6 lg:p-8 dark">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{greeting}</h1>
          <p className="text-[rgb(var(--text-secondary))] mt-1">Here's an overview of your projects.</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Project Usage Indicator */}
          {maxProjects !== Infinity && (
            <div className="text-sm text-[rgb(var(--text-secondary))]">
              <span className="font-medium text-white">{projectsUsed}</span>
              <span className="mx-1">of</span>
              <span className="font-medium text-white">{maxProjects}</span>
              <span className="ml-1">projects used</span>
            </div>
          )}
          <Link to={createPageUrl("Import")}>
            <Button
              className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white min-h-[44px] rounded-lg font-medium accent-glow"
              disabled={maxProjects !== Infinity && projectsUsed >= maxProjects}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </Button>
          </Link>
        </div>
      </header>

      <div className="space-y-8">
        {/* Project Limit Card - Only show for non-Pro users */}
        {maxProjects !== Infinity && (
          <Card className="bg-transparent border-0 shadow-none">
            <CardContent className="p-0">
              <div className={`rounded-xl p-6 border ${
                projectsUsed >= maxProjects
                  ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30'
                  : 'bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-[rgb(var(--border-dark))]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
                      projectsUsed >= maxProjects ? 'bg-red-500/20' : 'bg-violet-500/20'
                    }`}>
                      <FolderPlus className={`w-8 h-8 ${
                        projectsUsed >= maxProjects ? 'text-red-400' : 'text-[rgb(var(--accent-primary))]'
                      }`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {projectsUsed >= maxProjects ? 'Project Limit Reached' : 'Project Usage'}
                      </h2>
                      <p className="text-[rgb(var(--text-secondary))]">
                        {projectsUsed >= maxProjects
                          ? `You're using all ${maxProjects} projects on your ${userPlan} plan. Archive old projects or upgrade for more space.`
                          : `You're using ${projectsUsed} of ${maxProjects} projects on your ${userPlan} plan.`
                        }
                      </p>
                      {projects.filter(p => p.status === 'archived').length > 0 && (
                        <p className="text-xs text-green-400 mt-1">
                          💡 {projects.filter(p => p.status === 'archived').length} archived projects don't count towards your limit
                        </p>
                      )}
                    </div>
                  </div>
                  {projectsUsed >= maxProjects && (
                    <Button variant="outline" className="bg-[rgb(var(--surface-light))] hover:bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))]">
                      Upgrade Plan
                    </Button>
                  )}
                </div>
                {maxProjects !== Infinity && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[rgb(var(--text-secondary))]">Usage</span>
                      <span className="text-white font-medium">{projectsUsed}/{maxProjects}</span>
                    </div>
                    <div className="w-full bg-[rgb(var(--surface-dark))] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          projectsUsed >= maxProjects ? 'bg-red-500' : 'bg-[rgb(var(--accent-primary))]'
                        }`}
                        style={{ width: `${Math.min((projectsUsed / maxProjects) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <AnalyticsDashboard
          data={analyticsData}
          projects={projects}
          isLoading={isLoading} />

        <ProjectReminders />

        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 p-6 border border-[rgb(var(--border-dark))]">
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-16 h-16 rounded-xl bg-cover bg-center hidden sm:block"
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop')" }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }} />

                <div>
                  <h2 className="text-xl font-bold text-white">Start a New Review</h2>
                  <p className="text-[rgb(var(--text-secondary))]">Import videos from Google Drive to get feedback.</p>
                </div>
              </div>
              <Link to={createPageUrl("Import")}>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex bg-[rgb(var(--surface-light))] hover:bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))] btn-shadow"
                  disabled={maxProjects !== Infinity && projectsUsed >= maxProjects}
                >
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create from Drive
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
