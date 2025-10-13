import dashLogo from "../../imgs/dash-logo.png";

interface PublicNavbarProps {
  title?: string;
  showProgress?: boolean;
  currentStep?: number;
  totalSteps?: number;
  employee?: string;
}

const PublicNavbar = ({
  title = "360° Feedback Survey",
  showProgress = false,
  currentStep = 1,
  totalSteps = 3,
  employee,
}: PublicNavbarProps) => {
  return (
    <nav className="bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm w-full h-[80px] sm:h-[90px] md:h-[100px] flex items-center justify-between border-b border-gray-200 shadow-lg px-4 sm:px-6 md:px-10 sticky top-0 z-50">
      <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
        <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out">
          <img
            src={dashLogo}
            alt="DAASH Global"
            className="w-[120px] h-[45px] sm:w-[160px] sm:h-[60px] md:w-[200px] md:h-[75px] drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300 md:block hidden"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>

      <div className="flex-1 flex md:justify-center">
        {showProgress && (
          <div className="flex items-center gap-2 sm:gap-3 flex-col">
            <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 mb-0.5 sm:mb-1 px-2">
              {title}
            </h1>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 hidden md:block ${
                    i < currentStep
                      ? "bg-green-600"
                      : i === currentStep - 1
                        ? "bg-green-400"
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
        <div className="flex flex-col items-end">
          {employee && (
            <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-0.5 sm:mb-1 truncate max-w-[100px] sm:max-w-[150px] md:max-w-none">
              {employee}
            </p>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
