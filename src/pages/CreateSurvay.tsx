import Navbar from "../components/Navbar";
import Draglogo from "../../imgs/drag-logo.png";
import WebisteLogo from "../../imgs/website-template-logo.png";

const CreateSurvay = () => {
  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
        <h2 className="text-4xl font-semibold mb-20">
          How do you want to build your Survey ?
        </h2>

        <div className="flex space-x-10">
          <div className="flex flex-col items-center p-8 border border-gray-300 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 w-80 h-96">
            <div className="mb-6">
              {/* Placeholder for icon */}
              <img src={Draglogo} alt="drag-logo" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Start from Scratch</h3>
            <p className="text-center text-gray-600">
              Build your form from the ground up using custom elements and
              layouts.
            </p>
          </div>

          <div className="flex flex-col items-center p-8 border border-gray-300 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 w-80 h-96">
            <div className="mb-6">
              {/* Placeholder for icon */}
              <img src={WebisteLogo} alt="WebLogo" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">From Template</h3>
            <p className="text-center text-gray-600">
              Use a pre-designed form layout to get started quickly and easily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSurvay;
