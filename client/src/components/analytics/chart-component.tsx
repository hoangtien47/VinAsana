import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AreaChart,
  BarChart,
  LineChart,
  PieChart,
  Area,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  type ValueType
} from "@/components/ui/recharts";

export type ChartData = {
  name: string;
  value: number;
  color?: string;
}[];

export type TimeSeriesData = {
  date: string;
  [key: string]: number | string;
}[];

interface ChartComponentProps {
  title: string;
  description?: string;
  type: 'area' | 'bar' | 'line' | 'pie' | 'horizontalBar';
  data: ChartData | TimeSeriesData;
  colors?: string[];
  height?: number;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKeys?: string[];
  className?: string;
}

export function ChartComponent({
  title,
  description,
  type,
  data,
  colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
  height = 300,
  xAxisKey = 'name',
  yAxisKey = 'value',
  dataKeys = ['value'],
  className,
}: ChartComponentProps) {
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow-md">
          <p className="text-sm font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Check if data is empty
  const isEmpty = data.length === 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center h-[200px] text-gray-500">
            No data available
          </div>
        ) : (
          <div style={{ height: `${height}px` }}>
            {type === 'area' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data as TimeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxisKey} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {dataKeys.map((key, index) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
              
            {type === 'bar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxisKey} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {dataKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
              
            {type === 'horizontalBar' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey={xAxisKey} tick={{ fontSize: 12 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {dataKeys.map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
              
            {type === 'line' && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={xAxisKey} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {dataKeys.map((key, index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
              
            {type === 'pie' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data as ChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    dataKey={yAxisKey}
                  >
                    {(data as ChartData).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || colors[index % colors.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
