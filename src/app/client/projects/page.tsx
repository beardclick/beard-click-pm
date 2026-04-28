import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getClientProjects } from "@/app/actions/projects";
import { getCurrentClientRecord } from "@/lib/client-access";
import { ProjectsList } from "@/components/projects/ProjectsList";

export default async function ClientProjectsPage() {
  const client = await getCurrentClientRecord();
  if (!client) return null;

  const projects = await getClientProjects(client.id);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{fontWeight: 700}}>Mis Proyectos</Typography>
        <Typography variant="body2" color="text.secondary">
          Aquí puedes ver el estado y archivos de todos tus proyectos activos.
        </Typography>
      </Box>

      <ProjectsList initialProjects={projects} isAdmin={false} />
    </Box>
  );
}

