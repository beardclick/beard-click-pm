import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import { getClientGlobalComments } from "@/app/actions/comments";
import Link from "next/link";
import { getCurrentClientRecord } from "@/lib/client-access";

export default async function ClientCommentsPage() {
  const client = await getCurrentClientRecord();
  
  if (!client) return null;

  const comments = await getClientGlobalComments(client.id);

  return (
    <Box>
      <Typography variant="h5" sx={{fontWeight: 700}} gutterBottom>
        Feed de Comentarios
      </Typography>

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {comments.length > 0 ? comments.map((comment, index) => (
              <Box key={comment.id}>
                <Link href={`/client/projects/${comment.project_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                  <ListItemAvatar>
                    <Avatar alt={comment.profiles?.full_name} src={comment.profiles?.avatar_url}>
                      {comment.profiles?.full_name?.[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{fontWeight: 700}}>
                          {comment.profiles?.full_name}
                        </Typography>
                        <Chip size="small" label={comment.projects?.name} sx={{ fontSize: '0.65rem' }} />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {comment.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.created_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              </Link>
                {index < comments.length - 1 && <Divider variant="inset" component="li" />}
              </Box>
            )) : (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No hay comentarios en tus proyectos aún.
                </Typography>
                <Button component={Link} href="/client/projects" variant="outlined" sx={{ mt: 2 }}>
                  Ir a mis proyectos
                </Button>
              </Box>
            )}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

