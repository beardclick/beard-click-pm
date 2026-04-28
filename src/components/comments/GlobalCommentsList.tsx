'use client'

import React, { useState, useMemo } from 'react'
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { Search, Clock, Briefcase } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/date-utils";

interface GlobalCommentsListProps {
  initialComments: any[];
  projects: any[];
}

export function GlobalCommentsList({ initialComments, projects }: GlobalCommentsListProps) {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  const filteredComments = useMemo(() => {
    return initialComments
      .filter(comment => {
        const searchLower = search.toLowerCase();
        const matchesSearch = (
          comment.content?.toLowerCase().includes(searchLower) ||
          comment.profiles?.full_name?.toLowerCase().includes(searchLower) ||
          comment.projects?.name?.toLowerCase().includes(searchLower)
        );
        
        const matchesProject = projectFilter === 'all' || comment.project_id === projectFilter;
        
        return matchesSearch && matchesProject;
      });
  }, [initialComments, search, projectFilter]);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Buscar comentarios, autores o proyectos..."
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
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="project-filter-label">Filtrar por Proyecto</InputLabel>
          <Select
            labelId="project-filter-label"
            value={projectFilter}
            label="Filtrar por Proyecto"
            onChange={(e) => setProjectFilter(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Briefcase size={16} />
              </InputAdornment>
            }
          >
            <MenuItem value="all">Todos los proyectos</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {filteredComments.length > 0 ? filteredComments.map((comment, index) => (
              <Box key={comment.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    component={Link}
                    href={`/admin/projects/${comment.project_id}`}
                    sx={{
                      alignItems: 'flex-start',
                      color: 'inherit',
                      '&:hover': { bgcolor: 'action.hover' },
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar alt={comment.profiles?.full_name} src={comment.profiles?.avatar_url}>
                        {comment.profiles?.full_name?.[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                            {comment.profiles?.full_name}
                          </Typography>
                          <Chip size="small" label={comment.projects?.name} sx={{ fontSize: '0.65rem', fontWeight: 600 }} variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block', mb: 1 }}
                          >
                            {comment.content}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                            <Clock size={12} />
                            <Typography variant="caption">
                              {formatDateTime(comment.created_at)}
                            </Typography>
                          </Box>
                        </>
                      }
                    />
                  </ListItemButton>
                </ListItem>
                {index < filteredComments.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            )) : (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No se encontraron comentarios con esos criterios.
                </Typography>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}
