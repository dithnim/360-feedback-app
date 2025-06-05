import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Card, CardContent, CardFooter } from "./components/ui/Card";
import { Avatar } from "./components/ui/Avatar";
import { Button } from "./components/ui/Button";
import { PlusIcon } from "lucide-react";

const organizations = [
  {
    id: 1,
    name: "Maliban",
    image: "./imgs/Qrio-retouched-final.jpg",
  },
  {
    id: 2,
    name: "Dash",
  },
  {
    id: 3,
    name: "Dash",
  },
  {
    id: 4,
    name: "Dash",
  },
  {
    id: 5,
    name: "Dash",
  },
  {
    id: 6,
    name: "Dash",
  },
  {
    id: 7,
    name: "Dash",
  },
  {
    id: 8,
    name: "Dash",
  },
  {
    id: 9,
    name: "Dash",
  },
  {
    id: 10,
    name: "Dash",
  },
  {
    id: 11,
    name: "Dash",
  },
  {
    id: 12,
    name: "Dash",
  },
  {
    id: 13,
    name: "Dash",
  },
  {
    id: 14,
    name: "Dash",
  },
  {
    id: 15,
    name: "Dash",
  },
];

function Home() {
  return (
    <div className="bg-white h-screen w-screen">
      <Navbar />
      <div className="body flex">
        <Sidebar />
        <div className="py-4 px-20 w-full h-50vh">
          <h1 className="text-[#ed3f41] text-2xl font-semibold">
            360° Feedback Current Organizations
          </h1>

          <div className="w-full grid grid-cols-4 gap-x-[34px] gap-y-[60px] overflow-y-auto mt-10 h-[calc(100vh-30%)]">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className="w-[321px] h-[266px] rounded-[10px] overflow-hidden p-0 relative"
                style={{
                  backgroundImage: `url(${org.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "50% 50%",
                }}
              >
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black opacity-40 rounded-[10px]"></div>

                {/* Organization name */}
                <div className="absolute top-[172px] left-4 font-['Poppins',Helvetica] font-semibold text-white text-xl">
                  {org.name}
                </div>

                {/* Card footer */}
                <CardFooter className="absolute bottom-0 left-0 w-full h-[45px] bg-white rounded-[0px_0px_10px_10px] border-r border-b border-l border-[#acacac] flex justify-between items-center px-4">
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

                  <Button
                    variant="ghost"
                    className="font-['Poppins',Helvetica] font-semibold text-black text-[15px] p-0"
                  >
                    View
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Create New Organization Card */}
            <Card className="w-[321px] h-[266px] bg-[#ee3e41] rounded-[10px] flex flex-col items-center justify-center">
              <CardContent className="flex flex-col items-center justify-center h-full p-0">
                <div className="w-10 h-10 flex items-center justify-center mb-6">
                  <div className="relative w-[30px] h-10 bg-[url(/group.png)] bg-[100%_100%]" />
                </div>
                <span className="font-['Poppins',Helvetica] font-semibold text-white text-xl">
                  Create New Organization
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
