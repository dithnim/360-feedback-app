import business from "../../imgs/business.png";
import checklist from "../../imgs/checklist.png";
import company from "../../imgs/company.png";
import insights from "../../imgs/insight.png";
import resource from "../../imgs/resource.png";
import team from "../../imgs/team.png";

const Sidebar = () => {
  return (
    <div className="h-screen w-[7%] bg-[#ed3f41] flex justify-center py-10">
      <div className="flex flex-col justify-between items-center ">
        <img src={business} alt="business" className="w-10 h-10" />
        <img src={company} alt="company" className="w-10 h-10" />
        <img src={checklist} alt="checklist" className="w-10 h-10" />
        <img src={team} alt="team" className="w-10 h-10" />
        <img src={resource} alt="resource" className="w-10 h-10" />
        <img src={insights} alt="insights" className="w-10 h-10" />
      </div>
    </div>
  );
};

export default Sidebar;
