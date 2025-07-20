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
  name: string;
  position: string;
  title: string;
};

const pageNav: React.FC<PageNavProps> = ({ name, position, title }) => {
  const { user } = useUser();
  const { isSidebarExpanded, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  // Add custom styles for slide animation
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInLeft {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(0);
        }
      }
      .animate-slideInLeft {
        animation: slideInLeft 0.3s ease-out forwards;
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

  const menuItems: (MenuItem & { onClick?: () => void })[] = [
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

  const Hr = () => (
    <div
      className="border-b border-gray-200/50 w-full flex-shrink-0"
      style={{ minHeight: 0 }}
    ></div>
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
        { label: "Current Organizations", onClick: undefined },
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
        { label: "Create New Team", onClick: undefined },
        { label: "View All Teams", onClick: undefined },
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
      className={`border-gray-200/50 w-full cursor-pointer flex flex-col justify-center flex-1 min-h-0 ${className || ""}`.trim()}
      style={{ minHeight: 0 }}
    >
      <label htmlFor={htmlFor} className="ms-8 font-semibold text-lg">
        {label}
      </label>
      {Array.isArray(children) && (
        <div className="ms-4 flex flex-col">
          {children.map((child, idx) => (
            <label
              key={idx}
              htmlFor={htmlFor}
              className={`ms-10 text-sm${child.onClick ? " cursor-pointer" : " mb-1 cursor-pointer"}`}
              onClick={child.onClick}
            >
              {child.label}
            </label>
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
        className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${isSidebarExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="relative h-full">
          <div
            className={`h-[100vh] bg-[#ed3f41] flex justify-center py-7 z-1000 transition-all duration-300 ease-in-out absolute top-0 w-[240px] transform ${isSidebarExpanded ? "translate-x-0 animate-slideInLeft" : "-translate-x-full"}`}
          >
            <div className="flex flex-col justify-between items-center w-full h-[93vh]">
              <div className="bg-[#ed3f41] flex items-center justify-center w-full">
                <div className="flex items-center justify-between px-8 w-full border-b-1 border-gray-200/50 pb-8">
                  <img
                    src={homeVector}
                    alt="home"
                    className="cursor-pointer w-8 h-8"
                    onClick={navigateHome}
                  />
                  <i
                    className="bxr bx-menu text-gray-100 text-[40px] m-0 p-0 cursor-pointer"
                    onClick={toggleSidebar}
                  ></i>
                </div>
              </div>
              <div className="expanded-menu text-white w-full flex flex-col h-screen">
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
        {/* Click outside to close */}
        <div className="flex-1" onClick={toggleSidebar} />
      </div>

      <nav className="flex items-center justify-between pe-6 bg-[#F8F6F7] rounded-t-lg border-b-2 border-[#E0E0E0]">
        {/* Left: Menu icon and page title */}
        <div className="flex">
          <div
            className="bg-[#ee3e41] w-25 h-25 flex items-center justify-center me-6 cursor-pointer hover:bg-[#d63336] transition-colors duration-200"
            onClick={toggleSidebar}
          >
            <i className="bx bx-menu font-bold text-3xl text-white"></i>{" "}
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
