"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ReportPdfWithdrawal } from "@/components/report-pdf-document";

export function DownloadReportPdfButton({
  startDate,
  endDate,
  totalBottles,
  distinctWines,
  withdrawals,
}: {
  startDate: string;
  endDate: string;
  totalBottles: number;
  distinctWines: number;
  withdrawals: ReportPdfWithdrawal[];
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleDownload() {
    setIsGenerating(true);
    try {
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/report-pdf-document"),
      ]);
      const blob = await pdf(
        <ReportDocument
          startDate={startDate}
          endDate={endDate}
          totalBottles={totalBottles}
          distinctWines={distinctWines}
          withdrawals={withdrawals}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wine-cellar-report_${startDate}_to_${endDate}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleDownload} disabled={isGenerating}>
      <Download size={16} className="mr-1" />
      {isGenerating ? "Generating…" : "Download PDF"}
    </Button>
  );
}
