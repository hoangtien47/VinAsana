import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, formatDateTime } from "@/lib/utils";

type ActivityType = 'task_created' | 'task_completed' | 'comment_added' | 'document_uploaded' | 'user_joined';

interface Activity {
  id: number;
  type: ActivityType;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  description: string;
  timestamp: string;
  project: {
    id: number;
    name: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'task_created':
      return (
        <div className="rounded-full p-1 bg-blue-100 text-blue-600">
          <PlusCircleIcon className="h-3 w-3" />
        </div>
      );
    case 'task_completed':
      return (
        <div className="rounded-full p-1 bg-green-100 text-green-600">
          <CheckCircleIcon className="h-3 w-3" />
        </div>
      );
    case 'comment_added':
      return (
        <div className="rounded-full p-1 bg-purple-100 text-purple-600">
          <MessageCircleIcon className="h-3 w-3" />
        </div>
      );
    case 'document_uploaded':
      return (
        <div className="rounded-full p-1 bg-orange-100 text-orange-600">
          <FileIcon className="h-3 w-3" />
        </div>
      );
    case 'user_joined':
      return (
        <div className="rounded-full p-1 bg-teal-100 text-teal-600">
          <UserPlusIcon className="h-3 w-3" />
        </div>
      );
    default:
      return null;
  }
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                  <AvatarFallback>{getInitials(activity.user.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">{activity.user.name}</p>
                      <div className="ml-2">{getActivityIcon(activity.type)}</div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    In <span className="font-medium">{activity.project.name}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function MessageCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function PlusCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

function UserPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}
