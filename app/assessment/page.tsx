"use client";
import { Suspense } from "react";
import GZFinalAssessment from "@/components/assessment/GZFinalAssessment";

function AssessmentPageContent() {
  return (
    <main>
      <GZFinalAssessment />
    </main>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <AssessmentPageContent />
    </Suspense>
  );
}


