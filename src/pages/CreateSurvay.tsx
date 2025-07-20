import Draglogo from "../../imgs/drag-logo.png";
import WebisteLogo from "../../imgs/website-template-logo.png";
import { useNavigate } from "react-router-dom";
import PageNav from "../components/ui/pageNav";

const CreateSurvay = () => {
  const navigate = useNavigate();

  const navigateToScratch = () => {
    // Logic to navigate to the Create Competencies page
    navigate("/create-from-scratch");
  };

  return (
    <div className="h-screen">
      <div>
        <PageNav name="Jese Leos" position="CEO" title="Create Survey" />
      </div>
      <div className="flex flex-col items-center justify-center mt-30">
        <h2 className="text-4xl text-gray-600 font-semibold mb-30">
          How do you want to build your Survey ?
        </h2>

        <div
          className="flex space-x-40 cursor-pointer"
          onClick={navigateToScratch}
        >
          <div className="flex flex-col items-center justify-center p-8 border border-gray-400 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 w-96 h-96 bg-neutral-100">
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

          <div className="flex flex-col items-center justify-center p-8 border border-gray-400 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200 w-96 h-96 bg-neutral-100">
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
