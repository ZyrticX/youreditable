import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";

export default function ApprovalSection({ onApprove, isApproved, isSubmitting }) {
  if (isApproved) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
        <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
        <p className="font-medium text-green-800">Video Approved</p>
        <p className="text-sm text-green-600 mt-1">
          Thank you for your approval!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h4 className="font-medium text-slate-900 mb-2">Ready to approve?</h4>
        <p className="text-sm text-slate-600 mb-4">
          Once approved, this video version will be marked as final
        </p>
      </div>
      
      <Button
        onClick={onApprove}
        disabled={isSubmitting}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        {isSubmitting ? (
          <>
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            Approving...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve This Video
          </>
        )}
      </Button>
    </div>
  );
}