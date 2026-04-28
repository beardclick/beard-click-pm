'use client'

import React, { useState, useMemo } from 'react'
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
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { Search, Eye, FileText } from "lucide-react";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TableSortLabel from "@mui/material/TableSortLabel";
import { ProjectDeleteButton } from "@/components/projects/ProjectDeleteButton";
import { CopyProjectUrlButton } from "@/components/projects/CopyProjectUrlButton";
import { formatDate } from "@/lib/date-utils";

const statusColor: Record<string, "success" | "warning" | "default" | "error" | "primary"> = {
  "active": "success",
  "completed": "primary",
  "on_hold": "warning"
};

const statusLabel: Record<string, string> = {
  "active": "Activo",
  "completed": "Completado",
  "paused": "En Pausa",
  "on_hold": "En Pausa",
  "cancelled": "Cancelado"
};

type SortField = 'name' | 'client_name' | 'status' | 'created_at' | 'maintenance' | 'files_count';
type SortOrder = 'asc' | 'desc';

interface ProjectsListProps {
  initialProjects: any[];
  isAdmin?: boolean;
}

export function ProjectsList({ initialProjects, isAdmin = true }: ProjectsListProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('recent');

  const filteredAndSortedProjects = useMemo(() => {
    return initialProjects
      .filter(project => {
        const searchLower = search.toLowerCase();
        
        // Búsqueda robusta (si no hay búsqueda, pasa todo)
        const matchesSearch = !search || [
          project.name,
          project.clients?.name,
          project.primary_website_url
        ].some(val => val?.toLowerCase().includes(searchLower));
        
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name') {
          comparison = (a.name || '').localeCompare(b.name || '');
        } else if (sortField === 'client_name') {
          comparison = (a.clients?.name || '').localeCompare(b.clients?.name || '');
        } else if (sortField === 'status') {
          comparison = (a.status || '').localeCompare(b.status || '');
        } else if (sortField === 'maintenance') {
          const aActive = a.maintenance_plan_active ? 1 : 0;
          const bActive = b.maintenance_plan_active ? 1 : 0;
          comparison = aActive - bActive;
        } else if (sortField === 'files_count') {
          comparison = (a.files_count || 0) - (b.files_count || 0);
        } else {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [initialProjects, search, sortField, sortOrder, statusFilter]);

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
          placeholder="Buscar proyectos por nombre o cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1, minWidth: '250px' }}
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
            value={statusFilter}
            label="Estado"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Todos los estados</MenuItem>
            <MenuItem value="active">Activos</MenuItem>
            <MenuItem value="paused">En Pausa</MenuItem>
            <MenuItem value="completed">Completados</MenuItem>
            <MenuItem value="cancelled">Cancelados</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Fecha</InputLabel>
          <Select
            value={dateFilter}
            label="Fecha"
            onChange={(e) => {
              setDateFilter(e.target.value);
              setSortField('created_at');
              setSortOrder(e.target.value === 'recent' ? 'desc' : 'asc');
            }}
          >
            <MenuItem value="recent">Más recientes</MenuItem>
            <MenuItem value="oldest">Más antiguos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Card variant="outlined">
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "background.default" }}>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                    sx={{ fontWeight: 700 }}
                  >
                    Proyecto
                  </TableSortLabel>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'client_name'}
                      direction={sortField === 'client_name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('client_name')}
                      sx={{ fontWeight: 700 }}
                    >
                      Cliente
                    </TableSortLabel>
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: 700 }}>URL Principal</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'maintenance'}
                    direction={sortField === 'maintenance' ? sortOrder : 'asc'}
                    onClick={() => handleSort('maintenance')}
                    sx={{ fontWeight: 700 }}
                  >
                    Mantenimiento
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'status'}
                    direction={sortField === 'status' ? sortOrder : 'asc'}
                    onClick={() => handleSort('status')}
                    sx={{ fontWeight: 700 }}
                  >
                    Estado
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'created_at'}
                    direction={sortField === 'created_at' ? sortOrder : 'asc'}
                    onClick={() => handleSort('created_at')}
                    sx={{ fontWeight: 700 }}
                  >
                    Creado
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">
                  <TableSortLabel
                    active={sortField === 'files_count'}
                    direction={sortField === 'files_count' ? sortOrder : 'asc'}
                    onClick={() => handleSort('files_count')}
                    sx={{ fontWeight: 700 }}
                  >
                    Archivos
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No se encontraron proyectos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedProjects.map((project) => (
                  <TableRow key={project.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{fontWeight: 600}}>{project.name}</Typography>
                    </TableCell>
                    {isAdmin && <TableCell>{project.clients?.name || "N/A"}</TableCell>}
                    <TableCell sx={{ minWidth: 220 }}>
                      {project.primary_website_url ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {project.primary_website_url}
                            </Typography>
                          </Box>
                          <CopyProjectUrlButton url={project.primary_website_url} />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">Sin URL</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {project.maintenance_plan_active ? (
                        <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>ACTIVO</Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Inactivo</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={statusLabel[project.status] || project.status} 
                        color={statusColor[project.status] || "default"}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                      {formatDate(project.created_at)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, color: project.files_count > 0 ? 'primary.main' : 'text.disabled' }}>
                        <FileText size={16} />
                        <Typography variant="body2" sx={{fontWeight: project.files_count > 0 ? 700 : 400}}>
                          {project.files_count}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <IconButton
                          component={Link}
                          href={isAdmin ? `/admin/projects/${project.id}` : `/client/projects/${project.id}`}
                          size="small"
                          color="primary"
                        >
                          <Eye size={18} />
                        </IconButton>
                        {isAdmin && <ProjectDeleteButton projectId={project.id} />}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
