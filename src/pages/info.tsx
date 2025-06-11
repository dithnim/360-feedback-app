import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const info = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("");
  };

  const handlePrev = () => {
    navigate("/project");
  };

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div>
        <div className="h-full px-50 pt-20">
          <div className="flex justify-between">
            <label htmlFor="User details" className="text-3xl font-semibold">
              User Details
            </label>

            <div className="flex">
              <Button
                variant="previous"
                className="font-semibold text-xl flex items-center justify-center p-6 me-3"
                onClick={handlePrev}
              >
                previous
              </Button>
              <Button
                variant="next"
                className="font-semibold text-xl flex items-center justify-center p-6"
                onClick={handleNext}
              >
                next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default info;
