import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import PageNav from "../components/ui/pageNav";

interface CompanyFormData {
  companyName: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
  file?: FileList;
}

const Company = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>();

  const handleNext = () => {
    navigate("/project");
  };

  const onSubmit = (data: CompanyFormData) => {
    console.log(data);
    // Handle form submission here
  };

  return (
    <div>
      <div className="">
        <PageNav name="Jese Leos" position="CEO" title="Create New Company" />
      </div>
      <div className="h-(calc[100vh-120px]) px-50 pt-10">
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
          <div className="mb-5">
            <label
              htmlFor="companyName"
              className="block mb-2 text-lg text-gray-500"
            >
              Company Name*
            </label>
            <input
              type="text"
              id="companyName"
              className={`bg-gray-50 border ${
                errors.companyName ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
              {...register("companyName", {
                required: "Company name is required",
                minLength: {
                  value: 2,
                  message: "Company name must be at least 2 characters",
                },
              })}
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="description"
              className="block mb-2 text-lg text-gray-500"
            >
              Description*
            </label>
            <textarea
              id="description"
              className={`bg-gray-50 border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full font-bold p-2.5`}
              rows={7}
              {...register("description", {
                required: "Description is required",
                minLength: {
                  value: 10,
                  message: "Description must be at least 10 characters",
                },
              })}
            ></textarea>
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
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
                {...register("file")}
              />
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

export default Company;
