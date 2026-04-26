import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { 
  getClientDashboardStats, 
  getClientActivity, 
  getClientUpcomingMeetings 
} from "@/app/actions/dashboard";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const [stats, activities, meetings] = await Promise.all([
    getClientDashboardStats(user.id),
    getClientActivity(user.id),
    getClientUpcomingMeetings(user.id)
  ]);

  const getActivityLink = (activity: any) => {
    if (activity.project_id) return `/client/projects/${activity.project_id}`;
    if (activity.type === 'meeting') return `/client/meetings`;
    return '#';
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Panel de Cliente
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Mis Proyectos Activos
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mt: 1, color: "primary.main" }}>
                {stats.activeProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Próximas Reuniones
              </Typography>
              <Typography variant="h3" fontWeight={700} sx={{ mt: 1, color: "secondary.main" }}>
                {stats.upcomingMeetings}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Actividad de mis Proyectos
              </Typography>
              <List sx={{ p: 0 }}>
                {activities.length > 0 ? activities.map((activity, index) => (
                  <Box key={activity.id}>
                    <Link href={getActivityLink(activity)} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItem 
                        alignItems="flex-start" 
                        sx={{ 
                          px: 1, 
                          py: 1.5, 
                          borderRadius: 2,
                          '&:hover': { bgcolor: 'action.hover' } 
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={activity.profiles?.avatar_url} sx={{ width: 40, height: 40 }}>
                            {activity.profiles?.full_name?.[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight={700}>
                              {activity.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'inline', mr: 1 }}>
                                {activity.profiles?.full_name}
                              </Typography>
                              {activity.description} — {new Date(activity.created_at).toLocaleDateString()}
                            </>
                          }
                        />
                        <ChevronRight size={18} style={{ alignSelf: 'center', opacity: 0.3 }} />
                      </ListItem>
                    </Link>
                    {index < activities.length - 1 && <Divider component="li" />}
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No hay actividad reciente.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Agenda de Reuniones
              </Typography>
              <List sx={{ p: 0 }}>
                {meetings.length > 0 ? meetings.map((meeting, index) => (
                  <Box key={meeting.id}>
                    <Link href="/client/meetings" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItem sx={{ px: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight={700}>
                              {meeting.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              {meeting.projects?.name}<br/>
                              {new Date(meeting.starts_at).toLocaleString()}
                            </>
                          }
                        />
                        <ChevronRight size={16} style={{ opacity: 0.3 }} />
                      </ListItem>
                    </Link>
                    {index < meetings.length - 1 && <Divider component="li" />}
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    Sin reuniones próximas.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
