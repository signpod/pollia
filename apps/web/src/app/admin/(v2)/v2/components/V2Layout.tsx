"use client";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SidebarProvider, V2Sidebar } from "./V2Sidebar";
import { adminTheme } from "./ui/theme";

interface V2LayoutProps {
  children: React.ReactNode;
}

export function V2Layout({ children }: V2LayoutProps) {
  return (
    <ThemeProvider theme={adminTheme}>
      <CssBaseline />
      <SidebarProvider>
        <Box sx={{ display: "flex", height: "100vh" }}>
          <V2Sidebar />
          <Box
            component="main"
            sx={{
              flex: 1,
              overflow: "auto",
              p: 3.5,
              backgroundColor: "grey.50",
            }}
          >
            {children}
          </Box>
        </Box>
      </SidebarProvider>
    </ThemeProvider>
  );
}
