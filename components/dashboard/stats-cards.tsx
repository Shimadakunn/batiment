import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersIcon, BriefcaseIcon, CheckCircleIcon, DollarSignIcon } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalContacts: number;
    activeProjects: number;
    pendingTasks: number;
    totalValue: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Contacts",
      value: stats.totalContacts,
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      icon: BriefcaseIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: CheckCircleIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Total Value",
      value: `$${stats.totalValue.toLocaleString()}`,
      icon: DollarSignIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`${card.bgColor} p-2 rounded-lg`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
