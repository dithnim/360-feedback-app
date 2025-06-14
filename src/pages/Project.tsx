import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

interface ProjectFormData {
  projectName: string;
  contactPerson: string;
  designation: string;
  email: string;
  phone: string;
  assigningTeam: string;
  startDate: string;
  endDate: string;
}

const Project = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>();

  const startDate = watch("startDate");

  const handleNext = () => {
    navigate("/info");
  };

  const handlePrev = () => {
    navigate("/create-company");
  };

  const onSubmit = (data: ProjectFormData) => {
    console.log(data);
    // Handle form submission here
  };

  return (
    <div>
      <div className="">
        <Navbar />
      </div>
      <div className="h-full px-50 pt-10">
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
          <div className="mb-5">
            <label
              htmlFor="projectName"
              className="block mb-2 text-lg text-gray-500"
            >
              Project Name*
            </label>
            <input
              type="text"
              id="projectName"
              className={`bg-gray-50 border ${
                errors.projectName ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
              {...register("projectName", {
                required: "Project name is required",
                minLength: {
                  value: 2,
                  message: "Project name must be at least 2 characters",
                },
              })}
            />
            {errors.projectName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.projectName.message}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mb-5">
            <div className="w-full me-10">
              <label
                htmlFor="contactPerson"
                className="block mb-2 text-lg text-gray-500"
              >
                Contact Person*
              </label>
              <input
                type="text"
                id="contactPerson"
                className={`bg-gray-50 border ${
                  errors.contactPerson ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                {...register("contactPerson", {
                  required: "Contact person is required",
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message:
                      "Contact person should only contain letters and spaces",
                  },
                })}
              />
              {errors.contactPerson && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.contactPerson.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="designation"
                className="block mb-2 text-lg text-gray-500"
              >
                Designation*
              </label>
              <input
                type="text"
                id="designation"
                className={`bg-gray-50 border ${
                  errors.designation ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                {...register("designation", {
                  required: "Designation is required",
                  minLength: {
                    value: 2,
                    message: "Designation must be at least 2 characters",
                  },
                })}
              />
              {errors.designation && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.designation.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mb-5">
            <div className="w-full me-10">
              <label
                htmlFor="email"
                className="block mb-2 text-lg text-gray-500"
              >
                Email Address*
              </label>
              <input
                type="email"
                id="email"
                className={`bg-gray-50 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="phone"
                className="block mb-2 text-lg text-gray-500"
              >
                Phone Number*
              </label>
              <input
                type="tel"
                id="phone"
                className={`bg-gray-50 border ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                maxLength={10}
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be 10 digits",
                  },
                })}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="mb-5 w-[calc(50%)] pe-5">
            <label
              htmlFor="assigningTeam"
              className="block mb-2 text-lg text-gray-500"
            >
              Assigning Team*
            </label>
            <select
              id="assigningTeam"
              className={`bg-gray-50 border ${
                errors.assigningTeam ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
              {...register("assigningTeam", {
                required: "Assigning team is required",
              })}
            >
              <option value="">Select a team</option>
              <option value="Maliban 360 Project 1">
                Maliban 360 Project 1
              </option>
              <option value="Team A">Team A</option>
              <option value="Team B">Team B</option>
            </select>
            {errors.assigningTeam && (
              <p className="mt-1 text-sm text-red-500">
                {errors.assigningTeam.message}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mb-5">
            <div className="w-full me-10">
              <label
                htmlFor="startDate"
                className="block mb-2 text-lg text-gray-500"
              >
                Project Start Date*
              </label>
              <input
                type="date"
                id="startDate"
                className={`bg-gray-50 border ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                {...register("startDate", {
                  required: "Start date is required",
                  validate: (value) => {
                    const today = new Date();
                    const selectedDate = new Date(value);
                    return (
                      selectedDate >= today ||
                      "Start date cannot be in the past"
                    );
                  },
                })}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <label
                htmlFor="endDate"
                className="block mb-2 text-lg text-gray-500"
              >
                End Date*
              </label>
              <input
                type="date"
                id="endDate"
                className={`bg-gray-50 border ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
                {...register("endDate", {
                  required: "End date is required",
                  validate: (value) => {
                    if (!startDate) return true;
                    const start = new Date(startDate);
                    const end = new Date(value);
                    return end > start || "End date must be after start date";
                  },
                })}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="save"
            className="mt-15 p-6 text-lg cursor-pointer"
          >
            Save
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Project;
