import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import DashboardCard from "./components/dashboardCard";

function App() {
  return (
    <div className="bg-white h-screen w-screen">
      <Navbar />
      <div className="body flex">
        <Sidebar />
        <div className="py-4 px-20">
          <h1 className="text-[#ed3f41] text-2xl font-semibold">
            360° Feedback Current Organizations
          </h1>
          <DashboardCard />
        </div>
      </div>
    </div>
  );
}

export default App;
