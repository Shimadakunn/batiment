import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhoneIcon, MailIcon, UsersIcon, MapPinIcon, FileTextIcon } from "lucide-react";

interface Activity {
  _id: string;
  type: "call" | "email" | "meeting" | "site_visit" | "note";
  subject: string;
  notes?: string;
  date: number;
  contactName?: string;
  projectTitle?: string;
  userName?: string;
}

interface RecentActivitiesProps {
  activities: Activity[];
}

const activityIcons = {
  call: PhoneIcon,
  email: MailIcon,
  meeting: UsersIcon,
  site_visit: MapPinIcon,
  note: FileTextIcon,
};

const activityColors = {
  call: "bg-blue-100 text-blue-700",
  email: "bg-purple-100 text-purple-700",
  meeting: "bg-green-100 text-green-700",
  site_visit: "bg-orange-100 text-orange-700",
  note: "bg-gray-100 text-gray-700",
};

export function RecentActivities({ activities }: RecentActivitiesProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No activities yet. Start by adding contacts and projects!
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <div key={activity._id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${activityColors[activity.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {activity.contactName && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.contactName}
                        </Badge>
                      )}
                      {activity.projectTitle && (
                        <Badge variant="outline" className="text-xs">
                          {activity.projectTitle}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.userName} · {formatDate(activity.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
