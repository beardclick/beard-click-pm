import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getProjects } from "@/app/actions/projects";
import { AutoRead } from "@/components/layout/AutoRead";
import { ProjectsList } from "@/components/projects/ProjectsList";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <Box>
      <AutoRead type="projects" />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" sx={{fontWeight: 700}}>Proyectos</Typography>
        <Link href="/admin/projects/new" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<Plus size={18} />}>
            Nuevo Proyecto
          </Button>
        </Link>
      </Box>

      <ProjectsList initialProjects={projects} />
    </Box>
  );
}

