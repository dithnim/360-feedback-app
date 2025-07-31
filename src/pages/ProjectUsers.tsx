import { apiGet } from "@/lib/apiService";
    
    
const getProjectUsers = async (projectId: string) => {
  const response = await apiGet(`/project/${projectId}/users`);
  if (response && Array.isArray(response)) {
    return response;
  }
  throw new Error("Invalid response from API");
};

const ProjectUsers = () => {
  return (
    <div>ProjectUsers</div>
  )
}

export default ProjectUsers