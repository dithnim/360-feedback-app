import Navbar from "../components/Navbar";

const CreateTemplate = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          {/* Header for Create Template */}
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <h1 className="text-xl font-semibold text-red-600">
              Create Template
            </h1>
            <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Next
            </button>
          </div>

          {/* Template Details Section */}
          <div className="mb-6">
            <div className="mb-4">
              <label
                htmlFor="templateName"
                className="block text-sm font-medium text-gray-700"
              >
                Template name*
              </label>
              <input
                type="text"
                id="templateName"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="360 Feedback Plan with few competencies"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="competency"
                className="block text-sm font-medium text-gray-700"
              >
                Competency*
              </label>
              <input
                type="text"
                id="competency"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Leadership"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem."
              ></textarea>
            </div>
          </div>

          {/* Questions Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Questions
            </h2>
            {/* Question 1 */}
            <div className="flex items-start mb-4 space-x-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, Aenean commodo?"
              />
              <button className="p-2 rounded-md hover:bg-gray-200">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="flex justify-start space-x-4 mb-4">
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question1" className="form-radio" />
                <span>Strongly Agree</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question1" className="form-radio" />
                <span>Agree</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question1" className="form-radio" />
                <span>Neutral</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question1" className="form-radio" />
                <span>Strongly Disagree</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question1" className="form-radio" />
                <span>Disagree</span>
              </label>
            </div>

            {/* Question 2 */}
            <div className="flex items-start mb-4 space-x-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, Aenean commodo?"
              />
              <button className="p-2 rounded-md hover:bg-gray-200">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
              <button className="p-2 rounded-md hover:bg-gray-200">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
            <div className="flex justify-start space-x-4 mb-4">
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question2" className="form-radio" />
                <span>Strongly Agree</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question2" className="form-radio" />
                <span>Agree</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question2" className="form-radio" />
                <span>Neutral</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question2" className="form-radio" />
                <span>Strongly Disagree</span>
              </label>
              <label className="flex items-center space-x-1 text-sm text-gray-700">
                <input type="radio" name="question2" className="form-radio" />
                <span>Disagree</span>
              </label>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Add
            </button>
          </div>

          {/* New Section Button */}
          <button className="mb-6 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span>New section</span>
          </button>

          {/* Leadership Section */}
          <div className="mb-6 border border-gray-300 rounded-lg">
            <div className="flex items-center justify-between p-4 bg-green-600 rounded-t-lg">
              <h2 className="text-lg font-semibold text-white">Leadership</h2>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-md hover:bg-green-700">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
                <button className="p-1 rounded-md hover:bg-green-700">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem."
                ></textarea>
              </div>
              <div className="mb-4">
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, Aenean commodo?"
                ></textarea>
              </div>
              {/* Question 1 in Leadership */}
              <div className="mb-4">
                <label
                  htmlFor="leadershipQ1"
                  className="block text-sm font-medium text-gray-700"
                >
                  1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                  Aenean commodo?
                </label>
                <div className="flex justify-start space-x-4 mt-2">
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ1"
                      className="form-radio"
                    />
                    <span>Strongly Agree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ1"
                      className="form-radio"
                    />
                    <span>Agree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ1"
                      className="form-radio"
                    />
                    <span>Neutral</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ1"
                      className="form-radio"
                    />
                    <span>Strongly Disagree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ1"
                      className="form-radio"
                    />
                    <span>Disagree</span>
                  </label>
                </div>
              </div>
              {/* Question 2 in Leadership */}
              <div className="mb-4">
                <label
                  htmlFor="leadershipQ2"
                  className="block text-sm font-medium text-gray-700"
                >
                  2. Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                  Aenean commodo?
                </label>
                <div className="flex justify-start space-x-4 mt-2">
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ2"
                      className="form-radio"
                    />
                    <span>Strongly Agree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ2"
                      className="form-radio"
                    />
                    <span>Agree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ2"
                      className="form-radio"
                    />
                    <span>Neutral</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ2"
                      className="form-radio"
                    />
                    <span>Strongly Disagree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="leadershipQ2"
                      className="form-radio"
                    />
                    <span>Disagree</span>
                  </label>
                </div>
              </div>
              <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Next
              </button>
            </div>
          </div>

          {/* New Section Button */}
          <button className="mb-6 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            <span>New section</span>
          </button>

          {/* Communication Section */}
          <div className="mb-6 border border-gray-300 rounded-lg">
            <div className="flex items-center justify-between p-4 bg-green-600 rounded-t-lg">
              <h2 className="text-lg font-semibold text-white">
                Communication
              </h2>
              <div className="flex items-center space-x-2">
                <button className="p-1 rounded-md hover:bg-green-700">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
                <button className="p-1 rounded-md hover:bg-green-700">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-4">
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, Aenean commodo. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem."
                ></textarea>
              </div>
              <div className="mb-4">
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Lorem ipsum dolor sit amet, consectetuer adipiscing elit, Aenean commodo? Lorem ipsum dolor sit amet, consectetuer adipiscing elit, Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem."
                ></textarea>
              </div>
              {/* Question 1 in Communication */}
              <div className="mb-4">
                <label
                  htmlFor="communicationQ1"
                  className="block text-sm font-medium text-gray-700"
                >
                  1. Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                  Aenean commodo?
                </label>
                <div className="flex justify-start space-x-4 mt-2">
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ1"
                      className="form-radio"
                    />
                    <span>Strongly Agree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ1"
                      className="form-radio"
                    />
                    <span>Agree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ1"
                      className="form-radio"
                    />
                    <span>Neutral</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ1"
                      className="form-radio"
                    />
                    <span>Strongly Disagree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ1"
                      className="form-radio"
                    />
                    <span>Disagree</span>
                  </label>
                </div>
              </div>
              {/* Question 2 in Communication */}
              <div className="mb-4">
                <label
                  htmlFor="communicationQ2"
                  className="block text-sm font-medium text-gray-700"
                >
                  2. Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                  Aenean commodo?
                </label>
                <div className="flex justify-start space-x-4 mt-2">
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ2"
                      className="form-radio"
                    />
                    <span>Strongly Agree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ2"
                      className="form-radio"
                    />
                    <span>Agree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ2"
                      className="form-radio"
                    />
                    <span>Neutral</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ2"
                      className="form-radio"
                    />
                    <span>Strongly Disagree</span>
                  </label>
                  <label className="flex items-center space-x-1 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="communicationQ2"
                      className="form-radio"
                    />
                    <span>Disagree</span>
                  </label>
                </div>
              </div>
              {/* Question 3 in Communication */}
              <div className="mb-4">
                <label
                  htmlFor="communicationQ3"
                  className="block text-sm font-medium text-gray-700"
                >
                  3. Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
                  Aenean commodo?
                </label>
                <input
                  type="text"
                  id="communicationQ3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Next
              </button>
            </div>
          </div>

          {/* Save and Preview Buttons */}
          <div className="flex justify-end space-x-4 mt-8">
            <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Save Template
            </button>
            <button className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50">
              Preview
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTemplate;
