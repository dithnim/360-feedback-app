import { useState } from "react";
import PageNav from "../components/ui/pageNav";

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

  const _handleAddMember = () => {
    if (!email.trim() || !role.trim()) return;

    setTeamMembers([...teamMembers, { email, role }]);
    setEmail("");
    setRole("");
  };
  void _handleAddMember;

  const _handleDeleteMember = (_index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== _index));
  };
  void _handleDeleteMember;

  const _handleEditMember = (
    index: number,
    updatedEmail: string,
    updatedRole: string
  ) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = { email: updatedEmail, role: updatedRole };
    setTeamMembers(updatedMembers);
  };
  void _handleEditMember;

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
