import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Card, CardContent, CardFooter } from "./components/ui/Card";
import { Avatar } from "./components/ui/Avatar";
import { Skeleton } from "./components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { PlusIcon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

//?Sidebar Context
import { useSidebar } from "./context/SidebarContext";

import {
  getCompanies,
  deleteOrganization,
  deleteUserByCompanyId,
} from "./lib/apiService";

function Home() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { isSidebarExpanded, setSidebarExpanded } = useSidebar();

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setError(null);
        const data = await getCompanies();
        console.log("Fetched organizations:", data);
        setOrganizations(data);
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
        setError("Failed to load organizations. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  const navigate = useNavigate();

  // Skeleton loading component
  const OrganizationCardSkeleton = () => (
    <Card className="w-full md:w-[321px] h-[266px] rounded-[10px] overflow-hidden p-0 relative">
      {/* Background skeleton */}
      <Skeleton className="w-full h-full rounded-[10px]" />

      {/* Organization name skeleton */}
      <div className="absolute top-[172px] left-4">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Card footer */}
      <CardFooter className="absolute bottom-0 left-0 w-full h-[40px] bg-white rounded-[0px_0px_10px_10px] flex justify-between items-center px-4 py-0">
        <div className="flex">
          {/* Avatar skeletons */}
          <Skeleton className="w-[30px] h-[30px] rounded-[15px]" />
          <Skeleton className="w-[30px] h-[30px] rounded-[15px] -ml-1" />
          <Skeleton className="w-[30px] h-[30px] rounded-[15px] -ml-1" />
          <Skeleton className="w-[30px] h-[30px] rounded-[15px] -ml-1" />
          <Skeleton className="w-[30px] h-[30px] rounded-[15px] -ml-1" />
        </div>

        <Skeleton className="h-4 w-12" />
      </CardFooter>
    </Card>
  );

  // Handler for viewing an organization
  const handleViewOrganization = (org: any) => {
    navigate("/current-projects", { state: { org } });
  };

  // Handler for creating a new organization
  const handleCreateOrganization = () => {
    navigate("/project");
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!organizationToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteOrganization(organizationToDelete.id);
      try {
        await deleteUserByCompanyId(organizationToDelete.id);
      } catch (error: any) {
        if (error.message && error.message.includes("404")) {
          console.log("No users found for company");
        } else {
          console.warn("Failed to delete users for company:", error);
        }
      }
      setOrganizations((prev) =>
        prev.filter((o) => o.id !== organizationToDelete.id)
      );
      setOrganizationToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      if (error.message && error.message.includes("404")) {
        console.log("Company not found");
      } else {
        console.warn("Failed to delete Company: ", error);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteOrganizationHandler = async (
    org: any,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setOrganizationToDelete(org);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setOrganizationToDelete(null);
  };

  return (
    <div className="bg-white w-full h-full relative">
      {/* Navbar with menu button for mobile */}
      <div className="relative">
        <Navbar />
        <button
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 block md:hidden bg-white rounded p-2 shadow"
          onClick={() => setSidebarExpanded(true)}
          aria-label="Open menu"
        >
          <Menu className="w-7 h-7 text-[#ed3f41]" />
        </button>
      </div>
      <div className="body flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Main Content */}
        <div
          className={`py-4 overflow-y-auto w-full transition-all duration-300 ease-in-out ${
            isSidebarExpanded ? "ps-60" : "ps-40"
          }`}
        >
          <h1 className="text-[#ed3f41] text-2xl font-semibold">
            360° Feedback Current Organizations
          </h1>

          {loading ? (
            <div className="w-full grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-[34px] gap-y-[60px] overflow-y-auto mt-10 h-[calc(100vh-370px)]">
              {/* Show 8 skeleton cards while loading */}
              {Array.from({ length: 8 }).map((_, index) => (
                <OrganizationCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[calc(100vh-370px)]">
              <div className="text-center">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#ed3f41] text-white px-4 py-2 rounded hover:bg-[#d23539]"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-x-[34px] gap-y-[60px] overflow-y-auto mt-10 h-[calc(100vh-370px)]">
              {organizations.map((org) => (
                <Card
                  key={org.id}
                  className="w-full md:w-[321px] h-[266px] rounded-[10px] overflow-hidden p-0 relative"
                  style={{
                    backgroundImage: `url(${org.logoImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "50% 50%",
                  }}
                  onClick={() => handleViewOrganization(org)}
                >
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black opacity-40 rounded-[10px]"></div>

                  {/* Organization name */}
                  <div className="absolute top-[172px] left-4 font-['Poppins',Helvetica] font-semibold text-white text-xl">
                    {org.name}
                  </div>

                  {/* Card footer */}
                  <CardFooter className="absolute bottom-0 left-0 w-full h-[40px] bg-white rounded-[0px_0px_10px_10px] border-r border-b border-l border-[#acacac] flex justify-between items-center px-4 py-0">
                    <div className="flex">
                      {/* User avatars */}
                      <Avatar className="w-[30px] h-[30px] bg-[#d9d9d9] rounded-[15px]" />
                      <Avatar className="w-[30px] h-[30px] bg-[#b8b8b8] rounded-[15px] -ml-1" />
                      <Avatar className="w-[30px] h-[30px] bg-[#999999] rounded-[15px] -ml-1" />
                      <Avatar className="w-[30px] h-[30px] bg-[#818181] rounded-[15px] -ml-1" />
                      <Avatar className="w-[30px] h-[30px] bg-[#646464] rounded-[15px] -ml-1 relative">
                        <PlusIcon className="w-6 h-6 absolute inset-0 m-auto text-white" />
                      </Avatar>
                    </div>

                    <label
                      className="font-['Poppins',Helvetica] font-semibold text-[#ed3f41] p-0 cursor-pointer flex items-center justify-center"
                      onClick={(event) => deleteOrganizationHandler(org, event)}
                    >
                      Delete
                    </label>
                  </CardFooter>
                </Card>
              ))}

              {/* Create New Organization Card */}
              <Card className="w-full md:w-[321px] h-[266px] bg-[#ee3e41] rounded-[10px] flex flex-col items-center justify-center">
                <CardContent
                  className="flex flex-col items-center justify-center h-full p-0 cursor-pointer"
                  onClick={handleCreateOrganization}
                >
                  <div className="w-10 h-6 flex items-center justify-center mb-0">
                    <div className="relative w-[30px] h-10 bg-[url(/group.png)] bg-[100%]" />
                  </div>
                  <span className="font-['Poppins',Helvetica] font-semibold text-white text-xl">
                    Create New Organization
                  </span>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        {/* Mobile Sidebar Overlay */}
        {isSidebarExpanded && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-40 flex md:hidden">
            <div className="relative w-[220px] max-w-[80vw] h-full bg-[#ed3f41] shadow-lg animate-slideInLeft">
              <button
                className="absolute top-4 right-4 z-50 text-white"
                onClick={() => setSidebarExpanded(false)}
                aria-label="Close menu"
              >
                <X className="w-7 h-7" />
              </button>
              <Sidebar />
            </div>
            {/* Click outside to close */}
            <div className="flex-1" onClick={() => setSidebarExpanded(false)} />
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 w-full">
        <Footer />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the organization '
              {organizationToDelete?.name}'? This action cannot be undone and
              will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Home;
