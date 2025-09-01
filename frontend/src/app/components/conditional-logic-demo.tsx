"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Form } from "../../../../shared/types";
import { ConditionalPublicForm } from "./conditional-public-form";

export function ConditionalLogicDemo() {
  const [showForm, setShowForm] = useState(false);

  // Example form with conditional logic
  const demoForm: Form = {
    id: "demo-conditional-form",
    title: "Conditional Logic Demo",
    description: "This form demonstrates show/hide fields, sections, and pages based on user input",
    status: "published",
    isActive: true,
    userId: "demo-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: "user_type",
        type: "select",
        label: "What type of user are you?",
        required: true,
        options: ["Individual", "Business", "Organization"],
      },
      {
        id: "business_name",
        type: "text",
        label: "Business Name",
        required: true,
        placeholder: "Enter your business name",
        conditionalLogic: [
          {
            id: "show-business-name",
            action: "show",
            targetType: "field",
            targetId: "business_name",
            rules: [
              {
                id: "rule-1",
                fieldId: "user_type",
                operator: "equals",
                value: "Business",
              }
            ]
          }
        ]
      },
      {
        id: "organization_type",
        type: "select",
        label: "Organization Type",
        required: true,
        options: ["Non-profit", "Government", "Educational", "Healthcare"],
        conditionalLogic: [
          {
            id: "show-org-type",
            action: "show",
            targetType: "field",
            targetId: "organization_type",
            rules: [
              {
                id: "rule-2",
                fieldId: "user_type",
                operator: "equals",
                value: "Organization",
              }
            ]
          }
        ]
      },
      {
        id: "annual_revenue",
        type: "select",
        label: "Annual Revenue Range",
        required: false,
        options: ["Under $100K", "$100K - $1M", "$1M - $10M", "Over $10M"],
        conditionalLogic: [
          {
            id: "show-revenue",
            action: "show",
            targetType: "field",
            targetId: "annual_revenue",
            rules: [
              {
                id: "rule-3",
                fieldId: "user_type",
                operator: "equals",
                value: "Business",
              }
            ]
          }
        ]
      },
      {
        id: "contact_method",
        type: "radio",
        label: "Preferred contact method",
        required: true,
        options: ["Email", "Phone", "Mail"],
      },
      {
        id: "phone_number",
        type: "text",
        label: "Phone Number",
        required: true,
        placeholder: "Enter your phone number",
        conditionalLogic: [
          {
            id: "require-phone",
            action: "show",
            targetType: "field",
            targetId: "phone_number",
            rules: [
              {
                id: "rule-4",
                fieldId: "contact_method",
                operator: "equals",
                value: "Phone",
              }
            ]
          }
        ]
      },
      {
        id: "mailing_address",
        type: "textarea",
        label: "Mailing Address",
        required: true,
        placeholder: "Enter your full mailing address",
        conditionalLogic: [
          {
            id: "require-address",
            action: "show",
            targetType: "field",
            targetId: "mailing_address",
            rules: [
              {
                id: "rule-5",
                fieldId: "contact_method",
                operator: "equals",
                value: "Mail",
              }
            ]
          }
        ]
      },
      {
        id: "services_interested",
        type: "checkbox",
        label: "Which services are you interested in?",
        required: false,
        options: ["Consulting", "Training", "Support", "Custom Development"],
      },
      {
        id: "project_budget",
        type: "select",
        label: "Project Budget Range",
        required: true,
        options: ["Under $10K", "$10K - $50K", "$50K - $200K", "Over $200K"],
        conditionalLogic: [
          {
            id: "require-budget",
            action: "show",
            targetType: "field",
            targetId: "project_budget",
            rules: [
              {
                id: "rule-6",
                fieldId: "services_interested",
                operator: "contains",
                value: "Custom Development",
              }
            ]
          }
        ]
      },
      {
        id: "additional_notes",
        type: "textarea",
        label: "Additional Notes",
        required: false,
        placeholder: "Any additional information you'd like to share",
      }
    ]
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log("Form submitted with data:", data);
    alert("Form submitted successfully! Check the console for data.");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Conditional Logic Demo
              <Badge variant="secondary">Interactive</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This demo showcases advanced conditional logic features:
              </p>
              
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <strong>Show/Hide Fields:</strong> Business name appears only for &ldquo;Business&rdquo; users
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <strong>Dynamic Requirements:</strong> Phone/address become required based on contact method
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <strong>Multi-condition Logic:</strong> Budget field shows when &ldquo;Custom Development&rdquo; is selected
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <strong>Smart Validation:</strong> Only visible and applicable fields are validated
                </li>
              </ul>

              <div className="pt-4">
                <Button 
                  onClick={() => setShowForm(!showForm)}
                  variant={showForm ? "outline" : "default"}
                >
                  {showForm ? "Hide Demo Form" : "Show Demo Form"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showForm && (
          <ConditionalPublicForm
            form={demoForm}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}