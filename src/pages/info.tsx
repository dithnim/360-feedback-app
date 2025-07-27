import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";

interface ParticipantFormData {
  participantName: string;
  email: string;
  designation: string;
}

const ParticipantInformation = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<ParticipantFormData[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ParticipantFormData>();

  const handleNext = () => {
    navigate("/users"); // Assuming next page is /summary
  };

  const handlePrev = () => {
    navigate("/project");
  };

  const onSubmit = (data: ParticipantFormData) => {
    setParticipants([...participants, data]);
    reset(); // Clear form fields after submission
  };

  const handleEdit = (_index: number) => {
    // Implement edit logic here, e.g., populate form with data for editing
  };

  const handleDelete = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="h-full px-50 pt-10">
        <div className="flex justify-between items-center mb-10">
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
          <div className="mb-5">
            <label
              htmlFor="participantName"
              className="block mb-2 text-lg text-gray-500"
            >
              Participant Name*
            </label>
            <input
              type="text"
              id="participantName"
              className={`bg-gray-50 border ${
                errors.participantName ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
              {...register("participantName", {
                required: "Participant name is required",
                minLength: {
                  value: 2,
                  message: "Participant name must be at least 2 characters",
                },
              })}
            />
            {errors.participantName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.participantName.message}
              </p>
            )}
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

          <Button
            type="submit"
            variant="save"
            className="mt-5 p-6 text-lg cursor-pointer"
          >
            Add
          </Button>
        </form>
      </div>
      {/* User Preview Section at the very bottom */}
      {participants.length > 0 && (
        <div className="mt-10 px-50 pb-10">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-600">
                  Participant Name
                </th>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-600">
                  Email Address
                </th>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-600">
                  Designation
                </th>
                <th className="py-2 px-4 border-b border-gray-200 text-left text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border-b border-gray-200 text-gray-900">
                    {participant.participantName}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200 text-gray-900">
                    {participant.email}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200 text-gray-900">
                    {participant.designation}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-500 hover:text-blue-700 me-2"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParticipantInformation;
