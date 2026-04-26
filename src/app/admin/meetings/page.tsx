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
import { Plus, Video, MapPin, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { getMeetings } from "@/app/actions/meetings";
import { AutoRead } from "@/components/layout/AutoRead";

export default async function MeetingsPage() {
  const meetings = await getMeetings();

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

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Evento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Proyecto</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha y Hora</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ubicación</TableCell>
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
                      <CalendarIcon size={14} color="gray" />
                      <Typography variant="body2">
                        {new Date(meeting.starts_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {meeting.location?.includes('http') ? <Video size={14} /> : <MapPin size={14} />}
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
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
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

