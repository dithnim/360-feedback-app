import PageNav from "../components/ui/pageNav";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";

const participants = [
  {
    name: "Thejani Jayawickrama",
    role: "Senior Web Developer",
    // ...other fields
  },
  // ...repeat for demo
];

export default function ParticipantsPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <PageNav name="Jese Leos" position="CEO" title="Current Projects" />
        <main className="p-8">
          <h2 className="text-2xl font-semibold mb-2">Nestle</h2>
          <div className="mb-4">
            <h3 className="font-medium">Participants</h3>
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="download-all" />
              <label htmlFor="download-all" className="text-sm">
                Download All Reports
              </label>
              <button className="ml-2 text-red-500">
                {/* Download icon here */}
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {participants.map((p, i) => (
              <div
                key={i}
                className="flex items-center bg-white rounded-lg shadow p-4"
              >
                <Avatar />
                <div className="ml-4 flex-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.role}</div>
                </div>
                <Button className="border border-red-400 text-red-400 hover:bg-red-50 mr-4">
                  Preview Report
                </Button>
                <input type="checkbox" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
