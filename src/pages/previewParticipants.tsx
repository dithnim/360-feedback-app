import React, { useEffect, useMemo, useState } from "react";
import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/skeleton";
import { useNavigate, useLocation } from "react-router-dom";
import { apiGet } from "../lib/apiService";
import { HardDriveDownloadIcon } from "lucide-react";

type Participant = {
  id: string;
  name: string;
  designation?: string;
  avatarUrl?: string;
};

export default function PreviewParticipants() {
  const navigate = useNavigate();
  const location = useLocation();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Project/company title can be passed via location.state; fallback to localStorage Company
  const companyName = useMemo(() => {
    const fromState = (location.state as any)?.companyName;
    if (fromState) return fromState;
    try {
      const companyRaw = localStorage.getItem("Company");
      const company = companyRaw ? JSON.parse(companyRaw) : null;
      return company?.name || "";
    } catch {
      return "";
    }
  }, [location.state]);

  // Fetch participants from API using companyId from localStorage; fallback to state if provided
  useEffect(() => {
    let cancelled = false;

    async function fetchParticipants() {
      // If caller already provided participants via navigation state, use them
      const provided = (location.state as any)?.participants as Participant[];
      if (Array.isArray(provided) && provided.length) {
        setParticipants(provided);
        // Save provided participants to local storage
        localStorage.setItem("Participants", JSON.stringify(provided));
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Read companyId from localStorage -> key: "Company"
        const companyRaw = localStorage.getItem("Company");
        const company = companyRaw ? JSON.parse(companyRaw) : null;
        const companyId: string | undefined = company?.id;

        if (!companyId) {
          // Try to load participants from local storage as fallback
          try {
            const savedParticipants = localStorage.getItem("Participants");
            if (savedParticipants) {
              const parsed = JSON.parse(savedParticipants) as Participant[];
              if (Array.isArray(parsed)) {
                setParticipants(parsed);
                return;
              }
            }
          } catch (e) {
            console.warn("Failed to load participants from local storage:", e);
          }

          throw new Error(
            "Company ID not found in localStorage. Please navigate from the company/projects page."
          );
        }

        // Backend route per spec: /api/v1/company/user/company/:companyId
        // BASE_URL already includes /api/v1, so we call the relative path below.
        const res = await apiGet<any[]>(`/company/user/company/${companyId}`);

        if (!cancelled) {
          const mapped: Participant[] = Array.isArray(res)
            ? res.map((u: any) => ({
                id: u.id ?? u.userId ?? "",
                name: u.name ?? "",
                designation: u.designation ?? "",
              }))
            : [];
          setParticipants(mapped);
          // Save participants to local storage
          localStorage.setItem("Participants", JSON.stringify(mapped));
        }
      } catch (e: any) {
        if (!cancelled) {
          // Try to load participants from local storage as fallback
          try {
            const savedParticipants = localStorage.getItem("Participants");
            if (savedParticipants) {
              const parsed = JSON.parse(savedParticipants) as Participant[];
              if (Array.isArray(parsed) && parsed.length > 0) {
                setParticipants(parsed);
                setError(null);
                return;
              }
            }
          } catch (storageError) {
            console.warn(
              "Failed to load participants from local storage:",
              storageError
            );
          }

          setError(e?.message || "Failed to load participants");
          setParticipants([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchParticipants();
    return () => {
      cancelled = true;
    };
  }, [location.state]);

  const onPreview = (participantId: string) => {
    navigate(
      `/view-project?participantId=${encodeURIComponent(participantId)}`
    );
  };

  // Skeleton component for loading state
  const ParticipantSkeleton = () => (
    <div className="space-y-4">
      {/* Header controls skeleton */}
      <div className="flex items-center gap-3 py-3 border-b">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <div className="ml-auto">
          <Skeleton className="h-5 w-5" />
        </div>
      </div>

      {/* Participant list skeletons */}
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between py-5 gap-4"
        >
          {/* Avatar and name skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>

          {/* Designation skeleton */}
          <div className="flex justify-between min-w-0">
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Button and checkbox skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-4 w-4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <PageNav position="Current Projects" title="Current Projects" />

      <div className="container mx-auto px-6 py-8">
        {companyName ? (
          <h1 className="text-2xl font-semibold mb-6">{companyName}</h1>
        ) : (
          <h1 className="text-2xl font-semibold mb-6">Participants</h1>
        )}

        <div className="mb-4">
          <h2 className="text-lg font-medium">Participants</h2>
        </div>

        {/* Participants list */}
        {loading ? (
          <ParticipantSkeleton />
        ) : error || participants.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No Participants
              </h3>
              <p className="text-gray-500">
                There are no participants available for this project.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header controls */}
            <div className="flex items-center gap-3 py-3 border-b">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 accent-[#ee3e41]"
                aria-label="select all"
              />
              <span>Download All Reports</span>
              <button
                type="button"
                className="ml-auto text-red-600 hover:text-red-700"
                title="Download"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 3a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L11 12.586V4a1 1 0 011-1z" />
                  <path d="M5 19a2 2 0 002 2h10a2 2 0 002-2v-3a1 1 0 112 0v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 112 0v3z" />
                </svg>
              </button>
            </div>

            <ul className="divide-y">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-5 gap-4"
                >
                  {/* Avatar */}
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                      {p.avatarUrl ? (
                        // eslint-disable-next-line jsx-a11y/img-redundant-alt
                        <img
                          src={p.avatarUrl}
                          alt={`${p.name} avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#fff"
                          className="w-6 h-6"
                        >
                          <path d="M12 12a5 5 0 100-10 5 5 0 000 10zM2 20a10 10 0 1120 0v1H2v-1z" />
                        </svg>
                      )}
                    </div>
                    <div className="font-medium">{p.name}</div>
                  </div>

                  {/* Name and role */}
                  <div className="flex justify-between min-w-0">
                    <div className="text-sm text-gray-500 truncate text-center">
                      {p.designation || ""}
                    </div>
                  </div>

                  {/* Preview button */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="edit"
                      className="!bg-white !text-red-600 !border !border-red-500 hover:!bg-red-50 rounded-full"
                      onClick={() => onPreview(p.id)}
                    >
                      Preview Report
                    </Button>

                    {/* Select checkbox */}
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 accent-[#ee3e41] ms-2"
                      aria-label={`select ${p.name}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
