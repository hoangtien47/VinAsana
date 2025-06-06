import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DonutChart, type ValueType } from "@/components/ui/donut-chart";

interface TaskStatusData {
  name: string;
  value: number;
  color: string;
}

interface TaskOverviewProps {
  statusDistribution: TaskStatusData[];
  priorityDistribution: TaskStatusData[];
}

export function TaskOverview({ statusDistribution, priorityDistribution }: TaskOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Task Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Status Distribution</h4>
            <div className="h-[300px]">
              <DonutChart
                data={statusDistribution}
                category="value"
                index="name"
                valueFormatter={(value: ValueType) => `${value} tasks`}
                className="h-full w-full"
                colors={statusDistribution.map((item) => item.color)}
                showLabel={false}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {statusDistribution.map((status) => (
                <div key={status.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  ></div>
                  <span className="text-xs">
                    {status.name} ({status.value})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Priority Distribution</h4>
            <div className="h-[300px]">
              <DonutChart
                data={priorityDistribution}
                category="value"
                index="name"
                valueFormatter={(value: ValueType) => `${value} tasks`}
                className="h-full w-full"
                colors={priorityDistribution.map((item) => item.color)}
                showLabel={false}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {priorityDistribution.map((priority) => (
                <div key={priority.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: priority.color }}
                  ></div>
                  <span className="text-xs">
                    {priority.name} ({priority.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
