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
    <nav className="bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-sm w-full h-[100px] flex items-center justify-between border-b border-gray-200 shadow-lg px-10 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <div className="group cursor-pointer transform hover:scale-105 transition-all duration-300 ease-in-out">
          <img
            src={dashLogo}
            alt="DAASH Global"
            className="w-[200px] h-[75px] drop-shadow-md group-hover:drop-shadow-lg transition-all duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      </div>

      <div>
        {showProgress && (
          <div className="flex items-center gap-3 flex-col">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{title}</h1>
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
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

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          {employee && <p className="text-md text-gray-600 mb-1">{employee}</p>}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
