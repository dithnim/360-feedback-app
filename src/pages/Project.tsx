import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import PageNav from "../components/ui/pageNav";

const inputFields = [
  {
    name: "projectName",
    label: "Project Name*",
    type: "text",
    placeholder: "Project Name*",
    validation: {
      required: "Project name is required",
      minLength: {
        value: 2,
        message: "Project name must be at least 2 characters",
      },
    },
  },
  {
    name: "contactPerson",
    label: "Contact Person*",
    type: "text",
    placeholder: "Contact Person*",
    validation: {
      required: "Contact person is required",
      pattern: {
        value: /^[A-Za-z\s]+$/,
        message: "Contact person should only contain letters and spaces",
      },
    },
  },
  {
    name: "designation",
    label: "Designation*",
    type: "text",
    placeholder: "Designation*",
    validation: {
      required: "Designation is required",
      minLength: {
        value: 2,
        message: "Designation must be at least 2 characters",
      },
    },
  },
  {
    name: "email",
    label: "Email Address*",
    type: "email",
    placeholder: "Email Address*",
    validation: {
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address",
      },
    },
  },
  {
    name: "phone",
    label: "Phone Number*",
    type: "tel",
    placeholder: "Phone Number*",
    validation: {
      required: "Phone number is required",
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Phone number must be 10 digits",
      },
    },
    maxLength: 10,
    onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    },
  },
];

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
    <div className="min-h-screen bg-white">
      <div className="">
        <PageNav name="Jese Leos" position="CEO" title="Create New Project" />
      </div>
      <div className="h-full px-4 sm:px-8 md:px-16 lg:px-32 pt-6 md:pt-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <label
            htmlFor="project details"
            className="text-2xl sm:text-3xl font-semibold"
          >
            Project Information
          </label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button
              variant="previous"
              className="font-semibold text-base sm:text-xl flex items-center justify-center px-4 py-3 sm:p-6"
              onClick={handlePrev}
            >
              previous
            </Button>
            <Button
              variant="next"
              className="font-semibold text-base sm:text-xl flex items-center justify-center px-4 py-3 sm:p-6"
              onClick={handleNext}
            >
              next
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 sm:mt-10">
          {/* Render input fields from config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8 mb-5">
            {inputFields.map((field) => (
              <div
                key={field.name}
                className={
                  field.name === "contactPerson" || field.name === "projectName"
                    ? "w-full md:me-10 mb-5 md:mb-0"
                    : "w-full mb-5 md:mb-0"
                }
              >
                <label
                  htmlFor={field.name}
                  className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  id={field.name}
                  placeholder={field.placeholder}
                  className={`bg-gray-50 border ${
                    errors[field.name as keyof typeof errors]
                      ? "border-red-500"
                      : "border-gray-300"
                  } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent font-bold`}
                  maxLength={field.maxLength}
                  onKeyPress={field.onKeyPress}
                  {...register(field.name as any, field.validation)}
                />
                {errors[field.name as keyof typeof errors] && (
                  <p className="mt-1 text-sm text-red-500">
                    {
                      errors[field.name as keyof typeof errors]
                        ?.message as string
                    }
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mb-5 w-full md:w-1/2 md:pe-4">
            <label
              htmlFor="assigningTeam"
              className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
            >
              Assigning Team*
            </label>
            <select
              id="assigningTeam"
              className={`bg-gray-50 border ${
                errors.assigningTeam ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
              {...register("assigningTeam", {
                required: "Assigning team is required",
              })}
            >
              <option value="">Assigning Team*</option>
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

          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-0 md:gap-8 mb-5">
            <div className="w-full md:me-10 mb-5 md:mb-0">
              <label
                htmlFor="startDate"
                className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
              >
                Project Start Date*
              </label>
              <input
                type="date"
                id="startDate"
                placeholder="Project Start Date*"
                className={`bg-gray-50 border ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
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
                className="block mb-2 text-lg text-gray-500 sr-only md:not-sr-only"
              >
                End Date*
              </label>
              <input
                type="date"
                id="endDate"
                placeholder="End Date*"
                className={`bg-gray-50 border ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 placeholder-gray-400 md:placeholder-transparent`}
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
            className="mt-8 sm:mt-12 px-4 py-3 sm:p-6 text-base sm:text-lg cursor-pointer w-full md:w-auto"
          >
            Save
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Project;
