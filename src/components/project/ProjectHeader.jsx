
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Save, Edit, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProjectHeader({ project, onProjectUpdate, onApproveProject, isArchived }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    client_display_name: ''
  });

  // Effect to initialize editForm when project data is available or changes
  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name,
        client_display_name: project.client_display_name
      });
    }
  }, [project]); // Dependency array: re-run when 'project' object changes

  const handleSave = async () => {
    if (onProjectUpdate) {
      // Assuming onProjectUpdate is a function provided by the parent
      // that handles the actual update logic (e.g., API call)
      const projectData = { name: editForm.name, client_display_name: editForm.client_display_name };
      await onProjectUpdate(project.id, projectData);
      setIsEditing(false); // Exit edit mode after successful save
    }
  };

  // Helper function to determine status badge configuration
  const getStatusConfig = () => {
    let badgeClass = "";
    let label = "";
    // Note: The outline does not explicitly show an icon in the status badge,
    // but the previous component used it. For consistency with outline, only label is used.
    // If icons are desired, import them from lucide-react and include them here.

    switch (project?.status) {
      case 'active':
        badgeClass = "bg-green-500 text-white";
        label = "Active";
        break;
      case 'pending':
        badgeClass = "bg-yellow-500 text-black";
        label = "Pending";
        break;
      case 'approved':
        badgeClass = "bg-blue-500 text-white";
        label = "Approved";
        break;
      case 'archived':
        badgeClass = "bg-gray-700 text-gray-300"; // This might be redundant as isArchived has its own badge
        label = "Archived";
        break;
      default:
        badgeClass = "bg-gray-500 text-white";
        label = "Unknown";
    }
    return { badgeClass, label };
  };

  // Display a loading skeleton if project data is not yet available
  if (!project) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-[rgb(var(--surface-light))] rounded w-1/3 mb-4"></div>
        <div className="h-6 bg-[rgb(var(--surface-light))] rounded w-1/4"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          {isEditing && !isArchived ? (
            <div className="space-y-4 max-w-2xl">
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-2xl font-bold h-auto py-2 bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]"
                placeholder="Project name"
              />
              <Input
                value={editForm.client_display_name}
                onChange={(e) => setEditForm({ ...editForm, client_display_name: e.target.value })}
                className="bg-[rgb(var(--surface-light))] border-[rgb(var(--border-dark))]"
                placeholder="Client display name"
              />
            </div>
          ) : (
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {project.name}
                {isArchived && (
                  <Badge className="ml-3 bg-gray-700 text-gray-300">Archived</Badge>
                )}
              </h1>
              <div className="flex items-center gap-4 text-[rgb(var(--text-secondary))] flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{project.client_display_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {format(new Date(project.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col sm:w-auto sm:flex-row items-stretch sm:items-center gap-3">
          {!isArchived && (
            <>
              {isEditing ? (
                <div className="flex gap-2 w-full sm:w-auto"> {/* Added w-full sm:w-auto for flex container of buttons*/}
                  <Button
                    onClick={() => {
                        setIsEditing(false);
                        // Reset form fields to original project values if editing is cancelled
                        setEditForm({
                            name: project.name,
                            client_display_name: project.client_display_name
                        });
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm" className="bg-[rgb(var(--accent-primary))] hover:bg-violet-600 flex-1 sm:flex-none">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto"> {/* Added w-full sm:w-auto for flex container of buttons*/}
                  {project.status !== 'approved' && (
                    <Button onClick={onApproveProject} size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-grow">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Project
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="text-[rgb(var(--text-secondary))] hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Display Project Status Badge */}
          {project?.status && (
            <Badge className={`${getStatusConfig().badgeClass} justify-center py-2 sm:py-1`}>
              <div className="flex items-center gap-1">
                {getStatusConfig().label}
              </div>
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
