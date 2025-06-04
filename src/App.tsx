import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import dashboardCard from "./components/dashboardCard";

function App() {
  return (
    <div className="bg-white h-screen w-screen">
      <Navbar />
      <Sidebar />
      <div className="body"></div>
    </div>
  );
}

export default App;
