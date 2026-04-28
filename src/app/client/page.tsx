import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { ChevronRight } from "lucide-react";
import { 
  getClientDashboardStats, 
  getClientActivity, 
  getClientUpcomingMeetings 
} from "@/app/actions/dashboard";
import { getCurrentClientRecord } from "@/lib/client-access";
import { formatDate, formatDateTime } from "@/lib/date-utils";
import AppLink from "@/components/ui/AppLink";

export default async function ClientDashboardPage() {
  const client = await getCurrentClientRecord();
  
  if (!client) return null;

  const [stats, activities, meetings] = await Promise.all([
    getClientDashboardStats(client.id),
    getClientActivity(client.id),
    getClientUpcomingMeetings(client.id)
  ]);

  const getActivityLink = (activity: any) => {
    if (activity.project_id) return `/client/projects/${activity.project_id}`;
    if (activity.type === 'meeting') return `/client/meetings`;
    return '#';
  };

  return (
    <Box>
      <Typography variant="h5" sx={{fontWeight: 700}} gutterBottom>
        Panel de Cliente
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 6, sm: 6 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="body2" color="text.secondary" sx={{fontWeight: 500}}>
                Mis Proyectos Activos
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, color: "primary.main" , fontWeight: 700, fontSize: { xs: '1.8rem', sm: '3rem' }, lineHeight: 1.1 }} >
                {stats.activeProjects}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 6, sm: 6 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="body2" color="text.secondary" sx={{fontWeight: 500}}>
                Próximas Reuniones
              </Typography>
              <Typography variant="h3" sx={{ mt: 1, color: "secondary.main" , fontWeight: 700, fontSize: { xs: '1.8rem', sm: '3rem' }, lineHeight: 1.1 }} >
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
              <Typography variant="h6" sx={{ mb: 2 , fontWeight: 600}} >
                Actividad de mis Proyectos
              </Typography>
              <List sx={{ p: 0 }}>
                {activities.length > 0 ? activities.map((activity, index) => (
                  <Box key={activity.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={AppLink}
                        href={getActivityLink(activity)}
                        sx={{
                          px: 1,
                          py: 1.5,
                          borderRadius: 2,
                          alignItems: 'flex-start',
                          color: 'inherit',
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
                            <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                              {activity.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'inline', mr: 1 }}>
                                {activity.profiles?.full_name}
                              </Typography>
                              {activity.description} — {formatDate(activity.created_at)}
                            </>
                          }
                        />
                        <ChevronRight size={18} style={{ alignSelf: 'center', opacity: 0.3 }} />
                      </ListItemButton>
                    </ListItem>
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
              <Typography variant="h6" sx={{ mb: 2 , fontWeight: 600}} >
                Agenda de Reuniones
              </Typography>
              <List sx={{ p: 0 }}>
                {meetings.length > 0 ? meetings.map((meeting, index) => (
                  <Box key={meeting.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        component={AppLink}
                        href="/client/meetings"
                        sx={{ px: 1, borderRadius: 2, color: 'inherit', '&:hover': { bgcolor: 'action.hover' } }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                              {meeting.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              {meeting.projects?.name}<br/>
                              {formatDateTime(meeting.starts_at)}
                            </>
                          }
                        />
                        <ChevronRight size={16} style={{ opacity: 0.3 }} />
                      </ListItemButton>
                    </ListItem>
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

