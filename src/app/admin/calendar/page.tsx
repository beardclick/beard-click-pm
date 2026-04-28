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
import { alpha, useTheme } from "@mui/material/styles";
import { ChevronLeft, ChevronRight, Video, Clock, X, Pencil } from "lucide-react";
import Link from "next/link";
import { getMeetings } from "@/app/actions/meetings";

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

const ToolbarComponent = ({ label, onNavigate }: any) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, gap: 1, flexWrap: "wrap" }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <IconButton size="small" onClick={() => onNavigate("PREV")}>
        <ChevronLeft size={18} />
      </IconButton>
      <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 180 }}>
        {label}
      </Typography>
      <IconButton size="small" onClick={() => onNavigate("NEXT")}>
        <ChevronRight size={18} />
      </IconButton>
    </Box>
    <Button size="small" variant="outlined" onClick={() => onNavigate("TODAY")}>
      Hoy
    </Button>
  </Box>
)

export default function AdminCalendarPage() {
  const theme = useTheme();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    async function loadMeetings() {
      const meetings = await getMeetings();
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
      
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          p: 2,
          bgcolor: "background.paper",
          '& .rbc-toolbar button': {
            color: 'text.primary',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          },
          '& .rbc-toolbar button:hover, & .rbc-toolbar button:focus': {
            backgroundColor: 'action.hover',
          },
          '& .rbc-toolbar button.rbc-active': {
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            borderColor: 'primary.main',
          },
          '& .rbc-toolbar-label': {
            color: 'text.primary',
            fontWeight: 700,
          },
          '& .rbc-btn-group button + button': {
            borderLeftColor: `${theme.palette.divider} !important`,
          },
          '& .rbc-month-view, & .rbc-time-view, & .rbc-agenda-view': {
            borderColor: 'divider',
            color: 'text.primary',
          },
          '& .rbc-header': {
            color: 'text.secondary',
            backgroundColor: 'background.default',
            borderColor: 'divider',
            fontWeight: 700,
            padding: '8px 4px',
          },
          '& .rbc-date-cell, & .rbc-label, & .rbc-time-header-content, & .rbc-time-gutter': {
            color: 'text.secondary',
          },
          '& .rbc-date-cell > a, & .rbc-row-content .rbc-button-link': {
            color: theme.palette.text.secondary,
          },
          '& .rbc-off-range-bg': {
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.03) : '#f8fafc',
          },
          '& .rbc-off-range, & .rbc-off-range .rbc-button-link': {
            color: theme.palette.mode === 'dark' ? alpha(theme.palette.text.secondary, 0.75) : theme.palette.text.secondary,
          },
          '& .rbc-today': {
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08),
          },
          '& .rbc-timeslot-group, & .rbc-time-content, & .rbc-time-header-content, & .rbc-day-bg, & .rbc-month-row, & .rbc-row-bg, & .rbc-header + .rbc-header, & .rbc-agenda-view table.rbc-agenda-table, & .rbc-agenda-view table.rbc-agenda-table tbody > tr > td': {
            borderColor: `${theme.palette.divider} !important`,
          },
          '& .rbc-time-view .rbc-allday-cell, & .rbc-agenda-view table.rbc-agenda-table thead > tr > th': {
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.secondary,
            borderColor: `${theme.palette.divider} !important`,
          },
          '& .rbc-time-slot': {
            color: theme.palette.text.secondary,
          },
          '& .rbc-agenda-view table.rbc-agenda-table tbody > tr:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          '& .rbc-current-time-indicator': {
            backgroundColor: 'error.main',
          },
          '& .rbc-show-more': {
            color: 'primary.main',
            backgroundColor: 'transparent',
          },
        }}
      >
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
            event: EventComponent,
            toolbar: ToolbarComponent,
          }}
          style={{ height: "100%" }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.32 : 0.14),
              color: theme.palette.text.primary,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
              borderRadius: '8px',
            },
          })}
          dayPropGetter={() => ({
            style: {
              backgroundColor: theme.palette.background.paper,
            },
          })}
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
                <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                  <Clock size={20} />
                </Box>
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
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: alpha(theme.palette.primary.main, 0.45),
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.08),
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}
                  >
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
          {selectedEvent && (
            <Button
              component={Link}
              href={`/admin/meetings/${selectedEvent.id}/edit`}
              variant="outlined"
              startIcon={<Pencil size={16} />}
            >
              Editar
            </Button>
          )}
          <Button onClick={() => setSelectedEvent(null)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

