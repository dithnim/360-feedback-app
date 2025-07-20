import business from "../../imgs/business.png";
import checklist from "../../imgs/checklist.png";
import company from "../../imgs/company.png";
import insights from "../../imgs/insight.png";
import resource from "../../imgs/resource.png";
import team from "../../imgs/team.png";
import { useNavigate } from "react-router-dom";
import homeVector from "../../imgs/home-vector.png";
import { useSidebar } from "../context/SidebarContext";

interface MenuItem {
  icon: string;
  label: string;
}

const Sidebar = () => {
  const { isSidebarExpanded, toggleSidebar } = useSidebar();

  const navigate = useNavigate();

  const navigateToCompany = () => {
    navigate("/project");
  };

  const navigateToTemplateView = () => {
    navigate("/view-templates");
  };

  const navigateToCreateTemplate = () => {
    navigate("/create-template");
  };

  const navigateHome = () => {
    navigate("/");
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

  return (
    <div
      className={`h-[100vh] bg-[#ed3f41] flex justify-center py-10 z-1000 transition-all duration-300 ease-in-out absolute top-0 ${
        isSidebarExpanded ? "w-[240px]" : "w-[120px]"
      }`}
    >
      <div className="flex flex-col justify-between items-center w-full  h-[93vh]">
        <div className="bg-[#ed3f41] flex items-center justify-center w-full">
          {isSidebarExpanded ? (
            <div className="flex items-center justify-between px-8 w-full border-b-1 border-gray-200/50 pb-10">
              <img
                src={homeVector}
                alt="home"
                className="cursor-pointer w-8 h-8"
                onClick={navigateHome}
              />
              <i
                className="bxr  bx-menu text-gray-100 text-[40px] m-0 p-0 cursor-pointer"
                onClick={toggleSidebar}
              ></i>
            </div>
          ) : (
            <div className=" px-8 w-full border-b-1 border-gray-200/50 pb-8">
              <i
                className="bxr  bx-menu text-gray-100 text-[40px] m-0 p-0 cursor-pointer flex justify-center items-center"
                onClick={toggleSidebar}
              ></i>
            </div>
          )}
        </div>
        {isSidebarExpanded ? (
          <div className="expanded-menu text-white w-full flex flex-col h-screen ">
            {sidebarSections.map((section, idx) => (
              <>
                <SidebarSection key={section.label} {...section} />
                {idx !== sidebarSections.length - 1 && <Hr />}
              </>
            ))}
          </div>
        ) : (
          menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-center gap-4 w-full px-4 transition-colors duration-200 cursor-pointer"
              onClick={item.onClick}
            >
              <img src={item.icon} alt={item.label} className="w-10 h-10" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
