import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getMeeting } from "@/app/actions/meetings";
import { getProjects } from "@/app/actions/projects";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import AppLink from "@/components/ui/AppLink";

export default async function EditMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const [meeting, projects] = await Promise.all([
    getMeeting(resolvedParams.id),
    getProjects(),
  ]);

  if (!meeting) {
    notFound();
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton component={AppLink} href="/admin/meetings" sx={{ color: "text.secondary" }}>
          <ChevronLeft size={22} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Editar Reunión
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Actualiza el horario, proyecto o enlace de la reunión.
          </Typography>
        </Box>
      </Box>

      <MeetingForm projects={projects} initialData={meeting} />
    </Box>
  );
}
