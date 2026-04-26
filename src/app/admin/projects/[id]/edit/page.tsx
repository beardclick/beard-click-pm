import { getClients } from "@/app/actions/clients";
import { getProject } from "@/app/actions/projects";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
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

  const clients = await getClients();
  const clientsForSelect = clients.map(c => ({ id: c.id, name: c.name }));

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Link href="/admin/projects">
          <IconButton sx={{ color: "text.secondary" }}>
            <ChevronLeft size={22} />
          </IconButton>
        </Link>
        <Box>
          <Typography variant="h5" fontWeight={700}>Editar Proyecto</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Modifica la información o el estado de este proyecto.
          </Typography>
        </Box>
      </Box>

      <ProjectForm initialData={project} clients={clientsForSelect} />
    </Box>
  );
}
