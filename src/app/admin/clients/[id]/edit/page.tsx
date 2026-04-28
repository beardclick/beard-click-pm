import { getClient } from "@/app/actions/clients";
import { ClientForm } from "@/components/clients/ClientForm";
import AppLink from "@/components/ui/AppLink";
import { ChevronLeft } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const client = await getClient(resolvedParams.id);

  if (!client) {
    notFound();
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton component={AppLink} href="/admin/clients" sx={{ color: "text.secondary" }}>
          <ChevronLeft size={22} />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Editar Cliente</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Modifica la información registrada de la empresa o cliente.
          </Typography>
        </Box>
      </Box>

      <ClientForm initialData={client} />
    </Box>
  );
}
