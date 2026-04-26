import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import { getClients } from "@/app/actions/clients";
import { ClientDeleteButton } from "@/components/clients/ClientDeleteButton";

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

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Empresa / Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Proyectos</TableCell>
              <TableCell>Creación</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No hay clientes registrados aún.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client: any) => (
                <TableRow key={client.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{fontWeight: 500}}>{client.name}</Typography>
                    {client.company && (
                      <Typography variant="caption" color="text.secondary">{client.company}</Typography>
                    )}
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || "—"}</TableCell>
                  <TableCell>
                    <Chip label={client.projectsCount} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{new Date(client.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                      <Link href={`/admin/clients/${client.id}/edit`} style={{ textDecoration: 'none' }}>
                        <Button size="small" variant="text" startIcon={<Edit size={16} />}>
                          Editar
                        </Button>
                      </Link>
                      <ClientDeleteButton clientId={client.id} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

