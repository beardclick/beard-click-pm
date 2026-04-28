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
import { 
  getDashboardStats, 
  getRecentActivity, 
  getUpcomingMeetings 
} from "@/app/actions/dashboard";
import { Briefcase, Calendar, MessageSquare, Users, ChevronRight } from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/date-utils";

export default async function AdminDashboardPage() {
  const [stats, activities, meetings] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
    getUpcomingMeetings()
  ]);

  const cards = [
    { label: "Clientes", value: stats.clients, color: "#2563eb", icon: Users },
    { label: "Proyectos", value: stats.projects, color: "#16a34a", icon: Briefcase },
    { label: "Reuniones", value: stats.meetings, color: "#d97706", icon: Calendar },
    { label: "Comentarios", value: stats.comments, color: "#9333ea", icon: MessageSquare },
  ];

  const getActivityLink = (activity: any) => {
    if (activity.project_id) return `/admin/projects/${activity.project_id}`;
    if (activity.type === 'client') return `/admin/clients`;
    if (activity.type === 'meeting') return `/admin/meetings`;
    return '#';
  };

  return (
    <Box>
      <Typography variant="h5" sx={{fontWeight: 700}} gutterBottom>
        Panel de Control
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 6, sm: 6, md: 3 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{fontWeight: 500}}>
                      {card.label}
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 1, color: card.color , fontWeight: 700, fontSize: { xs: '1.8rem', sm: '3rem' }, lineHeight: 1.1 }} >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ p: { xs: 0.75, sm: 1 }, borderRadius: 2, bgcolor: `${card.color}10`, color: card.color }}>
                    <card.icon size={20} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Area */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 , fontWeight: 600}} >
                Actividad Reciente
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
                          <Avatar src={activity.profiles?.avatar_url} sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                            {activity.profiles?.full_name?.[0] || 'U'}
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
                      </ListItem>
                    </Link>
                    {index < activities.length - 1 && <Divider component="li" />}
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No hay actividad reciente para mostrar.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Meetings */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 , fontWeight: 600}} >
                Próximas Reuniones
              </Typography>
              <List sx={{ p: 0 }}>
                {meetings.length > 0 ? meetings.map((meeting, index) => (
                  <Box key={meeting.id}>
                    <Link href="/admin/meetings" style={{ textDecoration: 'none', color: 'inherit' }}>
                      <ListItem sx={{ px: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
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
                      </ListItem>
                    </Link>
                    {index < meetings.length - 1 && <Divider component="li" />}
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No hay reuniones programadas.
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

