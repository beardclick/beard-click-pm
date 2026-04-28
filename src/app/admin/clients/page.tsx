import { Plus } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { getClients } from "@/app/actions/clients";
import { ClientsList } from "@/components/clients/ClientsList";
import AppLink from "@/components/ui/AppLink";

export default async function AdminClientsPage() {
  const clients = await getClients();

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" sx={{fontWeight: 700}}>Clientes</Typography>
        <Button component={AppLink} href="/admin/clients/new" variant="contained" startIcon={<Plus size={18} />}>
          Nuevo Cliente
        </Button>
      </Box>

      <ClientsList initialClients={clients} />
    </Box>
  );
}

