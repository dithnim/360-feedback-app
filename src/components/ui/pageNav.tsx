import React from "react";
import { useNavigate } from "react-router-dom";

import { useUser } from "../../context/UserContext";
import { useSidebar } from "../../context/SidebarContext";
import business from "../../../imgs/business.png";
import checklist from "../../../imgs/checklist.png";
import company from "../../../imgs/company.png";
import insights from "../../../imgs/insight.png";
import resource from "../../../imgs/resource.png";
import team from "../../../imgs/team.png";
import homeVector from "../../../imgs/Home-Vector.png";

type PageNavProps = {
  position: string;
  title: string;
};

const pageNav: React.FC<PageNavProps> = ({ position, title }) => {
  const { user } = useUser();
  const { isSidebarExpanded, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  // Add custom styles for animations
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      .animate-slideInLeft {
        animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out forwards;
      }
      .animate-pulse-hover:hover {
        animation: pulse 0.6s ease-in-out;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const navigateToCompany = () => {
    navigate("/project");
    toggleSidebar();
  };

  const navigateToTemplateView = () => {
    navigate("/view-templates");
    toggleSidebar();
  };

  const navigateToCreateTemplate = () => {
    navigate("/create-template");
    toggleSidebar();
  };

  const navigateHome = () => {
    navigate("/");
    toggleSidebar();
  };

  const navigateToViewTeam = () => {
    navigate("/view-team");
  };
  const navigateToCreateTeam = () => {
    navigate("/create-team");
  };

  const _menuItems: (MenuItem & { onClick?: () => void })[] = [
    { icon: business, label: "Business", onClick: () => navigate("/business") },
    { icon: company, label: "Company", onClick: navigateToCompany },
    {
      icon: checklist,
      label: "Checklist",
      onClick: () => navigate("/create-template"),
    },
    { icon: team, label: "Team", onClick: () => navigate("/team") },
    { icon: resource, label: "Resource", onClick: () => navigate("/resource") },
    { icon: insights, label: "Insights", onClick: () => navigate("/insights") },
  ];
  void _menuItems;

  const Hr = () => (
    <div
      className="border-b border-white/20 w-full flex-shrink-0 my-2 relative"
      style={{ minHeight: 0 }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-px"></div>
    </div>
  );

  // Sidebar section data
  const sidebarSections = [
    {
      label: "Dashboard",
      htmlFor: "dash",
      children: null,
      className: "",
    },
    {
      label: "Organization",
      htmlFor: "org",
      children: [
        { label: "Current Organizations", onClick: navigateHome },
        { label: "Create New Organization", onClick: navigateToCompany },
      ],
      className: "",
    },
    {
      label: "Template",
      htmlFor: "org",
      children: [
        { label: "Create Template", onClick: navigateToCreateTemplate },
        { label: "View All Templates", onClick: navigateToTemplateView },
      ],
      className: "",
    },
    {
      label: "Teams",
      htmlFor: "org",
      children: [
        { label: "Create New Team", onClick: navigateToCreateTeam },
        { label: "View All Teams", onClick: navigateToViewTeam },
      ],
      className: "",
    },
    {
      label: "Settings",
      htmlFor: "settings",
      children: null,
      className: "",
    },
    {
      label: "Insights",
      htmlFor: "insights",
      children: null,
      className: "text-gray-200/50",
    },
  ];

  // Sidebar section component
  const SidebarSection = ({ label, htmlFor, children, className }: any) => (
    <div
      className={`w-full cursor-pointer flex flex-col justify-center flex-1 min-h-0 group ${className || ""}`.trim()}
      style={{ minHeight: 0 }}
    >
      <label
        htmlFor={htmlFor}
        className="ms-8 font-bold text-lg text-white/90 group-hover:text-white transition-all duration-300 cursor-pointer flex items-center gap-2 py-2"
      >
        <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white group-hover:scale-125 transition-all duration-300"></div>
        {label}
      </label>
      {Array.isArray(children) && (
        <div className="ms-4 flex flex-col space-y-1">
          {children.map((child, idx) => (
            <button
              key={idx}
              type="button"
              className={`ms-12 text-sm py-2 px-3 cursor-pointer text-left bg-transparent border-none outline-none text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 transform hover:translate-x-1 hover:scale-105 relative overflow-hidden group`}
              onClick={child.onClick}
              style={{ color: "inherit" }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">
                <i className="w-1 h-1 bg-white/40 rounded-full group-hover:bg-white group-hover:scale-150 transition-all duration-300"></i>
                {child.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  interface MenuItem {
    icon: string;
    label: string;
  }
  return (
    <div className="relative">
      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-50 flex transition-all duration-500 ${isSidebarExpanded ? "opacity-100 backdrop-blur-sm" : "opacity-0 pointer-events-none"}`}
      >
        <div className="relative h-full">
          <div
            className={`h-[100vh] bg-gradient-to-b from-[#ed3f41] via-[#e63439] to-[#d63336] flex justify-center py-7 z-1000 transition-all duration-500 ease-out absolute top-0 w-[280px] transform shadow-2xl ${isSidebarExpanded ? "translate-x-0 animate-slideInLeft" : "-translate-x-full"}`}
          >
            <div className="flex flex-col justify-between items-center w-full h-[93vh] relative">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none"></div>

              <div className="bg-transparent flex items-center justify-center w-full relative z-10">
                <div className="flex items-center justify-between px-8 w-full border-b border-white/20 pb-6 backdrop-blur-sm">
                  <div className="group cursor-pointer transform hover:scale-110 transition-all duration-300 animate-pulse-hover">
                    <img
                      src={homeVector}
                      alt="home"
                      className="cursor-pointer w-10 h-10 drop-shadow-lg group-hover:drop-shadow-xl filter brightness-0 invert"
                      onClick={navigateHome}
                    />
                  </div>
                  <button
                    className="group cursor-pointer transform hover:scale-110 transition-all duration-300 p-2 rounded-xl hover:bg-white/10"
                    onClick={toggleSidebar}
                  >
                    <i className="bx bx-x text-white text-[32px] m-0 p-0 group-hover:rotate-90 transition-transform duration-300"></i>
                  </button>
                </div>
              </div>

              <div className="expanded-menu text-white w-full flex flex-col h-screen relative z-10 animate-fadeIn">
                {sidebarSections.map((section, idx) => (
                  <React.Fragment key={section.label}>
                    <SidebarSection {...section} />
                    {idx !== sidebarSections.length - 1 && <Hr />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Click outside to close with backdrop */}
        <div
          className="flex-1 bg-black/20 backdrop-blur-sm transition-all duration-300"
          onClick={toggleSidebar}
        />
      </div>

      <nav className="flex items-center justify-between pe-6 bg-[#F8F6F7] rounded-t-lg border-b-2 border-[#E0E0E0]">
        {/* Left: Menu icon and page title */}
        <div className="flex">
          <div
            className="bg-[#ee3e41] w-25 h-25 flex items-center justify-center me-6 cursor-pointer hover:bg-[#d63336] transition-colors duration-200"
            onClick={toggleSidebar}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 transform -translate-x-full"></div>
            <i className="bx bx-menu font-bold text-2xl text-white relative z-10 group-hover:rotate-180 transition-transform duration-500"></i>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#ee3e41] text-xl font-medium">{title}</span>
          </div>
        </div>

        {/* Right: User info */}
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-[#E0E0E0] flex items-center justify-center mr-3">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-colors duration-300"
            >
              <circle cx="12" cy="8" r="4" fill="#C4C4C4" />
              <ellipse cx="12" cy="17" rx="7" ry="4" fill="#C4C4C4" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-lg font-semibold text-black leading-tight">
              {user?.name}
            </span>
            <span className="text-md text-[#444]">{position}</span>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default pageNav;
