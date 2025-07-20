import dashLogo from "../../imgs/Dash-Logo.png";
import proPic from "../../imgs/Qrio-retouched-final.jpg";
import { useNavigate } from "react-router-dom";

//?User Context
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const { user, clearUser, isAuthenticated } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  return (
    <div className="bg-[#f5f5f5] w-screen h-[120px] flex items-center justify-between border-b-[1px] border-[#acacac] pe-20 ps-35">
      <div className="flex items-center gap-20">
        <img
          src={dashLogo}
          alt="dash-logo"
          className="w-[250px] h-[95px] cursor-pointer"
          onClick={() => (window.location.href = "/")}
        />
      </div>

      <div className="flex items-center gap-4">
        <img className="w-16 h-16 rounded-full" src={proPic} alt="pro-pic" />
        {user && (
          <div className="flex items-center gap-4">
            <div>
              <div className="font-bold text-2xl">{user.name}</div>
              <div className="text-sm">Joined in August 2014</div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        )}
        {!user && (
          <div>
            <div className="font-bold text-2xl text-gray-600">Guest</div>
            <div className="text-sm text-gray-500">Not signed in</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
