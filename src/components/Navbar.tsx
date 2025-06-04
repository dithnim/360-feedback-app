import homeVector from "../../imgs/Home-Vector.png";
import dashLogo from "../../imgs/Dash-Logo.png";

const Navbar = () => {
  return (
    <div className="bg-[#acacac] w-screen flex items-center justify-between border-b-[1px] border-[#fff]">
      <div className="flex items-center gap-20">
        <div className="w-[150px] h-[114px] bg-[#ed3f41] flex items-center justify-center">
          <img src={homeVector} alt="home-vector" className="" />
        </div>
        <img src={dashLogo} alt="dash-logo" className="w-[250px] h-[95px]" />
      </div>
    </div>
  );
};

export default Navbar;
