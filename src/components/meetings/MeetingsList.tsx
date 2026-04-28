'use client'

import React, { useState, useMemo } from 'react'
import Link from "next/link";
import { Plus, Video, MapPin, Calendar as CalendarIcon, Edit, Search } from "lucide-react";
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
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TableSortLabel from "@mui/material/TableSortLabel";
import { formatDateTime } from "@/lib/date-utils";

type SortField = 'title' | 'project' | 'starts_at' | 'location';
type SortOrder = 'asc' | 'desc';

interface MeetingsListProps {
  initialMeetings: any[];
  isAdmin?: boolean;
}

export function MeetingsList({ initialMeetings, isAdmin = true }: MeetingsListProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('starts_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [dateFilter, setDateFilter] = useState('upcoming');

  const filteredAndSortedMeetings = useMemo(() => {
    return initialMeetings
      .filter(meeting => {
        const searchLower = search.toLowerCase();
        return (
          meeting.title?.toLowerCase().includes(searchLower) ||
          meeting.location?.toLowerCase().includes(searchLower) ||
          meeting.projects?.name?.toLowerCase().includes(searchLower)
        );
      })
      .filter(meeting => {
        if (dateFilter === 'all') return true;
        const meetingDate = new Date(meeting.starts_at).getTime();
        const now = new Date().getTime();
        if (dateFilter === 'upcoming') return meetingDate >= now;
        if (dateFilter === 'past') return meetingDate < now;
        return true;
      })
      .sort((a, b) => {
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
  }, [initialMeetings, search, sortField, sortOrder, dateFilter]);

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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={dateFilter}
            label="Estado"
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <MenuItem value="all">Todas</MenuItem>
            <MenuItem value="upcoming">Próximas</MenuItem>
            <MenuItem value="past">Pasadas</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card variant="outlined" sx={{ bgcolor: "background.paper" }}>
        <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "transparent" }}>
          <Table>
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
              {filteredAndSortedMeetings.length > 0 ? filteredAndSortedMeetings.map((meeting) => (
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
              )) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay reuniones que coincidan con la búsqueda.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
