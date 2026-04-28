import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Link from "next/link";
import { FileText } from "lucide-react";
import Chip from "@mui/material/Chip";
import { getClientProjects } from "@/app/actions/projects";
import { getCurrentClientRecord } from "@/lib/client-access";
import { CopyProjectUrlButton } from "@/components/projects/CopyProjectUrlButton";
import { formatDate, formatDateOnly } from "@/lib/date-utils";

const statusColor: Record<string, "success" | "warning" | "default" | "error" | "primary"> = {
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

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nombre del Proyecto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>URL</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Plan Mantenimiento</TableCell>
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
                  <TableCell sx={{ minWidth: 250 }}>
                    {project.primary_website_url ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {project.primary_website_url}
                          </Typography>
                          {project.website_urls_count > 1 && (
                            <Typography variant="caption" color="text.secondary">
                              +{project.website_urls_count - 1} URL(s)
                            </Typography>
                          )}
                        </Box>
                        <CopyProjectUrlButton url={project.primary_website_url} />
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Sin URL
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.maintenance_plan_active ? (
                      <Box>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
                          ACTIVO
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vence: {formatDateOnly(project.maintenance_plan_expires_at)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={statusLabel[project.status] || project.status} 
                      color={statusColor[project.status] || "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                    {formatDate(project.created_at)}
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
                    <Link href={`/client/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                      <Button size="small" variant="outlined" color="primary">
                        Ver Proyecto
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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

