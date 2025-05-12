"use client"

import * as React from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts"

export type ValueType = string | number | Date

export interface DonutChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  category?: string;
  index?: string;
  colors?: string[];
  valueFormatter?: (value: ValueType) => string;
  showLabel?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function DonutChart({
  data,
  category = "value",
  index = "name",
  colors = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"],
  valueFormatter = (value: ValueType) => `${value}`,
  showLabel = true,
  showLegend = true,
  showTooltip = true,
  className,
}: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%" className={className}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
          label={showLabel ? ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%` : false}
          labelLine={showLabel}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color || colors[index % colors.length]} 
            />
          ))}
        </Pie>
        {showLegend && <Legend />}
        {showTooltip && <Tooltip formatter={(value) => valueFormatter(value as ValueType)} />}
      </PieChart>
    </ResponsiveContainer>
  )
}