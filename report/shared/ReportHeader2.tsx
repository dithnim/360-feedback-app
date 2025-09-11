import React from "react";

interface ReportHeader2Props {
  title: string;
  className?: string;
  children?: React.ReactNode;
  metaRight?: React.ReactNode; // right side meta text (e.g. user name)
}

const ReportHeader2: React.FC<ReportHeader2Props> = ({
  title,
  className = "",
  children,
  metaRight,
}) => {
  return (
    <div className={`w-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between w-full">
        <div className="relative -ml-14">
          <div className="bg-[#ee3e41] text-white rounded-r-full pl-8 pr-8 py-2 inline-flex items-center shadow-sm select-none">
            <h2 className="text-[18px] font-medium tracking-wide whitespace-nowrap">
              {title}
            </h2>
          </div>
        </div>
        {metaRight && (
          <div className="text-[12px] text-gray-500 font-medium tracking-wide">
            {metaRight}
          </div>
        )}
      </div>
      <div className="mt-2 h-[2px] -ml-14 w-full bg-gradient-to-r from-[#ee3e41] via-[#f1b2af] to-transparent rounded-full" />
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default ReportHeader2;
