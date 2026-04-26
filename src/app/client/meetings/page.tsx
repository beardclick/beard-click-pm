import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import { createClient } from "@/lib/supabase/server";
import { getClientMeetings } from "@/app/actions/meetings";

export default async function ClientMeetingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const meetings = await getClientMeetings(user.id);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Mis Reuniones
      </Typography>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Proyecto</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Hora</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {meetings.length > 0 ? meetings.map((meeting: any) => {
              const start = new Date(meeting.starts_at);
              const isUpcoming = start > new Date();
              
              return (
                <TableRow key={meeting.id} hover>
                  <TableCell sx={{ fontWeight: 500 }}>{meeting.title}</TableCell>
                  <TableCell>{meeting.projects?.name}</TableCell>
                  <TableCell>{start.toLocaleDateString()}</TableCell>
                  <TableCell>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell>{meeting.location || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={isUpcoming ? "Próxima" : "Pasada"}
                      color={isUpcoming ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {meeting.location && meeting.location.startsWith('http') ? (
                      <a 
                        href={meeting.location} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ color: '#2563eb', fontWeight: 500, fontSize: '0.875rem', textDecoration: 'none' }}
                      >
                        Unirse
                      </a>
                    ) : (
                      <Typography variant="caption" color="text.secondary">Ver detalles</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            }) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No tienes reuniones programadas.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
