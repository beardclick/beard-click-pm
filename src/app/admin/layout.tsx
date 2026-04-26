import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Header } from "@/components/layout/Header";
import Box from "@mui/material/Box";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
      <AdminSidebar />
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <Header />
        <Box component="main" sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 3, lg: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

