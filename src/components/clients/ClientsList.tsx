'use client'

import React, { useState, useMemo } from 'react'
import Link from "next/link";
import { Eye, Edit, Search, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import TableSortLabel from "@mui/material/TableSortLabel";
import { ClientDeleteButton } from "@/components/clients/ClientDeleteButton";
import { ClientPortalAccessButton } from "@/components/clients/ClientPortalAccessButton";
import { CopyEmailButton } from "@/components/clients/CopyEmailButton";
import { formatDate } from "@/lib/date-utils";

type SortField = 'name' | 'company' | 'email' | 'created_at' | 'projectsCount';
type SortOrder = 'asc' | 'desc';

interface ClientsListProps {
  initialClients: any[];
}

export function ClientsList({ initialClients }: ClientsListProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateFilter, setDateFilter] = useState('recent');

  const filteredAndSortedClients = useMemo(() => {
    return initialClients
      .filter(client => {
        const searchLower = search.toLowerCase();
        return (
          client.name?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'name' || sortField === 'company' || sortField === 'email') {
          comparison = (a[sortField] || '').localeCompare(b[sortField] || '');
        } else if (sortField === 'projectsCount') {
          comparison = a.projectsCount - b.projectsCount;
        } else {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [initialClients, search, sortField, sortOrder]);

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
          placeholder="Buscar clientes..."
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
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={dateFilter}
            label="Ordenar por"
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

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                  sx={{ fontWeight: 700 }}
                >
                  Cliente / Empresa
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'email'}
                  direction={sortField === 'email' ? sortOrder : 'asc'}
                  onClick={() => handleSort('email')}
                  sx={{ fontWeight: 700 }}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'projectsCount'}
                  direction={sortField === 'projectsCount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('projectsCount')}
                  sx={{ fontWeight: 700 }}
                >
                  Proyectos
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortField === 'created_at'}
                  direction={sortField === 'created_at' ? sortOrder : 'asc'}
                  onClick={() => handleSort('created_at')}
                  sx={{ fontWeight: 700 }}
                >
                  Creación
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No se encontraron clientes con esos criterios.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedClients.map((client: any) => (
                <TableRow key={client.id} hover>
                  <TableCell sx={{ minWidth: { xs: 220, sm: 280 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="body2" sx={{fontWeight: 600}}>{client.name}</Typography>
                      <Link href={`/admin/clients/${client.id}`} style={{ textDecoration: 'none' }}>
                        <Button size="small" variant="outlined" startIcon={<Eye size={16} />}>
                          Ver
                        </Button>
                      </Link>
                    </Box>
                    {client.company && (
                      <Typography variant="caption" color="text.secondary">{client.company}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {client.email || "—"}
                      </Typography>
                      {client.email && <CopyEmailButton email={client.email} />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={client.projectsCount} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                    {formatDate(client.created_at)}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <Link href={`/admin/clients/${client.id}/edit`} style={{ textDecoration: 'none' }}>
                        <Button size="small" variant="text" startIcon={<Edit size={16} />}>
                          Editar
                        </Button>
                      </Link>
                      <ClientPortalAccessButton clientId={client.id} hasPortalAccess={Boolean(client.hasPortalAccess)} />
                      <ClientDeleteButton clientId={client.id} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
