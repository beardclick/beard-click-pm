import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting } from "@/app/actions/meetings";
import { getProjects } from "@/app/actions/projects";
import { MeetingForm } from "@/components/meetings/MeetingForm";

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
        <Link href="/admin/meetings">
          <IconButton sx={{ color: "text.secondary" }}>
            <ChevronLeft size={22} />
          </IconButton>
        </Link>
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
