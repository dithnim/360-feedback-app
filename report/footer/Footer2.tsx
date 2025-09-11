import React from "react";

interface FooterProps {
  org: string;
  pageNo: number;
  isEditing: boolean;
  onOrgChange?: (newOrg: string) => void;
  onPageNoChange?: (newPageNo: number) => void;
}

const Footer2: React.FC<FooterProps> = ({
  org,
  pageNo,
  isEditing,
  onOrgChange,
  onPageNoChange,
}) => {
  // Get current date formatted as in the screenshot
  const getCurrentDate = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    // Add ordinal suffix
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${getOrdinal(day)} ${month} ${year}`;
  };

  return (
    <div className="w-full mt-8">
      {isEditing ? (
        <div className="flex justify-between gap-4">
          {/* Organization editing */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 min-w-[300px]">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-t-lg border-b border-gray-200">
              <span className="font-semibold text-sm text-gray-700">
                Organization
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⋯</span>
                <span className="text-gray-400">☰</span>
              </div>
            </div>
            <div className="p-4">
              <input
                type="text"
                className="w-full text-gray-600 outline-none"
                value={org}
                onChange={(e) => onOrgChange && onOrgChange(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
          </div>

          {/* Page number editing */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 min-w-[300px]">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-t-lg border-b border-gray-200">
              <span className="font-semibold text-sm text-gray-700">
                Page Number
              </span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">⋯</span>
                <span className="text-gray-400">☰</span>
              </div>
            </div>
            <div className="p-4">
              <input
                type="number"
                className="w-full text-gray-600 outline-none"
                value={pageNo}
                onChange={(e) =>
                  onPageNoChange && onPageNoChange(Number(e.target.value))
                }
                placeholder="Enter page number"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* Red top border */}
          <div className="w-full h-1 bg-red-600 mb-4"></div>

          {/* Footer content */}
          <div className="flex items-center justify-between px-6 py-4">
            {/* Date on the left */}
            <div className="text-sm text-gray-400">{getCurrentDate()}</div>

            {/* Logo in the center */}
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <div className="text-sm">
                  <span className="font-bold text-gray-700">DAASH</span>
                  <span className="text-red-600 font-bold">Global</span>
                </div>
              </div>
            </div>

            {/* Page number on the right */}
            <div className="text-sm text-gray-400">Page {pageNo}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Footer2;
