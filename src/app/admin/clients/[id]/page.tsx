import Link from "next/link";
import { ChevronLeft, Edit, FileText, MessageSquare, Briefcase } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import { notFound } from "next/navigation";
import { getClientDetail } from "@/app/actions/clients";
import { getReassignableProjectsForClient } from "@/app/actions/projects";
import { ClientProjectsManager } from "@/components/clients/ClientProjectsManager";
import { formatDateTime } from "@/lib/date-utils";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const detail = await getClientDetail(resolvedParams.id);
  const reassignableProjects = await getReassignableProjectsForClient(resolvedParams.id);

  if (!detail) {
    notFound();
  }

  const { client, hasPortalAccess, projects, comments, files } = detail;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href="/admin/clients">
            <IconButton sx={{ color: "text.secondary" }}>
              <ChevronLeft size={22} />
            </IconButton>
          </Link>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {client.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Vista completa del cliente, sus proyectos y actividad reciente.
            </Typography>
          </Box>
        </Box>

        <Link href={`/admin/clients/${client.id}/edit`} style={{ textDecoration: "none" }}>
          <Button variant="outlined" startIcon={<Edit size={18} />}>
            Editar Cliente
          </Button>
        </Link>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                INFORMACIÓN
              </Typography>

              <Box sx={{ mt: 2, display: "grid", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    EMAIL
                  </Typography>
                  <Typography variant="body2">{client.email}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    COMPAÑÍA
                  </Typography>
                  <Typography variant="body2">{client.company || "No definida"}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                    ACCESO AL PORTAL
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      color={hasPortalAccess ? "success" : "default"}
                      label={hasPortalAccess ? "Activo" : "Pendiente"}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Briefcase size={18} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Proyectos
                  </Typography>
                  <Chip size="small" label={projects.length} />
                </Box>
                <ClientProjectsManager
                  clientId={client.id}
                  reassignableProjects={reassignableProjects}
                />
              </Box>

              {projects.length > 0 ? (
                <List disablePadding>
                  {projects.map((project: any, index: number) => (
                    <Box key={project.id}>
                      <ListItem
                        component={Link}
                        href={`/admin/projects/${project.id}`}
                        sx={{ px: 0, color: "inherit" }}
                      >
                        <ListItemText
                          primary={project.name}
                          secondary={project.description || "Sin descripción"}
                        />
                        <Chip size="small" label={project.status} />
                      </ListItem>
                      {index < projects.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Este cliente aún no tiene proyectos asignados.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <MessageSquare size={18} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Feed de Comentarios
                    </Typography>
                  </Box>

                  {comments.length > 0 ? (
                    <List disablePadding>
                      {comments.map((comment: any, index: number) => (
                        <Box key={comment.id}>
                          <ListItem sx={{ px: 0, alignItems: "flex-start" }}>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    {comment.profiles?.full_name || "Usuario"}
                                  </Typography>
                                  <Chip size="small" label={comment.projects?.name || "Proyecto"} />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                                    {comment.content}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDateTime(comment.created_at)}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {index < comments.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay comentarios recientes en los proyectos de este cliente.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <FileText size={18} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Archivos Recientes
                    </Typography>
                  </Box>

                  {files.length > 0 ? (
                    <List disablePadding>
                      {files.map((file: any, index: number) => (
                        <Box key={file.id}>
                          <ListItem
                            component="a"
                            href={file.file_path || file.url}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ px: 0, color: "inherit" }}
                          >
                            <ListItemText
                              primary={file.file_name || file.name || 'Archivo'}
                              secondary={
                                <>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                    Proyecto: {file.projects?.name || "Sin proyecto"}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {(file.profiles?.full_name || file.uploaded_by_profile?.full_name || "Usuario")} • {formatDateTime(file.created_at)}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {index < files.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No hay archivos recientes para este cliente.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
