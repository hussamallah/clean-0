"use client";
import { Suspense } from "react";
import Assessment from "@/components/assessment/Assessment";

function AssessmentContent() {
  return (
    <main className="app">
      <Assessment />
    </main>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <AssessmentContent />
    </Suspense>
  );
}


