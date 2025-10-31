import React from "react";
import type { ReactNode } from "react";
import ReportHeader from "../../../report/shared/ReportHeader";
import Footer from "../../../report/footer/Footer";

interface ReportPageWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  organizationName: string;
  pageNumber: number;
  isEditing?: boolean;
  showBorder?: boolean;
  borderColor?: string;
  minHeight?: string;
  onOrgChange?: (newOrg: string) => void;
  onPageNoChange?: (newPageNo: number) => void;
}

export default function ReportPageWrapper({
  title,
  description,
  children,
  organizationName,
  pageNumber,
  isEditing = false,
  showBorder = true,
  borderColor = "border-gray-300",
  minHeight = "100vh",
  onOrgChange,
  onPageNoChange,
}: ReportPageWrapperProps) {
  return (
    <div className={`pdf-page p flex flex-col min-h-[${minHeight}] text-left`}>
      <ReportHeader title={title}>
        {showBorder && (
          <div
            className={`border-b ${borderColor === "border-blue-400" ? "border-b-2 border-blue-400" : ""} pb-2 flex items-center mb-6`}
          ></div>
        )}

        {description && (
          <div className="mb-6">
            <p className="text-base">{description}</p>
          </div>
        )}

        {children}

        <div className="w-full mt-auto">
          <Footer
            org={organizationName}
            pageNo={pageNumber}
            isEditing={isEditing}
            onOrgChange={onOrgChange}
            onPageNoChange={onPageNoChange}
          />
        </div>
      </ReportHeader>
    </div>
  );
}

// Dummy data for component usage
export const dummyReportPageData: ReportPageWrapperProps = {
  title: "Sample Report Section",
  description:
    "This is a sample description for the report section that explains what this page contains.",
  children: null,
  organizationName: "Talent Boozt",
  pageNumber: 1,
  isEditing: false,
  showBorder: true,
  borderColor: "border-gray-300",
  minHeight: "100vh",
};
