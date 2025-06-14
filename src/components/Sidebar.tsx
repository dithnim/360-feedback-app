import business from "../../imgs/business.png";
import checklist from "../../imgs/checklist.png";
import company from "../../imgs/company.png";
import insights from "../../imgs/insight.png";
import resource from "../../imgs/resource.png";
import team from "../../imgs/team.png";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import homeVector from "../../imgs/Home-Vector.png";

interface MenuItem {
  icon: string;
  label: string;
}

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();

  const navigateToCompany = () => {
    navigate("/create-company");
  };

  const menuItems: MenuItem[] = [
    { icon: business, label: "Business" },
    { icon: company, label: "Company" },
    { icon: checklist, label: "Checklist" },
    { icon: team, label: "Team" },
    { icon: resource, label: "Resource" },
    { icon: insights, label: "Insights" },
  ];

  return (
    <div
      className={`h-[calc(100vh)] bg-[#ed3f41] flex justify-center py-10 z-1000 transition-all duration-300 ease-in-out absolute top-0 ${
        isExpanded ? "w-[240px]" : "w-[120px]"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col justify-between items-center w-full">
        <div className="bg-[#ed3f41] flex items-center justify-center">
          <img src={homeVector} alt="home-vector" className="" />
        </div>
        {isExpanded ? (
          <div className="expanded-menu text-white w-full flex flex-col items-center h-full mt-2 justify-between">
            <div className="border-y-1 border-gray-200/50 py-4 w-full cursor-pointer">
              <label htmlFor="dash" className="ms-8 font-semibold text-lg">
                Dashboard
              </label>
            </div>
            <div className="border-b-1 border-gray-200/50 py-4 w-full cursor-pointer">
              <label htmlFor="org" className="ms-8 font-semibold text-lg">
                Organization
              </label>
              <div className="ms-4 flex flex-col">
                <label
                  htmlFor="org"
                  className="ms-10 text-sm mb-1 cursor-pointer"
                >
                  Current Organizations
                </label>
                <label
                  htmlFor="org"
                  className="ms-10 text-sm cursor-pointer"
                  onClick={navigateToCompany}
                >
                  Create New Organization
                </label>
              </div>
            </div>
            <div className="border-b-1 border-gray-200/50 py-4 w-full cursor-pointer">
              <label htmlFor="org" className="ms-8 font-semibold text-lg">
                Template
              </label>
              <div className="ms-4 flex flex-col">
                <label
                  htmlFor="org"
                  className="ms-10 text-sm mb-1 cursor-pointer"
                >
                  Create Template
                </label>
                <label htmlFor="org" className="ms-10 text-sm cursor-pointer">
                  View All Templates
                </label>
              </div>
            </div>
            <div className="border-b-1 border-gray-200/50 py-4 w-full cursor-pointer">
              <label htmlFor="org" className="ms-8 font-semibold text-lg">
                Teams
              </label>
              <div className="ms-4 flex flex-col">
                <label
                  htmlFor="org"
                  className="ms-10 text-sm mb-1 cursor-pointer"
                >
                  Create New Team
                </label>
                <label htmlFor="org" className="ms-10 text-sm cursor-pointer">
                  View All Teams
                </label>
              </div>
            </div>
            <div className="border-b-1 border-gray-200/50 py-4 w-full cursor-pointer">
              <label htmlFor="settings" className="ms-8 font-semibold text-lg">
                Settings
              </label>
            </div>
            <div className="border-b-1 border-gray-200/50 py-4 w-full text-gray-200/50 cursor-pointer">
              <label htmlFor="insights" className="ms-8 font-semibold text-lg">
                Insights
              </label>
            </div>
          </div>
        ) : (
          menuItems.map((item: MenuItem, index: number) => (
            <div
              key={index}
              className="flex items-center justify-center gap-4 w-full px-4 hover:bg-[#ff5254] transition-colors duration-200 cursor-pointer"
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
