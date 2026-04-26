import { ClientForm } from "@/components/clients/ClientForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

export default function NewClientPage() {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Link href="/admin/clients">
          <IconButton sx={{ color: "text.secondary" }}>
            <ChevronLeft size={22} />
          </IconButton>
        </Link>
        <Box>
          <Typography variant="h5" sx={{fontWeight: 700}}>Añadir Nuevo Cliente</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Ingresa los datos para registrar una nueva empresa o cliente en el sistema.
          </Typography>
        </Box>
      </Box>

      <ClientForm />
    </Box>
  );
}

