import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Plus } from "lucide-react";
import { getMeetings } from "@/app/actions/meetings";
import { AutoRead } from "@/components/layout/AutoRead";
import { MeetingsList } from "@/components/meetings/MeetingsList";
import AppLink from "@/components/ui/AppLink";

export default async function MeetingsPage() {
  const meetingsData = await getMeetings();
  // Nos aseguramos de que siempre sea un array
  const meetings = meetingsData || [];

  return (
    <Box>
      <AutoRead type="meetings" />
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{fontWeight: 700}}>
          Reuniones Programadas
        </Typography>
        <Button
          component={AppLink}
          href="/admin/meetings/new"
          variant="contained"
          startIcon={<Plus size={18} />}
        >
          Agendar Reunión
        </Button>
      </Box>

      <MeetingsList initialMeetings={meetings} />
    </Box>
  );
}
