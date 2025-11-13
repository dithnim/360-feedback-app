import dashLogo from "../../imgs/dash-logo.png";
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
            <div className="hidden md:flex items-center gap-4 bg-white rounded-2xl px-6 py-3   transition-all duration-300 ">
              <div className="relative group">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex flex-col ">
                <div className="font-semibold text-xl text-gray-800 hover:text-blue-600 transition-colors duration-200">
                  {user.name}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  {user.role ? (
                    <>
                      <i className="bx bx-briefcase text-xs"></i>
                      <span>{user.role}</span>
                    </>
                  ) : (
                    <>
                      <i className="bx bx-calendar text-xs"></i>
                      {(() => {
                        const storedData = localStorage.getItem("userData");
                        if (storedData) {
                          try {
                            const userData = JSON.parse(storedData);
                            if (userData.loginTime) {
                              const date = new Date(userData.loginTime);
                              const month = date.toLocaleDateString("en-US", {
                                month: "long",
                              });
                              const year = date.getFullYear();
                              return `Joined on ${month.slice(0, 3)} ${year}`;
                            }
                          } catch (e) {
                            // Silent fail
                          }
                        }
                        return "Active member";
                      })()}
                    </>
                  )}
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
