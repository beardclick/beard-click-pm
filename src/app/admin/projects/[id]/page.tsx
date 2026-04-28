import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Link from "next/link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { ArrowLeft, Edit, Calendar, Video, Clock } from "lucide-react";
import { getProject, getProjectMaintenanceLogs, getProjectWebAccesses } from "@/app/actions/projects";
import { getComments } from "@/app/actions/comments";
import { getProjectFiles } from "@/app/actions/files";
import { getProjectMeetings } from "@/app/actions/meetings";
import { CommentsSection } from "@/components/projects/CommentsSection";
import { FilesSection } from "@/components/projects/FilesSection";
import { WebMaintenanceSection } from "@/components/projects/WebMaintenanceSection";
import { notFound } from "next/navigation";
import { formatDateOnly, formatDateTime } from "@/lib/date-utils";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const project = await getProject(id);
  
  if (!project) notFound();

  const [comments, files, meetings, webAccesses, maintenanceLogs] = await Promise.all([
    getComments(id),
    getProjectFiles(id),
    getProjectMeetings(id),
    getProjectWebAccesses(id),
    getProjectMaintenanceLogs(id),
  ]);

  const statusMap = {
    active: { label: "Activo", color: "success" },
    completed: { label: "Completado", color: "primary" },
    on_hold: { label: "En Pausa", color: "warning" },
  } as any;

  const currentStatus = statusMap[project.status] || { label: project.status, color: "default" };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/admin/projects" style={{ textDecoration: 'none' }}>
          <Button 
            startIcon={<ArrowLeft size={18} />}
            variant="text"
          >
            Volver a Proyectos
          </Button>
        </Link>
        <Link href={`/admin/projects/${id}/edit`} style={{ textDecoration: 'none' }}>
          <Button 
            startIcon={<Edit size={18} />}
            variant="outlined"
          >
            Editar Proyecto
          </Button>
        </Link>
      </Box>

      <Grid container spacing={4}>
        {/* Columna Izquierda: Detalles y Comentarios */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h4" sx={{fontWeight: 700}}>
                  {project.name}
                </Typography>
                <Chip label={currentStatus.label} color={currentStatus.color} variant="filled" />
              </Box>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {project.description || "Sin descripción."}
              </Typography>

              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                    FECHA DE ENTREGA
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Calendar size={16} />
                    <Typography variant="body2" sx={{fontWeight: 500}}>
                      {project.due_date ? formatDateOnly(project.due_date) : "No definida"}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                    CLIENTE
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 , fontWeight: 500}}>
                    {project.clients?.name || "Sin cliente asignado"}
                  </Typography>
                </Box>
                <Box sx={{ minWidth: 260, maxWidth: 420 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                    ACCESOS WEB
                  </Typography>
                  {webAccesses.length === 0 ? (
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500 }}>
                      Sin URLs registradas
                    </Typography>
                  ) : (
                    <Box sx={{ mt: 0.5, display: 'grid', gap: 0.35 }}>
                      {webAccesses.map((access: any) => (
                        <Typography key={access.id} variant="body2" sx={{ fontWeight: 500 }}>
                          {access.website_url} • {access.access_username}
                        </Typography>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          <CommentsSection projectId={id} initialComments={comments} />
          <WebMaintenanceSection projectId={id} initialLogs={maintenanceLogs} />
        </Grid>

        {/* Columna Derecha: Archivos y Reuniones */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* Sección de Archivos */}
          <FilesSection projectId={id} initialFiles={files} />

          {/* Sección de Reuniones */}
          <Card variant="outlined" sx={{ mt: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{fontWeight: 600}}>
                  Reuniones
                </Typography>
                <Link href="/admin/meetings/new" style={{ textDecoration: 'none' }}>
                  <Button size="small" variant="text" startIcon={<Calendar size={16} />}>
                    Agendar
                  </Button>
                </Link>
              </Box>
              
              {(() => {
                const now = new Date().getTime();
                const upcoming = meetings.filter((m: any) => new Date(m.starts_at).getTime() >= now).sort((a: any, b: any) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
                const past = meetings.filter((m: any) => new Date(m.starts_at).getTime() < now).sort((a: any, b: any) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

                return (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Clock size={16} /> Próximas
                    </Typography>
                    <List disablePadding>
                      {upcoming.length > 0 ? upcoming.map((meeting: any, index: number) => (
                        <Box key={meeting.id}>
                          <ListItem sx={{ px: 0, py: 1.5 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                                {meeting.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {formatDateTime(meeting.starts_at)}
                              </Typography>
                              {meeting.meeting_url && (
                                <Button 
                                  component="a" 
                                  href={meeting.meeting_url} 
                                  target="_blank"
                                  size="small" 
                                  variant="outlined" 
                                  fullWidth
                                  startIcon={<Video size={14} />}
                                  sx={{ mt: 1.5 }}
                                >
                                  Unirse
                                </Button>
                              )}
                            </Box>
                          </ListItem>
                          {index < upcoming.length - 1 && <Divider />}
                        </Box>
                      )) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          No hay reuniones próximas.
                        </Typography>
                      )}
                    </List>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary' }}>
                      Pasadas
                    </Typography>
                    <List disablePadding>
                      {past.length > 0 ? past.map((meeting: any, index: number) => (
                        <Box key={meeting.id}>
                          <ListItem sx={{ px: 0, py: 1.5, opacity: 0.8 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                                {meeting.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {formatDateTime(meeting.starts_at)}
                              </Typography>
                            </Box>
                          </ListItem>
                          {index < past.length - 1 && <Divider />}
                        </Box>
                      )) : (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                          No hay reuniones pasadas.
                        </Typography>
                      )}
                    </List>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
