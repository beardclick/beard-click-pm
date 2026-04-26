"use client";

import React, { useState, useEffect } from "react";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { Video, Clock, X } from "lucide-react";
import { getUpcomingMeetings } from "@/app/actions/dashboard";

dayjs.locale("es");
const localizer = dayjsLocalizer(dayjs);

// Componente personalizado para el evento en el calendario
const EventComponent = ({ event }: any) => (
  <Box sx={{ fontSize: '0.75rem', overflow: 'hidden' }}>
    <Typography component="span" sx={{ fontWeight: 700, mr: 0.5 }}>
      {dayjs(event.start).format('HH:mm')}
    </Typography>
    <Typography component="span">
      {event.title}
    </Typography>
  </Box>
);

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    async function loadMeetings() {
      const meetings = await getUpcomingMeetings();
      const formattedEvents = meetings.map((m: any) => ({
        id: m.id,
        title: m.title,
        start: new Date(m.starts_at),
        end: new Date(m.ends_at || new Date(m.starts_at).getTime() + 3600000),
        resource: m,
      }));
      setEvents(formattedEvents);
    }
    loadMeetings();
  }, []);

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
  };

  return (
    <Box sx={{ height: "calc(100vh - 140px)" }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Calendario de Reuniones
      </Typography>
      
      <Paper variant="outlined" sx={{ height: "100%", p: 2 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          messages={{
            next: "Sig",
            previous: "Ant",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
          }}
          culture="es"
          onSelectEvent={handleSelectEvent}
          components={{
            event: EventComponent
          }}
          style={{ height: "100%" }}
        />
      </Paper>

      {/* Modal de Detalles de Reunión */}
      <Dialog 
        open={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Detalles de la Reunión
          <IconButton onClick={() => setSelectedEvent(null)} size="small">
            <X size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Stack spacing={2.5} sx={{ py: 1 }}>
              <Box>
                <Typography variant="overline" color="primary" sx={{ fontWeight: 700 }}>
                  PROYECTO: {selectedEvent.projects?.name}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedEvent.title}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Clock size={20} color="#64748b" />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dayjs(selectedEvent.starts_at).format('dddd, D [de] MMMM [de] YYYY')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(selectedEvent.starts_at).format('HH:mm')}
                  </Typography>
                </Box>
              </Box>

              {selectedEvent.meeting_url && (
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, border: 1, borderColor: 'primary.main' }}>
                  <Typography variant="subtitle2" color="primary.dark" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Video size={16} /> Enlace de la reunión
                  </Typography>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    component="a" 
                    href={selectedEvent.meeting_url} 
                    target="_blank"
                    startIcon={<Video size={18} />}
                  >
                    Unirse ahora
                  </Button>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEvent(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

