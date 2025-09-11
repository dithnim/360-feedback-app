import React from "react";

interface FooterProps {
  org: string;
  pageNo: number;
  isEditing: boolean;
  onOrgChange?: (newOrg: string) => void;
  onPageNoChange?: (newPageNo: number) => void;
}

const Footer3: React.FC<FooterProps> = ({
  org,
  pageNo,
  isEditing,
  onOrgChange,
  onPageNoChange,
}) => (
  <div className="w-full flex justify-between mt-4">
    {isEditing ? (
      <div className="border-t border-gray-200 w-full pt-2 flex justify-between">
        <div
          style={{
            position: "relative",
            minWidth: 300,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            border: "1px solid #eee",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px 8px 14px",
              borderBottom: "1px solid #f0f0f0",
              borderRadius: "10px 10px 0 0",
              background: "#f2f3f3",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 160,
              }}
            >
              Organization
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, color: "#bbb" }}>⋯</span>
              <span
                style={{ fontSize: 18, color: "#bbb", marginLeft: 4 }}
                title="Static"
              >
                ☰
              </span>
            </div>
          </div>
          <div className="w-full px-2 py-4">
            <input
              type="text"
              className="text-neutral-500 w-full"
              value={org}
              onChange={(e) => onOrgChange && onOrgChange(e.target.value)}
            />
          </div>
        </div>
        <div
          style={{
            position: "relative",
            minWidth: 300,
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            border: "1px solid #eee",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px 8px 14px",
              borderBottom: "1px solid #f0f0f0",
              borderRadius: "10px 10px 0 0",
              background: "#f2f3f3",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 160,
              }}
            >
              Page Number
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, color: "#bbb" }}>⋯</span>
              <span
                style={{ fontSize: 18, color: "#bbb", marginLeft: 4 }}
                title="Static"
              >
                ☰
              </span>
            </div>
          </div>
          <div className="w-full px-2 py-4">
            <input
              type="number"
              className=" text-neutral-500 w-full"
              value={pageNo}
              onChange={(e) =>
                onPageNoChange && onPageNoChange(Number(e.target.value))
              }
            />
          </div>
        </div>
      </div>
    ) : (
      <div className="border-t border-gray-200 w-full pt-2">
        <div className="text-left text-xs text-neutral-500">{org}</div>
        <div className="text-right text-xs text-neutral-500">{pageNo}</div>
      </div>
    )}
  </div>
);

export default Footer3;
