'use client'

import React, { useState, useMemo } from 'react'
import Link from "next/link";
import { Plus, Video, MapPin, Calendar as CalendarIcon, Edit, Search, Clock, CheckCircle2 } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import TableSortLabel from "@mui/material/TableSortLabel";
import { formatDateTime } from "@/lib/date-utils";

type SortField = 'title' | 'project' | 'starts_at' | 'location';
type SortOrder = 'asc' | 'desc';

interface MeetingsListProps {
  initialMeetings: any[];
  isAdmin?: boolean;
}

function MeetingsTable({ meetings, sortField, sortOrder, handleSort, isAdmin }: {
  meetings: any[];
  sortField: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;
  isAdmin: boolean;
}) {
  if (meetings.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No hay reuniones en esta sección.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'background.default' }}>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortField === 'title'}
                direction={sortField === 'title' ? sortOrder : 'asc'}
                onClick={() => handleSort('title')}
                sx={{ fontWeight: 600 }}
              >
                Evento
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'project'}
                direction={sortField === 'project' ? sortOrder : 'asc'}
                onClick={() => handleSort('project')}
                sx={{ fontWeight: 600 }}
              >
                Proyecto
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'starts_at'}
                direction={sortField === 'starts_at' ? sortOrder : 'asc'}
                onClick={() => handleSort('starts_at')}
                sx={{ fontWeight: 600 }}
              >
                Fecha y Hora
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === 'location'}
                direction={sortField === 'location' ? sortOrder : 'asc'}
                onClick={() => handleSort('location')}
                sx={{ fontWeight: 600 }}
              >
                Ubicación
              </TableSortLabel>
            </TableCell>
            <TableCell sx={{ fontWeight: 600 }} align="right">
              {isAdmin ? "Acciones" : "Link"}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {meetings.map((meeting) => (
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
                    {formatDateTime(meeting.starts_at)}
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
                {isAdmin ? (
                  <Link href={`/admin/meetings/${meeting.id}/edit`} style={{ textDecoration: "none" }}>
                    <Button size="small" variant="outlined" startIcon={<Edit size={16} />}>
                      Editar
                    </Button>
                  </Link>
                ) : (
                  meeting.location?.includes('http') ? (
                    <Button 
                      size="small" 
                      variant="contained" 
                      component="a" 
                      href={meeting.location} 
                      target="_blank" 
                      rel="noreferrer"
                    >
                      Unirse
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">Presencial</Typography>
                  )
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function MeetingsList({ initialMeetings, isAdmin = true }: MeetingsListProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('starts_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const now = new Date().getTime();

  const filtered = useMemo(() => {
    return initialMeetings.filter(meeting => {
      const searchLower = search.toLowerCase();
      return (
        meeting.title?.toLowerCase().includes(searchLower) ||
        meeting.location?.toLowerCase().includes(searchLower) ||
        meeting.projects?.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [initialMeetings, search]);

  const sortMeetings = (meetings: any[]) => {
    return [...meetings].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title' || sortField === 'location') {
        comparison = (a[sortField] || '').localeCompare(b[sortField] || '');
      } else if (sortField === 'project') {
        comparison = (a.projects?.name || '').localeCompare(b.projects?.name || '');
      } else {
        comparison = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const upcomingMeetings = useMemo(() => {
    return sortMeetings(filtered.filter(m => new Date(m.starts_at).getTime() >= now));
  }, [filtered, sortField, sortOrder, now]);

  const pastMeetings = useMemo(() => {
    return sortMeetings(filtered.filter(m => new Date(m.starts_at).getTime() < now));
  }, [filtered, sortField, sortOrder, now]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar reuniones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '200px' }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {/* Próximas Reuniones */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Clock size={18} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Próximas Reuniones
          </Typography>
          <Chip size="small" label={upcomingMeetings.length} color="primary" />
        </Box>
        <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
          <MeetingsTable
            meetings={upcomingMeetings}
            sortField={sortField}
            sortOrder={sortOrder}
            handleSort={handleSort}
            isAdmin={isAdmin}
          />
        </Card>
      </Box>

      {/* Reuniones Pasadas */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <CheckCircle2 size={18} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Reuniones Pasadas
          </Typography>
          <Chip size="small" label={pastMeetings.length} variant="outlined" />
        </Box>
        <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
          <MeetingsTable
            meetings={pastMeetings}
            sortField={sortField}
            sortOrder={sortOrder}
            handleSort={handleSort}
            isAdmin={isAdmin}
          />
        </Card>
      </Box>
    </Box>
  )
}
