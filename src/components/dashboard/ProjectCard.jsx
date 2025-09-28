import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  Check,
  Clock,
  MoreHorizontal,
  Folder,
  Edit,
  Trash2,
  FolderKanban,
  Archive,
  TrendingUp,
  AlertCircle } from
"lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger } from
"@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export default function ProjectCard({ project, status, onArchiveProject }) {

  const getStatusConfig = () => {
    const configs = {
      active: {
        label: "Active",
        color: "text-violet-400",
        icon: <TrendingUp className="w-3 h-3" />,
        bgColor: "bg-violet-900/30"
      },
      pending: {
        label: "Pending Changes",
        color: "text-amber-400",
        icon: <AlertCircle className="w-3 h-3" />,
        bgColor: "bg-amber-900/30"
      },
      approved: {
        label: "Ready to Archive",
        color: "text-emerald-400",
        icon: <Check className="w-3 h-3" />,
        bgColor: "bg-emerald-900/30"
      },
      archived: {
        label: "Archived",
        color: "text-gray-400",
        icon: <Archive className="w-3 h-3" />,
        bgColor: "bg-gray-900/30"
      }
    };
    return configs[status] || configs.active;
  };

  const config = getStatusConfig();

  const getLastChangeDate = () => {
    if (!project.last_status_change_at) return new Date();

    const date = typeof project.last_status_change_at === 'string' ?
    parseISO(project.last_status_change_at) :
    new Date(project.last_status_change_at);

    return isValid(date) ? date : new Date();
  };

  const lastChangeDate = getLastChangeDate();

  return (
    <AlertDialog>
      <motion.div
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="h-full">

        <Card className="rounded-xl h-full shadow-md hover:shadow-lg hover:shadow-black/20 transition-all duration-200 border border-[rgb(var(--border-dark))] bg-[rgb(var(--surface-light))] overflow-hidden">
            <Link to={createPageUrl(`Project?id=${project.id}`)} className="block h-full">
              <CardContent className="bg-slate-900 p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center bg-[rgb(var(--surface-dark))]">
                      <FolderKanban className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="text-[rgb(var(--text-secondary))] hover:text-white focus-visible:ring-0">

                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                      align="end"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}>

                        <DropdownMenuItem asChild>
                           <Link to={createPageUrl(`Project?id=${project.id}`)} className="flex items-center">
                             <Edit className="w-4 h-4 mr-2" />
                             View Project
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                          className="text-red-500 focus:text-red-400 flex items-center"
                          onSelect={(e) => e.preventDefault()}>

                             <Archive className="w-4 h-4 mr-2" />
                             Archive Project
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="font-bold text-white truncate pr-2">
                      {project.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-[rgb(var(--text-secondary))]" />
                      <span className="text-sm text-[rgb(var(--text-secondary))] truncate">{project.client_display_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[rgb(var(--border-dark))]">
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bgColor} ${config.color}`}>
                        {config.icon}
                        <span className="font-medium text-xs">{config.label}</span>
                    </div>
                      <p className="text-xs text-[rgb(var(--text-secondary))] font-medium ml-auto">
                        {formatDistanceToNowStrict(lastChangeDate)} ago
                    </p>
                </div>
              </CardContent>
            </Link>
          </Card>
      </motion.div>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the project to the "Archived" section. You can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
            onClick={() => onArchiveProject(project.id)}
            className="bg-destructive hover:bg-destructive/90">

              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>);

}