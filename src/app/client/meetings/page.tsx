import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getClientMeetings } from "@/app/actions/meetings";
import { getCurrentClientRecord } from "@/lib/client-access";
import { MeetingsList } from "@/components/meetings/MeetingsList";

export default async function ClientMeetingsPage() {
  const client = await getCurrentClientRecord();
  
  if (!client) return null;

  const meetings = await getClientMeetings(client.id);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 , fontWeight: 700}} >
        Mis Reuniones
      </Typography>

      <MeetingsList initialMeetings={meetings} isAdmin={false} />
    </Box>
  );
}

