import dashLogo from "../../imgs/Dash-Logo.png";
import proPic from "../../imgs/Qrio-retouched-final.jpg";

const Navbar = () => {
  return (
    <div className="bg-[#f5f5f5] w-screen h-[120px] flex items-center justify-between border-b-[1px] border-[#acacac] pe-20 ps-35">
      <div className="flex items-center gap-20">
        <img
          src={dashLogo}
          alt="dash-logo"
          className="w-[250px] h-[95px] cursor-pointer"
          onClick={() => window.location.href = "/"}
        />
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
