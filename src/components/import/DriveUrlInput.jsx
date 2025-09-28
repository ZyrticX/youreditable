import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FolderOpen, 
  ExternalLink,
  Info,
  Loader2
} from "lucide-react";

export default function DriveUrlInput({ driveUrl, setDriveUrl, onSubmit, isLoading }) {
  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-0">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 gradient-bg rounded-2xl flex items-center justify-center">
          <FolderOpen className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">
          Connect Google Drive Folder
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Import videos from your Google Drive folder to create a review project
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            Make sure your Google Drive folder is publicly accessible or shared with the appropriate permissions.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Label htmlFor="drive-url" className="text-sm font-medium text-slate-700">
            Google Drive Folder URL
          </Label>
          <div className="relative">
            <Input
              id="drive-url"
              type="url"
              placeholder="https://drive.google.com/drive/folders/1A2B3C4D5E6F..."
              value={driveUrl}
              onChange={(e) => setDriveUrl(e.target.value)}
              className="pr-12 h-12 text-sm"
            />
            <ExternalLink className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">
            Paste the full URL of your Google Drive folder containing the video files
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Supported URL formats:</h4>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg">
              <code className="text-xs">https://drive.google.com/drive/folders/[FOLDER_ID]</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <code className="text-xs">https://drive.google.com/drive/u/0/folders/[FOLDER_ID]</code>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <code className="text-xs">[FOLDER_ID] (just the ID)</code>
            </div>
          </div>
        </div>

        <Button 
          onClick={onSubmit}
          disabled={!driveUrl.trim() || isLoading}
          className="w-full h-12 gradient-bg text-white hover:opacity-90 text-base font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Connecting to Drive...
            </>
          ) : (
            <>
              <FolderOpen className="w-5 h-5 mr-2" />
              Import Videos
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}