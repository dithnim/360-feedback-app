import { useState, useEffect } from "react";
import PageNav from "../components/ui/pageNav";
import { Skeleton } from "../components/ui/skeleton";
import { getAllTeams } from "../lib/teamService";
import type { Team } from "../lib/teamService";

import TeamSvg from "../../imgs/team-svg.png";

const ViewTeam = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedTeams = await getAllTeams();
        setTeams(fetchedTeams);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("Failed to load teams. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleTeamClick = (team: Team) => {
    // TODO: Navigate to team details page or handle team selection
    console.log("Selected team:", team);
  };

  const TeamCard = ({ team }: { team: Team }) => (
    <div
      className="flex flex-col items-center justify-center border border-gray-300 rounded-xl w-100 h-60 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => handleTeamClick(team)}
    >
      <img src={TeamSvg} alt="team-svg" className="h-12 w-12 mb-4" />
      <h3 className="text-lg font-semibold text-center mb-2">
        {team.teamName}
      </h3>
      {team.description && (
        <p
          className="text-sm text-gray-600 text-center overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: "1.2em",
            maxHeight: "2.4em",
          }}
        >
          {team.description}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        Created: {new Date(team.createdAt).toLocaleDateString()}
      </p>
    </div>
  );

  const TeamCardSkeleton = () => (
    <div className="flex flex-col items-center justify-center border border-gray-300 rounded-xl py-8 px-4 w-80 h-48">
      <Skeleton className="h-12 w-12 rounded mb-4" />
      <Skeleton className="h-6 w-32 mb-2" />
      <Skeleton className="h-4 w-48 mb-2" />
      <Skeleton className="h-3 w-24 mt-2" />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <PageNav position="HR Manager" title="View All Teams" />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 xl:gap-x-40 md:gap-x-20 xl:gap-y-20 md:gap-y-10 pe-20">
            {isLoading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 8 }).map((_, index) => (
                <TeamCardSkeleton key={index} />
              ))
            ) : teams.length === 0 ? (
              // Show empty state
              <div className="col-span-full text-center py-12">
                <img
                  src={TeamSvg}
                  alt="no-teams"
                  className="h-16 w-16 mx-auto mb-4 opacity-50"
                />
                <p className="text-gray-500 text-lg">No teams found</p>
                <p className="text-gray-400 text-sm">
                  Create your first team to get started
                </p>
              </div>
            ) : (
              // Show actual teams
              teams.map((team) => <TeamCard key={team.id} team={team} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewTeam;
