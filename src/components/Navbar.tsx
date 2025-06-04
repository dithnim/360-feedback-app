import homeVector from "../../imgs/Home-Vector.png";
import dashLogo from "../../imgs/Dash-Logo.png";
import proPic from "../../imgs/Qrio-retouched-final.jpg";

const Navbar = () => {
  return (
    <div className="bg-[#f5f5f5] w-screen flex items-center justify-between border-b-[1px] border-[#acacac] pe-20">
      <div className="flex items-center gap-20">
        <div className="w-[150px] h-[114px] bg-[#ed3f41] flex items-center justify-center">
          <img src={homeVector} alt="home-vector" className="" />
        </div>
        <img src={dashLogo} alt="dash-logo" className="w-[250px] h-[95px]" />
      </div>

      <div className="flex items-center gap-2">
        <img className="w-16 h-16 rounded-full" src={proPic} alt="pro-pic" />
        <div className="font-medium text-black" />
        <div>
          <div className="font-bold text-2xl">Jese Leos</div>
          <div className="text-sm">Joined in August 2014</div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
