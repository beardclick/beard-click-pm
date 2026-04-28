import { getClients } from "@/app/actions/clients";
import { getProject, getProjectWebAccesses } from "@/app/actions/projects";
import { ProjectForm } from "@/components/projects/ProjectForm";
import AppLink from "@/components/ui/AppLink";
import { ChevronLeft } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { notFound } from "next/navigation";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getProject(resolvedParams.id);
  
  if (!project) {
    notFound();
  }
  const webAccesses = await getProjectWebAccesses(project.id);

  const clients = await getClients();
  const clientsForSelect = clients.map(c => ({ id: c.id, name: c.name, company: c.company }));

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton component={AppLink} href="/admin/projects" sx={{ color: "text.secondary" }}>
          <ChevronLeft size={22} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{fontWeight: 700}}>Editar Proyecto</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Modifica la información o el estado de este proyecto.
          </Typography>
        </Box>
      </Box>

      <ProjectForm initialData={{ ...project, web_accesses: webAccesses }} clients={clientsForSelect} />
    </Box>
  );
}
