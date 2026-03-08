import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, X, CheckCircle } from "lucide-react";

export default function SecurityUpgradeNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);

  useEffect(() => {
    // Check if user has localStorage token (old system) and cookies are available
    const hasOldToken = !!localStorage.getItem('token');
    const hasNoticeBeenDismissed = localStorage.getItem('security-upgrade-dismissed');
    
    // Show notice if user has old token and hasn't dismissed the notice
    if (hasOldToken && !hasNoticeBeenDismissed && !isUpgraded) {
      setIsVisible(true);
    }
  }, [isUpgraded]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('security-upgrade-dismissed', 'true');
  };

  const handleUpgrade = () => {
    setIsUpgraded(true);
    setIsVisible(false);
    localStorage.setItem('security-upgrade-dismissed', 'true');
    
    // The upgrade is automatic - cookies are already being set by the server
    // This just acknowledges the user understands the change
  };

  if (!isVisible) return null;

  return (
    <Card className="mb-6 bg-blue-900/20 border-blue-500/30">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-2">
              Security Upgrade Available
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              We've upgraded your account security! Your authentication now uses secure HTTP-only cookies 
              instead of localStorage, providing better protection against XSS attacks. 
              You can now manage your active sessions and logout from all devices.
            </p>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={handleUpgrade}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Got it
              </Button>
              
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}