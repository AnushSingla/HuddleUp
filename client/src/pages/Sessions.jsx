import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessions, revokeSession, logoutAll } from '../utils/auth';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PageMeta from '@/components/PageMeta';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Shield, 
  Trash2, 
  LogOut,
  Clock,
  MapPin
} from "lucide-react";
import { toast } from 'sonner';

const getDeviceIcon = (userAgent) => {
  if (!userAgent) return Globe;
  
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return Smartphone;
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return Tablet;
  }
  return Monitor;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const formatLocation = (ipAddress) => {
  // In a real app, you might use a geolocation service
  return ipAddress || 'Unknown location';
};

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const sessionData = await getSessions();
      setSessions(sessionData);
    } catch (error) {
      toast.error('Failed to load sessions');
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    setRevoking(prev => new Set(prev).add(sessionId));
    
    try {
      const success = await revokeSession(sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast.success('Session revoked successfully');
      } else {
        toast.error('Failed to revoke session');
      }
    } catch (error) {
      toast.error('Failed to revoke session');
      console.error('Error revoking session:', error);
    } finally {
      setRevoking(prev => {
        const newSet = new Set(prev);
        newSet.delete(sessionId);
        return newSet;
      });
    }
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAll();
      toast.success('Logged out from all devices');
      // logoutAll() handles the redirect
    } catch (error) {
      toast.error('Failed to logout from all devices');
      console.error('Error logging out from all devices:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <PageMeta 
        title="Active Sessions" 
        description="Manage your active sessions and security settings" 
      />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Active Sessions</h1>
          <p className="text-gray-400">
            Manage your active sessions across all devices. You can revoke access to any device you don't recognize.
          </p>
        </div>

        <div className="space-y-6">
          {/* Security Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleLogoutAll}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout All Devices
                </Button>
                <Button
                  onClick={() => navigate('/profile')}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Back to Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sessions List */}
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="py-8 text-center">
                  <p className="text-gray-400">No active sessions found.</p>
                </CardContent>
              </Card>
            ) : (
              sessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.userAgent);
                const isCurrentSession = session.isCurrent;
                
                return (
                  <Card 
                    key={session.id} 
                    className={`bg-gray-800 border-gray-700 ${isCurrentSession ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-gray-700 rounded-lg">
                            <DeviceIcon className="w-6 h-6 text-gray-300" />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-white font-medium">
                                {session.userAgent || 'Unknown Device'}
                              </h3>
                              {isCurrentSession && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                                  Current Session
                                </span>
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-400">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Last active: {formatDate(session.lastUsed)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{formatLocation(session.ipAddress)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                <span>Created: {formatDate(session.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {!isCurrentSession && (
                          <Button
                            onClick={() => handleRevokeSession(session.id)}
                            disabled={revoking.has(session.id)}
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            {revoking.has(session.id) ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Revoking...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Revoke
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}