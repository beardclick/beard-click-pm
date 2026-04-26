import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import { getProjects } from "@/app/actions/projects";

export default async function NewMeetingPage() {
  const projects = await getProjects();

  return (
    <Box sx={{ maxWidth: 600, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Agendar Nueva Reunión
      </Typography>
      
      <MeetingForm projects={projects} />
    </Box>
  );
}
