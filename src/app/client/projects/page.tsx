import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { Eye, FileText } from "lucide-react";
import Chip from "@mui/material/Chip";
import { getProjects } from "@/app/actions/projects";

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

export default async function ClientProjectsPage() {
  const projects = await getProjects();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{fontWeight: 700}}>Mis Proyectos</Typography>
        <Typography variant="body2" color="text.secondary">
          Aquí puedes ver el estado y archivos de todos tus proyectos activos.
        </Typography>
      </Box>

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "grey.50" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre del Proyecto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha de Inicio</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Archivos</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Ver Detalles</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{fontWeight: 600}}>{project.name}</Typography>
                  </TableCell>
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
                    <Link href={`/client/projects/${project.id}`}>
                      <IconButton size="small" color="primary">
                        <Eye size={18} />
                      </IconButton>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Aún no tienes proyectos asignados.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}

