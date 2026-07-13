"use client";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import GZFinalAssessment from "@/components/assessment/GZFinalAssessment";
import { clearSavedRun } from "@/lib/persistence";

function AssessmentPageContent() {
  const search = useSearchParams();

  useEffect(() => {
    if (search.get("restart") === "1") clearSavedRun();
  }, [search]);

  return (
    <main>
      <GZFinalAssessment />
    </main>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas text-ink flex items-center justify-center px-6">Loading assessment…</div>}>
      <AssessmentPageContent />
    </Suspense>
  );
}

