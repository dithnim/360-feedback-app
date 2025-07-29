import dashLogo from "../../imgs/dash-logo.png";
import proPic from "../../imgs/Qrio-retouched-final.jpg";
import { useNavigate } from "react-router-dom";

//?User Context
import { useUser } from "../context/UserContext";

const Navbar = () => {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm w-screen h-[120px] flex items-center justify-between border-b border-gray-200 shadow-lg px-10 sticky top-0 z-50 ps-35">
      <div className="flex items-center gap-8">
        <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out">
          <img
            src={dashLogo}
            alt="dash-logo"
            className="w-[240px] h-[90px] drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300"
            onClick={() => (window.location.href = "/")}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {user && (
          <>
            <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-3   transition-all duration-300 ">
              <div className="relative group">
                <img
                  className="w-14 h-14 rounded-full object-cover ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300 shadow-md"
                  src={proPic}
                  alt="profile"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex flex-col">
                <div className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition-colors duration-200">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <i className="bx bx-calendar text-xs"></i>
                  Joined in August 2014
                </div>
              </div>
            </div>

            <div className="relative group">
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 transition-all duration-300 flex items-center justify-center w-14 h-14 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 group"
              >
                <i className="bxr  bx-arrow-from-left-stroke text-2xl"></i>
              </button>
              <div className="absolute -bottom-12 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Sign Out
              </div>
            </div>
          </>
        )}

        {!user && (
          <div className="flex items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
              <i className="bx bx-user text-2xl text-gray-600"></i>
            </div>
            <div className="flex flex-col">
              <div className="font-semibold text-xl text-gray-600">Guest</div>
              <div className="text-sm text-gray-400 flex items-center gap-1">
                <i className="bx bx-info-circle text-xs"></i>
                Not signed in
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
