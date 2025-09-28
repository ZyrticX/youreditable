import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  ArrowLeft, 
  Loader2,
  Rocket
} from "lucide-react";

export default function ProjectSettings({ 
  projectName, 
  setProjectName, 
  clientName, 
  setClientName,
  onCreateProject,
  onBack,
  isLoading 
}) {
  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-0">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
          <Settings className="w-8 h-8 text-purple-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">
          Project Settings
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Configure your project details and client information
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium text-slate-700">
              Project Name *
            </Label>
            <Input
              id="project-name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Brand Commercial Q1 2024"
              className="h-12"
            />
            <p className="text-xs text-slate-500">
              This will be visible to you in the dashboard
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-name" className="text-sm font-medium text-slate-700">
              Client Display Name *
            </Label>
            <Input
              id="client-name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Acme Corporation"
              className="h-12"
            />
            <p className="text-xs text-slate-500">
              This name will be shown to reviewers on the review page
            </p>
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
          <h4 className="font-semibold text-slate-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Your project will be created with all imported videos</li>
            <li>• A secure 7-day review link will be generated</li>
            <li>• You can share the link with clients for feedback</li>
            <li>• Clients can leave time-stamped notes without signing up</li>
          </ul>
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button 
            onClick={onCreateProject}
            disabled={!projectName.trim() || !clientName.trim() || isLoading}
            className="gradient-bg text-white hover:opacity-90 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}