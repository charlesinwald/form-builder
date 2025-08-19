"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";

interface FormFieldData {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "rating";
  label: string;
  options?: string[];
}

interface FormResponse {
  id: string;
  responses: Record<string, unknown>;
}

interface FieldAnalyticsProps {
  formData: { fields: FormFieldData[] };
  responses: FormResponse[];
}

export function FieldAnalytics({ formData, responses }: FieldAnalyticsProps) {
  // Find rating field for average rating display
  const ratingField = formData.fields.find((field) => field.type === "rating");
  const ratingData = ratingField
    ? responses
        .map((r) => r.responses[ratingField.id])
        .filter(Boolean)
        .map(Number)
    : [];

  const averageRating =
    ratingData.length > 0
      ? ratingData.reduce((a, b) => a + b, 0) / ratingData.length
      : 0;

  // Rating distribution
  // const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
  //   rating: `${rating} Star`,
  //   count: ratingData.filter((r) => r === rating).length,
  // }));

  // Service selection distribution (for select/radio fields)
  const serviceField = formData.fields.find(
    (field) => field.type === "select" || field.type === "radio"
  );
  const serviceData = serviceField
    ? serviceField.options?.map((option) => ({
        name: option,
        value: responses.filter((r) => r.responses[serviceField.id] === option)
          .length,
      })) || []
    : [];

  // const COLORS = [
  //   "hsl(var(--chart-1))",
  //   "hsl(var(--chart-2))",
  //   "hsl(var(--chart-3))",
  //   "hsl(var(--chart-4))",
  // ];

  return (
    <div className="space-y-6">
      {/* Average Rating Card */}
      {ratingField && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-inter">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${
                        star <= averageRating
                          ? "text-secondary"
                          : "text-muted-foreground"
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Based on {ratingData.length} responses
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Distribution */}
      {ratingField && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-inter">
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>Rating distribution chart (coming soon)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Distribution */}
      {serviceField && serviceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-inter">
              {serviceField.label} Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>{serviceField.label} distribution chart (coming soon)</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
