"use client";

import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { CheckCircle, Home } from "lucide-react";

interface FormSubmissionSuccessProps {
  formTitle: string;
}

export function FormSubmissionSuccess({
  formTitle,
}: FormSubmissionSuccessProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="space-y-6">
          <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-secondary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-inter font-bold text-foreground">
              Thank You!
            </h1>
            <p className="text-muted-foreground">
              Your response to{" "}
              <span className="font-medium">"{formTitle}"</span> has been
              submitted successfully.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We appreciate you taking the time to share your feedback with us.
            </p>

            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="w-full gap-2 bg-transparent"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
