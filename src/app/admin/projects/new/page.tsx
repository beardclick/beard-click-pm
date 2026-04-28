import { getClients } from "@/app/actions/clients";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";

export default async function NewProjectPage() {
  const clients = await getClients();
  const clientsForSelect = clients.map(c => ({ id: c.id, name: c.name, company: c.company }));

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Link href="/admin/projects">
          <IconButton sx={{ color: "text.secondary" }}>
            <ChevronLeft size={22} />
          </IconButton>
        </Link>
        <Box>
          <Typography variant="h5" sx={{fontWeight: 700}}>Crear Nuevo Proyecto</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Ingresa los detalles para abrir un nuevo proyecto en el sistema.
          </Typography>
        </Box>
      </Box>

      <ProjectForm clients={clientsForSelect} />
    </Box>
  );
}

