import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectPipelineProps {
  pipeline: {
    counts: {
      lead: number;
      quote: number;
      active: number;
      completed: number;
    };
    values: {
      lead: number;
      quote: number;
      active: number;
      completed: number;
    };
  };
}

export function ProjectPipeline({ pipeline }: ProjectPipelineProps) {
  const stages = [
    { key: "lead", label: "Leads", color: "bg-gray-500" },
    { key: "quote", label: "Quotes", color: "bg-blue-500" },
    { key: "active", label: "Active", color: "bg-green-500" },
    { key: "completed", label: "Completed", color: "bg-purple-500" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stages.map((stage) => {
            const count = pipeline.counts[stage.key];
            const value = pipeline.values[stage.key];
            return (
              <div key={stage.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {stage.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500">
                      ${value.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${stage.color} h-2 rounded-full transition-all`}
                    style={{
                      width: `${count > 0 ? (count / 20) * 100 : 0}%`,
                      maxWidth: "100%",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
