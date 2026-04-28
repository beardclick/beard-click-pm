import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Plus } from "lucide-react";
import { getProjects } from "@/app/actions/projects";
import { AutoRead } from "@/components/layout/AutoRead";
import { ProjectsList } from "@/components/projects/ProjectsList";
import AppLink from "@/components/ui/AppLink";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <Box>
      <AutoRead type="projects" />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" sx={{fontWeight: 700}}>Proyectos</Typography>
        <Button component={AppLink} href="/admin/projects/new" variant="contained" startIcon={<Plus size={18} />}>
          Nuevo Proyecto
        </Button>
      </Box>

      <ProjectsList initialProjects={projects} />
    </Box>
  );
}

