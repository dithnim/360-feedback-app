import React from "react";

type PageNavProps = {
  name: string;
  position: string;
  title: string;
};

const pageNav: React.FC<PageNavProps> = ({ name, position, title }) => {
  return (
    <nav className="flex items-center justify-between pe-6 bg-[#F8F6F7] rounded-t-lg border-b-2 border-[#E0E0E0]">
      {/* Left: Menu icon and page title */}
      <div className="flex">
        <div className="bg-[#ee3e41] w-20 h-20 flex items-center justify-center me-6">
          <i className="bx bx-menu font-bold text-3xl text-white"></i>{" "}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#ee3e41] text-xl font-medium">{title}</span>
        </div>
      </div>
      {/* Right: User info */}
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-[#E0E0E0] flex items-center justify-center mr-3">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="8" r="4" fill="#C4C4C4" />
            <ellipse cx="12" cy="17" rx="7" ry="4" fill="#C4C4C4" />
          </svg>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-sm font-medium text-black leading-tight">
            {name}
          </span>
          <span className="text-xs text-[#444]">{position}</span>
        </div>
      </div>
    </nav>
  );
};

export default pageNav;
