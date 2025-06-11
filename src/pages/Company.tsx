import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

const Company = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/project");
  };

  return (
    <div>
      <div className="">
        <Navbar />
      </div>
      <div className="h-full px-50 pt-20">
        <div className="flex justify-between">
          <label htmlFor="conpany details" className="text-3xl font-semibold">
            Company Details
          </label>
          <Button
            variant="next"
            className="font-semibold text-xl flex items-center justify-center p-6"
            onClick={handleNext}
          >
            next
          </Button>
        </div>

        <form action="" className="mt-15">
          <div className="mb-5">
            <label
              htmlFor="company name"
              className="block mb-2 text-lg text-gray-500"
            >
              Company Name*
            </label>
            <input
              type="text"
              id="c_name"
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
              Description*
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
                htmlFor="person"
                className="block mb-2 text-lg text-gray-500"
              >
                Contact Person*
              </label>
              <input
                type="text"
                id="c_person"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold"
                placeholder=""
                required
              />
            </div>

            <div className="w-full">
              <label
                htmlFor="email"
                className="block mb-2 text-lg text-gray-500"
              >
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold"
                placeholder=""
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="w-full me-10">
              <label
                htmlFor="phone"
                className="block mb-2 text-lg text-gray-500"
              >
                Phone Number*
              </label>
              <input
                type="number"
                id="phone"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold"
                placeholder=""
                required
              />
            </div>

            <div className="cursor-pointer">
              <label
                className="block mb-2 text-lg text-gray-500 cursor-pointer"
                htmlFor="file_input"
              >
                Upload file
              </label>
              <input
                className="bg-gray-50 border border-gray-300 text-gray-800 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 cursor-pointer"
                aria-describedby="user_avatar_help"
                id="user_avatar"
                type="file"
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

export default Company;
