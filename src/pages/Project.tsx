import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const Project = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/info");
  };

  const handlePrev = () => {
    navigate("/create-company");
  };

  return (
    <div>
      <div className="">
        <Navbar />
      </div>
      <div className="h-full px-50 pt-20">
        <div className="flex justify-between">
          <label htmlFor="project details" className="text-3xl font-semibold">
            Project Information
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

        <form action="" className="mt-15">
          <div className="mb-5">
            <label
              htmlFor="project name"
              className="block mb-2 text-lg text-gray-500"
            >
              Project Name*
            </label>
            <input
              type="text"
              id="p_name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold"
              placeholder=""
              required
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="description"
              className="block mb-2 text-lg text-gray-500"
            >
              Project Description*
            </label>
            <textarea
              name="desc"
              id="desc"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full font-bold p-2.5"
              rows={7}
            ></textarea>
          </div>

          <div className="flex justify-between items-center mb-5">
            <div className="w-full me-10">
              <label
                htmlFor="start_date"
                className="block mb-2 text-lg text-gray-500"
              >
                Start Date*
              </label>
              <input
                type="date"
                id="start_date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold"
                required
              />
            </div>

            <div className="w-full">
              <label
                htmlFor="end_date"
                className="block mb-2 text-lg text-gray-500"
              >
                End Date*
              </label>
              <input
                type="date"
                id="end_date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold"
                required
              />
            </div>
          </div>

          <Button variant="save" className="mt-20 p-6 text-lg cursor-pointer">
            Save
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Project;
