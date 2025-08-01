import { apiGet, apiPost } from "./apiService";

export async function createCompetency(competency: string) {
  const response = await apiPost<{ id: string; competency: string }>(
    "/competency",
    {
      competency,
    }
  );
  console.log("Competency created:", response);
  return response;
}
