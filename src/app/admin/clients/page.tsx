import Link from "next/link";
import { Plus } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { getClients } from "@/app/actions/clients";
import { ClientsList } from "@/components/clients/ClientsList";

export default async function AdminClientsPage() {
  const clients = await getClients();

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" sx={{fontWeight: 700}}>Clientes</Typography>
        <Link href="/admin/clients/new" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<Plus size={18} />}>
            Nuevo Cliente
          </Button>
        </Link>
      </Box>

      <ClientsList initialClients={clients} />
    </Box>
  );
}

