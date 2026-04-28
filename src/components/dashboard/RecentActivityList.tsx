'use client'

import React, { useState, useEffect } from 'react'
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Pagination from "@mui/material/Pagination";
import CircularProgress from "@mui/material/CircularProgress";
import { ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import AppLink from "@/components/ui/AppLink";
import { getRecentActivity, getClientActivity } from "@/app/actions/dashboard";

interface RecentActivityListProps {
  initialActivity: any[];
  initialCount: number;
  lastSeenAt?: string | null;
  type: 'admin' | 'client';
  clientId?: string;
  title?: string;
}

export function RecentActivityList({ 
  initialActivity, 
  initialCount, 
  lastSeenAt, 
  type, 
  clientId,
  title = "Actividad Reciente"
}: RecentActivityListProps) {
  const [activities, setActivities] = useState(initialActivity);
  const [count, setCount] = useState(initialCount);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    setLoading(true);
    
    try {
      let result;
      if (type === 'admin') {
        result = await getRecentActivity(value, pageSize);
        setActivities(result.activity);
        setCount(result.count);
      } else if (type === 'client' && clientId) {
        result = await getClientActivity(clientId, value, pageSize);
        setActivities(result.data);
        setCount(result.count);
      }
    } catch (error) {
      console.error("Error fetching activity page:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityLink = (activity: any) => {
    const prefix = type === 'admin' ? '/admin' : '/client';
    if (activity.project_id) return `${prefix}/projects/${activity.project_id}`;
    if (type === 'admin' && activity.type === 'client') return `/admin/clients`;
    if (activity.type === 'meeting') return `${prefix}/meetings`;
    return '#';
  };

  const totalPages = Math.ceil(count / pageSize);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {activities.length > 0 ? (
            activities.map((activity, index) => {
              const isNew = type === 'admin' && (!lastSeenAt || new Date(activity.created_at) > new Date(lastSeenAt));
              
              return (
                <Box key={activity.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={AppLink}
                      href={getActivityLink(activity)}
                      sx={{
                        px: 1,
                        py: 1.5,
                        borderRadius: 2,
                        alignItems: 'flex-start',
                        color: 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <ListItemAvatar sx={{ position: 'relative' }}>
                        <Avatar src={activity.profiles?.avatar_url} sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          {activity.profiles?.full_name?.[0] || 'U'}
                        </Avatar>
                        {isNew && (
                          <Box 
                            sx={{ 
                              position: 'absolute', 
                              top: 0, 
                              right: 8, 
                              width: 12, 
                              height: 12, 
                              bgcolor: 'error.main', 
                              borderRadius: '50%', 
                              border: '2px solid white',
                              zIndex: 1
                            }} 
                          />
                        )}
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {activity.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'inline', mr: 1 }}>
                              {activity.profiles?.full_name}
                            </Typography>
                            {activity.description} — {formatDate(activity.created_at)}
                          </>
                        }
                      />
                      <ChevronRight size={18} style={{ alignSelf: 'center', opacity: 0.3 }} />
                    </ListItemButton>
                  </ListItem>
                  {index < activities.length - 1 && <Divider component="li" />}
                </Box>
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No hay actividad reciente para mostrar.
            </Typography>
          )}
        </List>
      )}

      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}
