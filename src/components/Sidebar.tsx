import business from "../../imgs/business.png";
import checklist from "../../imgs/checklist.png";
import company from "../../imgs/company.png";
import insights from "../../imgs/insight.png";
import resource from "../../imgs/resource.png";
import team from "../../imgs/team.png";
import { useState } from "react";
import homeVector from "../../imgs/Home-Vector.png";

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
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
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 w-full px-4 hover:bg-[#ff5254] transition-colors duration-200 cursor-pointer"
          >
            <img src={item.icon} alt={item.label} className="w-10 h-10" />
            {isExpanded && (
              <span className="text-white font-medium whitespace-nowrap">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
