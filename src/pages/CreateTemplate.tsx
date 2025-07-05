import { Button } from "../components/ui/Button";
import PageNav from "../components/ui/pageNav";

const CreateTemplate = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <PageNav name="John Doe" position="HR Manager" title="Create Template" />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        <div className=" mx-auto rounded-lg">
          <div className="flex justify-end mb-6">
            <Button variant="next">Next</Button>
          </div>
          <div className="grid grid-cols-2 gap-16 mb-6">
            <div>
              <label
                htmlFor="templateName"
                className="mb-2 block text-md font-medium text-gray-700"
              >
                Template Name*
              </label>
              <input
                type="text"
                id="templateName"
                className="border border-gray-300 rounded-lg p-2 w-full"
                required
              />
            </div>
            <div>
              <label
                htmlFor="templateName"
                className="mb-2 block text-md font-medium text-gray-700"
              >
                Competency*
              </label>
              <input
                type="text"
                id="competency"
                className="border border-gray-300 rounded-lg p-2 w-full"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="templateName"
              className="mb-2 block text-md font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              className="border border-gray-300 rounded-lg p-2 w-full mb-4"
              rows={4}
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="templateName"
              className="mb-2 block text-md font-medium text-gray-700"
            >
              Questions*
            </label>
            <input type="text"
              id="questions"
              className="border border-gray-300 rounded-lg p-2 w-full"
              required
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTemplate;
