import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ApprovedSVG from "../../imgs/approved.png";

interface UserData {
  id: number;
  name: string;
  email: string;
  designation: string;
  type: "Appraisee" | "Appraiser";
  role: string;
}

const Review = () => {
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowSuccessMessage(false);
        navigate("/");
      }
    };

    if (showSuccessMessage) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuccessMessage, navigate]);

  // Dummy data for participants (you can replace this with actual data)
  const participants: UserData[] = [
    {
      id: 1,
      name: "Lorraine Christine Evans",
      email: "lorraineevans85@gmail.com",
      designation: "HR Assistance",
      type: "Appraiser",
      role: "Peer",
    },
    {
      id: 2,
      name: "Niro Yin",
      email: "niroyinsh7459@gmail.com",
      designation: "HR Manager",
      type: "Appraiser",
      role: "Manager",
    },
    {
      id: 3,
      name: "Lorraine Christine Evans",
      email: "lorraineevans85@gmail.com",
      designation: "CEO",
      type: "Appraisee",
      role: "Boss",
    },
    {
      id: 4,
      name: "Niro Yin",
      email: "niroyinsh7459@gmail.com",
      designation: "HR Manager",
      type: "Appraiser",
      role: "Subordinate",
    },
    {
      id: 5,
      name: "Lorraine Christine Evans",
      email: "lorraineevans85@gmail.com",
      designation: "HR Assistance",
      type: "Appraiser",
      role: "Subordinate",
    },
    {
      id: 6,
      name: "Niro Yin",
      email: "niroyinsh7459@gmail.com",
      designation: "HR Manager",
      type: "Appraiser",
      role: "Manager",
    },
    {
      id: 7,
      name: "Niro Yin",
      email: "niroyinsh7459@gmail.com",
      designation: "HR Manager",
      type: "Appraiser",
      role: "Manager",
    },
    {
      id: 8,
      name: "Lorraine Christine Evans",
      email: "lorraineevans85@gmail.com",
      designation: "HR Assistance",
      type: "Appraiser",
      role: "Subordinate",
    },
  ];

  const handlePrev = () => {
    navigate("/users"); // Assuming /users is the previous page
  };

  const handleFinish = () => {
    setShowSuccessMessage(true);
    // Implement actual finish logic here, e.g., send data to backend
  };

  return (
    <div>
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={popupRef}
            className="bg-white py-20 px-10 rounded-lg shadow-lg text-center relative"
          >
            <button
              onClick={() => {
                setShowSuccessMessage(false);
                navigate("/");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={ApprovedSVG}
              alt="approved-img"
              className="w-16 h-16 text-green-500 mx-auto mb-4"
            />
            <h2 className="text-2xl font-semibold mb-2">
              Completed Feedback Plan!
            </h2>
            <p className="text-gray-700">
              Emails will be automatically sent to all participants. No manual
              action is required.
            </p>
          </div>
        </div>
      )}

      <div>
        <Navbar />
      </div>
      <div className="h-full px-50 pt-10">
        <div className="flex justify-between items-center mb-10">
          <label htmlFor="review users" className="text-3xl font-semibold">
            Review Users
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
              onClick={handleFinish}
            >
              Finish
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <table className="min-w-full bg-white border-1 border-gray-200 rounded-full">
            <thead>
              <tr>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Participant Name
                </th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Email Address
                </th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Designation
                </th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Appraisee/Appraiser
                </th>
                <th className="py-5 px-4 border-b border-gray-200 text-left text-gray-600">
                  Role
                </th>
              </tr>
            </thead>
            <tbody>
              {participants.map((user) => (
                <tr key={user.id}>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.name}
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.email}
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.designation}
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.type}
                  </td>
                  <td className="py-5 px-4 border-b border-gray-200 text-gray-900">
                    {user.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Review;
