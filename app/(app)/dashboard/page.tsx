"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { ProjectPipeline } from "@/components/dashboard/project-pipeline";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const currentUser = useQuery(api.users.current);
  const teams = useQuery(api.teams.list);

  const teamId = teams?.[0]?._id;

  const stats = useQuery(
    api.dashboard.getStats,
    teamId ? { teamId } : "skip"
  );
  const activities = useQuery(
    api.dashboard.getRecentActivities,
    teamId ? { teamId, limit: 10 } : "skip"
  );
  const pipeline = useQuery(
    api.dashboard.getProjectsPipeline,
    teamId ? { teamId } : "skip"
  );

  if (!currentUser || !teams) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600">No team found. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {currentUser.name || currentUser.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/contacts/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              New Contact
            </Button>
          </Link>
          <Link href="/projects/new">
            <Button variant="outline">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {stats && <StatsCards stats={stats} />}

      <div className="grid gap-6 md:grid-cols-2">
        {activities && <RecentActivities activities={activities} />}
        {pipeline && <ProjectPipeline pipeline={pipeline} />}
      </div>
    </div>
  );
}
