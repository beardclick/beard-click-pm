import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getGlobalComments } from "@/app/actions/comments";
import { GlobalCommentsList } from "@/components/comments/GlobalCommentsList";

export default async function AdminCommentsPage() {
  const comments = await getGlobalComments();

  return (
    <Box>
      <Typography variant="h5" sx={{fontWeight: 700}} gutterBottom>
        Feed Global de Comentarios
      </Typography>

      <Box sx={{ mt: 3 }}>
        <GlobalCommentsList initialComments={comments} />
      </Box>
    </Box>
  );
}

