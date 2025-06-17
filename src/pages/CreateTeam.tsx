import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";

const CreateTeam = () => {
  return (
    <div>
      <Navbar />

      <div className="h-full px-50 pt-10">
        <div className="flex justify-between items-center mb-10">
          <label htmlFor="participants" className="text-3xl font-semibold">
            Create New Team
          </label>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Team Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address*
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="example@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role*
              </label>
              <input
                type="text"
                name="role"
                id="role"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Overseeing Recruitment Process"
              />
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Permissions</h2>
          <div className="space-y-2 mb-6">
            <div className="flex items-center">
              <input
                id="permission1"
                name="permission1"
                type="checkbox"
                className="h-4 w-4 text-red-600 border-gray-300 rounded"
              />
              <label
                htmlFor="permission1"
                className="ml-2 block text-sm text-gray-900"
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
                commodo
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permission2"
                name="permission2"
                type="checkbox"
                className="h-4 w-4 text-red-600 border-gray-300 rounded"
              />
              <label
                htmlFor="permission2"
                className="ml-2 block text-sm text-gray-900"
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
                commodo
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permission3"
                name="permission3"
                type="checkbox"
                className="h-4 w-4 text-red-600 border-gray-300 rounded"
              />
              <label
                htmlFor="permission3"
                className="ml-2 block text-sm text-gray-900"
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
                commodo
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permission4"
                name="permission4"
                type="checkbox"
                className="h-4 w-4 text-red-600 border-gray-300 rounded"
              />
              <label
                htmlFor="permission4"
                className="ml-2 block text-sm text-gray-900"
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
                commodo
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="permission5"
                name="permission5"
                type="checkbox"
                className="h-4 w-4 text-red-600 border-gray-300 rounded"
              />
              <label
                htmlFor="permission5"
                className="ml-2 block text-sm text-gray-900"
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
                commodo
              </label>
            </div>
          </div>

          <Button
            variant="save"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm"
          >
            Add
          </Button>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    example@example.com
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Overseeing Recruitment Process
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 mr-2">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      🗑️
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    example@example.com
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Overseeing Recruitment Process
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 mr-2">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      🗑️
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    example@example.com
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Overseeing Recruitment Process
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 mr-2">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      🗑️
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    example@example.com
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Overseeing Recruitment Process
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 mr-2">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      🗑️
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    example@example.com
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Overseeing Recruitment Process
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-red-600 hover:text-red-900 mr-2">
                      ✏️
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      🗑️
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Button
              variant="save"
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm"
            >
              + Create New Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
