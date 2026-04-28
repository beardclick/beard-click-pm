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
import Paper from "@mui/material/Paper";
import { Plus, Video, MapPin, Calendar as CalendarIcon, Edit } from "lucide-react";
import Link from "next/link";
import { getMeetings } from "@/app/actions/meetings";
import { AutoRead } from "@/components/layout/AutoRead";

export default async function MeetingsPage() {
  const meetingsData = await getMeetings();
  // Nos aseguramos de que siempre sea un array
  const meetings = meetingsData || [];

  return (
    <Box>
      <AutoRead type="meetings" />
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{fontWeight: 700}}>
          Reuniones Programadas
        </Typography>
        <Link href="/admin/meetings/new" style={{ textDecoration: 'none' }}>
          <Button 
            variant="contained" 
            startIcon={<Plus size={18} />}
          >
            Agendar Reunión
          </Button>
        </Link>
      </Box>

      <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Evento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Proyecto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha y Hora</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {meetings.length > 0 ? meetings.map((meeting) => (
                <TableRow key={meeting.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{fontWeight: 600}}>
                      {meeting.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{meeting.projects?.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                        <CalendarIcon size={14} />
                      </Box>
                      <Typography variant="body2">
                        {new Date(meeting.starts_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                        {meeting.location?.includes('http') ? <Video size={14} /> : <MapPin size={14} />}
                      </Box>
                      <Typography variant="body2" sx={{ 
                        maxWidth: 200, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {meeting.location || "No definida"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Link href={`/admin/meetings/${meeting.id}/edit`} style={{ textDecoration: "none" }}>
                      <Button size="small" variant="outlined" startIcon={<Edit size={16} />}>
                        Editar
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay reuniones agendadas.
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
