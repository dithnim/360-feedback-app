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

import { sendEmail } from "./lib/mailService";

function Home() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { isSidebarExpanded, setSidebarExpanded } = useSidebar();

  // Clear survey-related data when returning to home page
  useEffect(() => {
    localStorage.removeItem("Company");
    localStorage.removeItem("CompanyUsers");
    localStorage.removeItem("SurveyUsers");
    localStorage.removeItem("CompanyFormData");
    localStorage.removeItem("Participants");
    localStorage.removeItem("ProjectDetails");
    localStorage.removeItem("SurveyDetails");
    localStorage.removeItem("surveyCreationData");
    localStorage.removeItem("SavedQuestions");
    localStorage.removeItem("selectedAppraiseeId");
    localStorage.removeItem("Project");
  }, []);

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

  //? Skeleton loading component
  const OrganizationCardSkeleton = () => (
    <Card className="w-full min-w-[140px] max-w-full sm:max-w-[280px] md:max-w-[300px] lg:max-w-[320px] h-[180px] xs:h-[200px] sm:h-[220px] md:h-[240px] lg:h-[266px] rounded-lg md:rounded-[10px] overflow-hidden p-0 relative mx-auto shadow-md">
      {/* Background skeleton */}
      <Skeleton className="w-full h-full rounded-lg md:rounded-[10px]" />

      {/* Organization name skeleton */}
      <div className="absolute bottom-[45px] xs:bottom-[50px] sm:bottom-[55px] md:bottom-[60px] left-2 sm:left-3 md:left-4">
        <Skeleton className="h-4 xs:h-5 sm:h-5 md:h-6 w-20 xs:w-24 sm:w-28 md:w-32" />
      </div>

      {/* Card footer */}
      <CardFooter className="absolute bottom-0 left-0 w-full h-[32px] xs:h-[35px] sm:h-[38px] md:h-[40px] bg-white rounded-[0px_0px_8px_8px] md:rounded-[0px_0px_10px_10px] flex justify-between items-center px-1.5 xs:px-2 sm:px-3 md:px-4 py-0">
        <div className="flex -space-x-1 sm:-space-x-1.5">
          {/* Avatar skeletons */}
          <Skeleton className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] rounded-full sm:rounded-[12px] md:rounded-[15px]" />
          <Skeleton className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] rounded-full sm:rounded-[12px] md:rounded-[15px]" />
          <Skeleton className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] rounded-full sm:rounded-[12px] md:rounded-[15px]" />
          <Skeleton className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] rounded-full sm:rounded-[12px] md:rounded-[15px] hidden xs:block" />
          <Skeleton className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] rounded-full sm:rounded-[12px] md:rounded-[15px]" />
        </div>

        <Skeleton className="h-3 xs:h-3.5 sm:h-4 w-10 xs:w-12 sm:w-14" />
      </CardFooter>
    </Card>
  );

  //? Handler for viewing an organization
  const handleViewOrganization = (org: any) => {
    // Persist the selected organization for later pages/refreshes
    try {
      // Optional: make it available under the common key used elsewhere
      localStorage.setItem("Company", JSON.stringify(org));
    } catch (e) {
      console.warn("Failed to persist selected organization:", e);
    }
    navigate("/current-projects", { state: { org } });
  };

  //? Handler for creating a new organization
  const handleCreateOrganization = () => {
    localStorage.removeItem("Company");
    localStorage.removeItem("CompanyUsers");
    localStorage.removeItem("SurveyUsers");
    localStorage.removeItem("CompanyFormData");
    localStorage.removeItem("Participants");
    localStorage.removeItem("ProjectDetails");
    localStorage.removeItem("SurveyDetails");
    localStorage.removeItem("surveyCreationData");
    localStorage.removeItem("SavedQuestions");
    navigate("/project");
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!organizationToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteOrganization(organizationToDelete.id);
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
    <div className="bg-white w-full min-h-screen flex flex-col relative">
      {/* Navbar with menu button for mobile */}
      <div className="relative flex-shrink-0">
        <Navbar />
        <button
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 block md:hidden bg-white rounded p-1.5 sm:p-2 shadow-md hover:shadow-lg transition-shadow"
          onClick={() => setSidebarExpanded(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#ed3f41]" />
        </button>
      </div>
      <div className="body flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block flex-shrink-0">
          <Sidebar />
        </div>
        {/* Main Content */}
        <div
          className={`flex-1  py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:ps-32 lg:ps-38 xl:ps-40 md:pe-4 lg:pe-6 xl:pe-10 overflow-y-auto w-full transition-all duration-300 ease-in-out`}
        >
          <h1 className="text-[#ed3f41] text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-3 sm:mb-4 md:mb-6 px-1">
            360° Feedback Current Organizations
          </h1>

          {loading ? (
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 overflow-y-auto mt-3 sm:mt-4 md:mt-6 lg:mt-8 h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] md:h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] pb-20 sm:pb-24 md:pb-28">
              {/* Show 8 skeleton cards while loading */}
              {Array.from({ length: 8 }).map((_, index) => (
                <OrganizationCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] md:h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] px-4">
              <div className="text-center max-w-md">
                <p className="text-red-500 text-sm sm:text-base md:text-lg mb-3 sm:mb-4 px-2">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-[#ed3f41] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded hover:bg-[#d23539] transition-colors text-sm sm:text-base"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 overflow-y-auto mt-3 sm:mt-4 md:mt-6 lg:mt-8 h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] md:h-[calc(100vh-280px)] lg:h-[calc(100vh-320px)] pb-20 sm:pb-24 md:pb-28 px-1 sm:px-2">
              {organizations.map((org) => (
                <Card
                  key={org.id}
                  className="w-full min-w-[140px] max-w-full sm:max-w-[280px] md:max-w-[300px] lg:max-w-[320px] h-[180px] xs:h-[200px] sm:h-[220px] md:h-[240px] lg:h-[266px] rounded-lg md:rounded-[10px] overflow-hidden p-0 relative cursor-pointer hover:scale-[1.02] sm:hover:scale-105 transition-transform duration-200 mx-auto shadow-md hover:shadow-xl"
                  style={{
                    backgroundImage: `url(${org.logoImg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "50% 50%",
                  }}
                  onClick={() => handleViewOrganization(org)}
                >
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black opacity-40 rounded-lg md:rounded-[10px]"></div>

                  {/* Organization name */}
                  <div className="absolute bottom-[45px] xs:bottom-[50px] sm:bottom-[55px] md:bottom-[60px] left-2 sm:left-3 md:left-4 right-2 font-['Poppins',Helvetica] font-semibold text-white text-sm xs:text-base sm:text-lg md:text-xl truncate">
                    {org.name}
                  </div>

                  {/* Card footer */}
                  <CardFooter className="absolute bottom-0 left-0 w-full h-[32px] xs:h-[35px] sm:h-[38px] md:h-[40px] bg-white rounded-[0px_0px_8px_8px] md:rounded-[0px_0px_10px_10px] border-r border-b border-l border-[#acacac] flex justify-between items-center px-1.5 xs:px-2 sm:px-3 md:px-4 py-0">
                    <div className="flex -space-x-1 sm:-space-x-1.5">
                      {/* User avatars */}
                      <Avatar className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] bg-[#d9d9d9] rounded-full sm:rounded-[12px] md:rounded-[15px] border border-white" />
                      <Avatar className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] bg-[#b8b8b8] rounded-full sm:rounded-[12px] md:rounded-[15px] border border-white" />
                      <Avatar className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] bg-[#999999] rounded-full sm:rounded-[12px] md:rounded-[15px] border border-white" />
                      <Avatar className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] bg-[#818181] rounded-full sm:rounded-[12px] md:rounded-[15px] border border-white hidden xs:block" />
                      <Avatar className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 md:w-[30px] md:h-[30px] bg-[#646464] rounded-full sm:rounded-[12px] md:rounded-[15px] border border-white relative">
                        <PlusIcon className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 absolute inset-0 m-auto text-white" />
                      </Avatar>
                    </div>

                    <label
                      className="font-['Poppins',Helvetica] font-semibold text-[#ed3f41] text-xs xs:text-sm sm:text-base p-0 cursor-pointer flex items-center justify-center hover:text-[#d23539] transition-colors whitespace-nowrap"
                      onClick={(event) => deleteOrganizationHandler(org, event)}
                    >
                      Delete
                    </label>
                  </CardFooter>
                </Card>
              ))}

              {/* Create New Organization Card */}
              <Card className="w-full min-w-[140px] max-w-full sm:max-w-[280px] md:max-w-[300px] lg:max-w-[320px] h-[180px] xs:h-[200px] sm:h-[220px] md:h-[240px] lg:h-[266px] bg-[#ee3e41] rounded-lg md:rounded-[10px] flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] sm:hover:scale-105 transition-transform duration-200 mx-auto shadow-md hover:shadow-xl">
                <CardContent
                  className="flex flex-col items-center justify-center h-full p-3 sm:p-4 cursor-pointer"
                  onClick={handleCreateOrganization}
                >
                  <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 flex items-center justify-center mb-2 xs:mb-3 sm:mb-4">
                    <div className="relative w-5 xs:w-6 sm:w-7 md:w-[30px] h-6 xs:h-7 sm:h-8 md:h-10 bg-[url(/group.png)] bg-[100%]" />
                  </div>
                  <span className="font-['Poppins',Helvetica] font-semibold text-white text-sm xs:text-base sm:text-lg md:text-xl text-center px-2">
                    Create New Organization
                  </span>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        {/* Mobile Sidebar Overlay */}
        {isSidebarExpanded && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="relative w-[200px] xs:w-[220px] sm:w-[240px] max-w-[85vw] h-full bg-[#ed3f41] shadow-2xl animate-slideInLeft">
              <button
                className="absolute top-3 sm:top-4 right-3 sm:right-4 z-50 text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
                onClick={() => setSidebarExpanded(false)}
                aria-label="Close menu"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <Sidebar />
            </div>
            {/* Click outside to close */}
            <div
              className="flex-1 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarExpanded(false)}
            />
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 w-full z-10 flex-shrink-0">
        <Footer />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="w-[90vw] max-w-md sm:max-w-lg mx-auto p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              Delete Organization
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              Are you sure you want to delete the organization '
              {organizationToDelete?.name}'? This action cannot be undone and
              will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              onClick={handleDialogClose}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm sm:text-base"
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
