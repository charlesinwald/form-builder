"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

interface TrendData {
  date: string;
  responses: number;
}

interface ResponseTrendsProps {
  trends: TrendData[];
}

export function ResponseTrends({ trends: _trends }: ResponseTrendsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-inter">Response Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center text-muted-foreground">
          <p>Response trends chart (coming soon)</p>
        </div>
      </CardContent>
    </Card>
  );
}
