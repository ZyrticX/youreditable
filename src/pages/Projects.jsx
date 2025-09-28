
import React, { useState, useEffect, useRef } from "react";
import { Project } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Plus,
  RefreshCw,
  FolderPlus,
  AlertCircle // Added AlertCircle import
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from '../components/auth/UserProvider';
import { toast } from "sonner";
import ProjectGrid from "../components/dashboard/ProjectGrid";

// Define project limits based on plan tiers
const PLAN_PROJECT_LIMITS = {
  free: 3,
  basic: 12,
  pro: Infinity // Unlimited for Pro users
};

const filterTitles = {
    all: "All Projects",
    active: "Active Projects",
    pending: "Pending Changes",
    approved: "Ready to Archive",
    archived: "Archived Projects"
};

// Helper function to add delay between API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

export default function ProjectsPage() {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useUser();
  const loadingRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !loadingRef.current) {
        loadProjectsData();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get("filter") || "all";
    setCurrentFilter(filter);

    let newFilteredProjects = [];
    if (filter === "all") {
      newFilteredProjects = projects.filter(p => p.status !== 'archived');
    } else {
      newFilteredProjects = projects.filter(p => p.status === filter);
    }
    setFilteredProjects(newFilteredProjects);
  }, [location.search, projects]);

  const loadProjectsData = async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const userProjects = await retryApiCall(() => Project.filter({ user_id: user.id }, "-created_at"));
      setProjects(userProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      if (error.response?.status === 429) {
        setError("Too many requests. Please wait a moment and try again.");
      } else {
        setError("Failed to load projects");
      }
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  };

  const handleArchiveProject = async (projectId) => {
    try {
      if (!user || !user.id) {
          toast.error("User information not available. Cannot archive project.");
          return;
      }
      
      const projectToArchive = projects.find(p => p.id === projectId);
      if (!projectToArchive || projectToArchive.user_id !== user.id) {
        toast.error("Access denied: You can only archive your own projects");
        return;
      }

      await retryApiCall(() => Project.update(projectId, { 
          status: 'archived', 
          archived_at: new Date().toISOString(),
          last_status_change_at: new Date().toISOString()
      }));
      
      toast.success("Project archived successfully.");
      await delay(500);
      loadProjectsData();
    } catch (error) {
      toast.error("Failed to archive project.");
      console.error("Failed to archive project", error);
    }
  };

  const getProjectStatus = (project) => project.status || 'active';

  // Calculate project usage (non-archived projects count towards limit)
  const activeProjects = projects.filter((p) => p.status !== 'archived');
  const userPlan = user?.plan_level || 'free';
  const maxProjects = PLAN_PROJECT_LIMITS[userPlan] || PLAN_PROJECT_LIMITS.free; // Fallback to free if plan_level is unrecognized
  const projectsUsed = activeProjects.length;
  const canCreateProject = maxProjects === Infinity || projectsUsed < maxProjects;

  return (
    <div className="p-4 sm:p-6 lg:p-8 dark">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">{filterTitles[currentFilter] || "Projects"}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-[rgb(var(--text-secondary))]">Manage and review your video projects.</p>
                  {maxProjects !== Infinity && (
                    <div className="text-sm text-[rgb(var(--text-secondary))]">
                      <span className="font-medium text-white">{projectsUsed}</span>
                      <span className="mx-1">of</span>
                      <span className="font-medium text-white">{maxProjects}</span>
                      <span className="ml-1">projects used</span>
                    </div>
                  )}
                </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Link to={createPageUrl("Import")}>
                  <Button 
                    className={`min-h-[44px] rounded-lg font-medium ${
                      canCreateProject 
                        ? 'bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow' 
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!canCreateProject}
                  >
                      <Plus className="w-5 h-5 mr-2" />
                      New Project
                  </Button>
              </Link>
              {!canCreateProject && (
                <p className="text-xs text-red-400">Project limit reached. Archive projects or upgrade your plan.</p>
              )}
            </div>
        </header>

        {/* Project Limit Warning */}
        {maxProjects !== Infinity && projectsUsed >= maxProjects && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <h3 className="text-red-200 font-medium">Project Limit Reached</h3>
                <p className="text-red-300 text-sm mt-1">
                  You've reached your {maxProjects}-project limit on the {userPlan} plan. 
                  {projects.filter(p => p.status === 'archived').length > 0 && 
                    ` Archive old projects to free up space, or upgrade for more projects.`
                  }
                  {projects.filter(p => p.status === 'archived').length === 0 && 
                    ` Upgrade your plan to create more projects.`
                  }
                </p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30">
                Upgrade Plan
              </Button>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Array(6).fill(0).map((_, i) => (
                        <Card key={i} className="rounded-xl border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))]"><CardContent className="p-5"><div className="flex gap-4 animate-pulse"><div className="w-12 h-12 bg-[rgb(var(--surface-dark))] rounded-lg"/><div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4 bg-[rgb(var(--surface-dark))]"/><Skeleton className="h-4 w-1/2 bg-[rgb(var(--surface-dark))]"/></div></div></CardContent></Card>
                    ))}
                </motion.div>
            ) : error ? (
                 <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                    <h2 className="text-2xl font-bold text-white mb-2">Unable to Load Projects</h2>
                    <p className="text-[rgb(var(--text-secondary))] mb-6">{error}</p>
                    <Button onClick={loadProjectsData} disabled={isLoading} className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white accent-glow"><RefreshCw className="w-4 h-4 mr-2"/>Try Again</Button>
                </motion.div>
            ) : filteredProjects.length > 0 ? (
                <ProjectGrid
                    key="projects"
                    projects={filteredProjects}
                    getProjectStatus={getProjectStatus}
                    onArchiveProject={handleArchiveProject}
                />
            ) : (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card className="rounded-xl border-dashed border-2 border-[rgb(var(--border-dark))] bg-transparent">
                        <CardContent className="text-center py-16 px-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-violet-500/10 rounded-full flex items-center justify-center"><FolderPlus className="w-8 h-8 text-[rgb(var(--accent-primary))]"/></div>
                            <h3 className="text-xl font-bold mb-2 text-white">No projects in this category</h3>
                            <p className="text-[rgb(var(--text-secondary))] mb-6 max-w-md mx-auto">
                              {currentFilter === 'all' && !canCreateProject
                                ? `You've reached your ${maxProjects}-project limit. Archive projects or upgrade to create new ones.`
                                : 'Create a new project or check another filter.'
                              }
                            </p>
                            {canCreateProject ? (
                              <Link to={createPageUrl("Import")}><Button className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 text-white min-h-[48px] px-8 rounded-lg font-medium accent-glow"><Plus className="w-5 h-5 mr-2" />Create Project</Button></Link>
                            ) : (
                              <Button variant="outline" className="bg-[rgb(var(--surface-light))] hover:bg-[rgb(var(--surface-dark))] border-[rgb(var(--border-dark))]">
                                Upgrade Plan
                              </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
