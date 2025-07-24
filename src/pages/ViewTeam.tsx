import { useState } from "react";
import PageNav from "../components/ui/pageNav";
import { Button } from "../components/ui/Button";

import TeamSvg from "../../imgs/team-svg.png";

const CreateTeam = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [teamMembers, setTeamMembers] = useState<
    {
      email: string;
      role: string;
    }[]
  >([]);

  const handleAddMember = () => {
    if (!email.trim() || !role.trim()) return;

    setTeamMembers([...teamMembers, { email, role }]);
    setEmail("");
    setRole("");
  };

  const handleDeleteMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleEditMember = (
    index: number,
    updatedEmail: string,
    updatedRole: string
  ) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { email: updatedEmail, role: updatedRole };
    setTeamMembers(updatedMembers);
  };

  const Card = ({ TeamName }: { TeamName: string }) => (
    <div className="flex flex-col items-center justify-center border border-gray-300 rounded-xl py-15 w-80 h-auto cursor-pointer">
      <img src={TeamSvg} alt="team-svg" className="h-12 w-12 mb-4" />
      <label htmlFor="team-label">{TeamName}</label>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <PageNav position="HR Manager" title="View All Teams" />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        <Card TeamName="Maliban" />
      </main>
    </div>
  );
};

export default CreateTeam;
