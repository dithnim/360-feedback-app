import React from "react";

interface ReportHeaderProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  className = "",
  children,
}) => (
  <div className={`header flex-grow ${className}`}>
    <div className="h-content w-full">
      <div className="h-r">
        <div className="h-svg-l">
          <svg
            width="23"
            height="25"
            viewBox="0 0 23 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="23" height="25" fill="#EE3E41" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold report-header-title">{title}</h2>
      </div>
      <div className="h-svg-r">
        <svg
          width="35"
          height="25"
          viewBox="0 0 35 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="12" width="23" height="25" fill="#EE3E41" />
          <path
            d="M0 1.90735e-05L12.5 0V13.8564L0 1.90735e-05Z"
            fill="#EE3E41"
          />
          <path d="M0 25H12.5V11L0 25Z" fill="#EE3E41" />
        </svg>
      </div>
    </div>
    <div className="h-underline"></div>
    {children}
  </div>
);

export default ReportHeader;
