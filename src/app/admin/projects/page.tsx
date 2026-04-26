import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { Plus, Eye, FileText } from "lucide-react";
import Chip from "@mui/material/Chip";
import { getProjects } from "@/app/actions/projects";
import { ProjectDeleteButton } from "@/components/projects/ProjectDeleteButton";
import { AutoRead } from "@/components/layout/AutoRead";

const statusColor: Record<string, "success" | "warning" | "default" | "error"> = {
  "active": "success",
  "completed": "primary",
  "on_hold": "warning"
};

const statusLabel: Record<string, string> = {
  "active": "Activo",
  "completed": "Completado",
  "on_hold": "En Pausa"
};

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

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cliente</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Creado</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Archivos</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{fontWeight: 600}}>{project.name}</Typography>
                  </TableCell>
                  <TableCell>{project.clients?.name || "N/A"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={statusLabel[project.status] || project.status} 
                      color={statusColor[project.status] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: project.files_count > 0 ? 'primary.main' : 'text.disabled' }}>
                      <FileText size={16} />
                      <Typography variant="body2" sx={{fontWeight: project.files_count > 0 ? 700 : 400}}>
                        {project.files_count}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <Link href={`/admin/projects/${project.id}`}>
                        <IconButton size="small" color="primary">
                          <Eye size={18} />
                        </IconButton>
                      </Link>
                      <ProjectDeleteButton id={project.id} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

