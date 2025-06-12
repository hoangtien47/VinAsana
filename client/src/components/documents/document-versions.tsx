import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Clock, 
  Download, 
  User, 
  Star,
  Loader2,
  AlertCircle 
} from "lucide-react";
import { useDocument, Document, DocumentVersion } from "@/hooks/use-document";
import { useUser, ApiUser } from "@/hooks/use-user";

interface DocumentVersionsProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
}

export function DocumentVersions({
  document,
  open,
  onClose,
}: DocumentVersionsProps) {
  const { useDocumentVersions, getDocumentDownloadUrl } = useDocument();
  const { getUser } = useUser();
  const [userCache, setUserCache] = useState<Record<string, ApiUser | null>>({});
  const fetchingUsers = useRef<Set<string>>(new Set());
  const attemptedFetch = useRef<Set<string>>(new Set());
  
  const {
    data: versions,
    isLoading,
    error,
    refetch
  } = useDocumentVersions(document?.key || "");

  // Fetch user data when versions change
  useEffect(() => {
    if (!versions || versions.length === 0) return;
    
    const fetchUsers = async () => {
      for (const version of versions) {
        const userId = version.modifiedBy;
        
        // Skip if we already attempted to fetch this user or are currently fetching
        if (attemptedFetch.current.has(userId) || fetchingUsers.current.has(userId)) {
          continue;
        }
        
        // Mark as attempted and being fetched
        attemptedFetch.current.add(userId);
        fetchingUsers.current.add(userId);
        
        try {
          const user = await getUser(userId);
          setUserCache(prev => ({
            ...prev,
            [userId]: user
          }));
        } catch (error) {
          console.error(`Failed to fetch user ${userId}:`, error);
          setUserCache(prev => ({
            ...prev,
            [userId]: null
          }));
        } finally {
          // Remove from fetching set
          fetchingUsers.current.delete(userId);
        }
      }
    };
    
    fetchUsers();
  }, [versions, getUser]);

  // Clear cache when dialog closes to prevent stale data
  useEffect(() => {
    if (!open) {
      setUserCache({});
      fetchingUsers.current.clear();
      attemptedFetch.current.clear();
    }
  }, [open]);
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return "Less than an hour ago";
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      
      const diffInWeeks = Math.floor(diffInDays / 7);
      if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
      
      const diffInMonths = Math.floor(diffInDays / 30);
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    } catch {
      return "Unknown date";
    }
  };

  const formatFullDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch {
      return "Unknown date";
    }
  };
  const getUserId = (modifiedBy: string) => {
    // Extract user ID from Auth0 format (auth0|userId -> userId)
    return modifiedBy.replace("auth0|", "").substring(0, 8);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };
  const UserInfo = ({ userId }: { userId: string }) => {
    const user = userCache[userId];
    
    // Show loading state if user is not in cache yet
    if (user === undefined) {
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              <Loader2 className="h-3 w-3 animate-spin" />
            </AvatarFallback>
          </Avatar>
          <span>Loading user...</span>
        </div>
      );
    }
    
    // Show fallback if user fetch failed
    if (!user) {
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <span>Modified by {getUserId(userId)}</span>
        </div>
      );
    }

    const displayName = user.nickname || user.email?.split('@')[0] || 'Unknown User';
    
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          {user.avatar ? (
            <AvatarImage src={user.avatar} alt={displayName} />
          ) : null}
          <AvatarFallback className="text-xs">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </div>
    );
  };
  const handleVersionDownload = async (versionId: string) => {
    if (!document) return;
    
    try {
      // Use the new presigned URL function with version support
      const downloadUrl = await getDocumentDownloadUrl(document.key, versionId);
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Failed to get download URL for version:", error);
      // Fallback to original method
      const downloadUrl = `${document.url}?versionId=${versionId}`;
      window.open(downloadUrl, "_blank");
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Version History - {document.key}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading version history...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>Failed to load version history</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          )}

          {versions && versions.length > 0 && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div key={version.versionId}>
                    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex-grow space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={version.isLatest ? "default" : "secondary"}>
                            {version.isLatest ? (
                              <>
                                <Star className="h-3 w-3 mr-1" />
                                Latest Version
                              </>
                            ) : (
                              `Version ${versions.length - index}`
                            )}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(version.lastModified)}
                          </span>
                        </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <UserInfo userId={version.modifiedBy} />
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatFullDate(version.lastModified)}</span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground font-mono">
                          Version ID: {version.versionId}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVersionDownload(version.versionId)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    {index < versions.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {versions && versions.length === 0 && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Clock className="h-6 w-6 mr-2" />
              <span>No version history available</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {versions?.length || 0} version{versions?.length !== 1 ? 's' : ''} found
          </span>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
