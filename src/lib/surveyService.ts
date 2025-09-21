import { apiGet, apiPost } from "./apiService";

export async function createCompetency(
  competency: string,
  description: string
) {
  const response = await apiPost<{
    id: string;
    competency: string;
    description: string;
  }>("/competency", {
    competency,
    description,
  });
  console.log("Competency created:", response);
  return response;
}
