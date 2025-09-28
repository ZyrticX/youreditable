import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  FileVideo
} from "lucide-react";

export default function VideoPreview({ videos, projectName, onNext, onBack }) {
  return (
    <Card className="max-w-4xl mx-auto shadow-lg border-0">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900">
          Videos Found
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Review the videos that will be imported into your project
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-blue-900">Project: {projectName}</h3>
          <p className="text-blue-700 text-sm mt-1">
            {videos.length} video{videos.length !== 1 ? 's' : ''} will be imported
          </p>
        </div>

        <div className="space-y-3">
          {videos.map((video, index) => (
            <div 
              key={video.id}
              className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors duration-200"
            >
              <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center">
                <FileVideo className="w-5 h-5 text-slate-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 truncate">
                  {video.name.replace(/\.[^/.]+$/, "")}
                </h4>
                <p className="text-sm text-slate-500">
                  Version 1 • Google Drive
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  #{index + 1}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => window.open(video.previewUrl, '_blank')}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-6 border-t border-slate-200">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <Button 
            onClick={onNext}
            className="gradient-bg text-white hover:opacity-90 flex items-center gap-2"
          >
            Continue Setup
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}