import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet } from "../lib/apiService";
import { useState, useCallback, useEffect } from "react";

const getParticipants = async (orgId: string) => {
  const response = await apiGet(`/user/company/${orgId}`);
  if (response && typeof response === "object" && "data" in response) {
    // Optionally, add more type checks here if needed
    return (response as { data: unknown }).data;
  }
  throw new Error("Invalid response from API");
};

interface Participant {
  id: string;
  name: string;
  email: string;
  designation: string;
  appraiser: boolean;
  role: string;
  comanyId: string;
  createdAt: string;
}

export default function ParticipantsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const org = location.state?.org;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    if (!org?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getParticipants(org.id);
      setParticipants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to fetch participants");
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [org?.id]);

  useEffect(() => {
    if (org?.id) {
      fetchParticipants();
    }
  }, [org?.id, fetchParticipants]);

  const navigateToViewProject = () => {
    navigate(`/view-project`);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <PageNav position="CEO" title="Current Projects" />
        <main className="p-8">
          <h2 className="text-3xl font-semibold mb-6">{org?.name || ""}</h2>
          <div className="mb-4">
            <h3 className="font-medium text-xl mb-2">Participants</h3>
            <div className="flex items-center gap-2 mt-2 justify-between pe-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="download-all"
                  className="accent-[#A10000]"
                />
                <label htmlFor="download-all" className="text-sm ms-2">
                  Download All Reports
                </label>
              </div>
              <button className=" text-[#A10000]">
                <i className="bx bx-arrow-in-down-square-half text-2xl"></i>
              </button>
            </div>
          </div>
          {loading && <div>Loading participants...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-4">
            {participants.map((p, i) => (
              <div
                key={p.id || i}
                className="flex items-center   p-4 border-b border-gray-300/50"
              >
                <div className="w-12 h-12 rounded-full bg-[#E0E0E0] flex items-center justify-center mr-3">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="8" r="4" fill="#C4C4C4" />
                    <ellipse cx="12" cy="17" rx="7" ry="4" fill="#C4C4C4" />
                  </svg>
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.role}</div>
                </div>
                <Button
                  className="border border-[#ee3f40] text-[#ee3f40] hover:bg-[#ee3f40] hover:text-white mr-4 rounded-full cursor-pointer"
                  onClick={navigateToViewProject}
                >
                  Preview Report
                </Button>
                <input type="checkbox" className="accent-[#A10000]" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
