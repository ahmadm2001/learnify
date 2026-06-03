// src/components/AdminLayout.jsx

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";


const navItems = [
  { label: "Dashboard", icon: DashboardIcon, to: "/admin-dashboard" },
  { label: "Users", icon: PeopleAltOutlinedIcon, to: "/admin/users" },
  {
    label: "Teacher Applications",
    icon: AssignmentIndOutlinedIcon,
    to: "/admin/teacher-apps",
  },
  { label: "Courses", icon: OndemandVideoIcon, to: "/admin/courses" },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [hovered, setHovered] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const SIDEBAR_WIDTH = collapsed ? 80 : 240;

  const handleNavClick = (item) => {
    if (item.to) navigate(item.to);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#f6f8fc",
      }}
    >
      {/* ================= SIDEBAR ================= */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          transition: "width 0.3s ease",
          px: collapsed ? 1 : 2,
          py: 2,
          position: "fixed",
          top: "64px",
          left: 0,
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          bgcolor: "#684EC4",
          color: "#fff",
        }}
      >
        {/* TOP */}
        <Box>
          {/* LOGO + TOGGLE */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              mb: 3,
            }}
          >
            {!collapsed && (
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                }}
              >
                Learnify
              </Typography>
            )}

            <IconButton
              onClick={() => setCollapsed(!collapsed)}
              sx={{ color: "#fff" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* NAV */}
          <Box>
            {navItems.map((item) => {
              const isActive =
                item.to === "/admin-dashboard"
                  ? location.pathname === "/admin-dashboard"
                  : location.pathname.startsWith(item.to);

              const Icon = item.icon;

              return (
                <Tooltip
                  key={item.label}
                  title={collapsed ? item.label : ""}
                  placement="right"
                >
                  <Box
                    onClick={() => handleNavClick(item)}
                    onMouseEnter={() => setHovered(item.label)}
                    onMouseLeave={() => setHovered(null)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: collapsed ? "center" : "flex-start",
                      gap: collapsed ? 0 : 2,
                      px: 2,
                      py: 1.3,
                      borderRadius: "10px",
                      cursor: "pointer",
                      mb: 0.5,
                      transition: "all 0.2s",
                      bgcolor: isActive
                        ? "rgba(255,255,255,0.12)"
                        : hovered === item.label
                          ? "rgba(255,255,255,0.06)"
                          : "transparent",
                    }}
                  >
                    {!collapsed && (
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: isActive ? "#fff" : "transparent",
                        }}
                      />
                    )}

                    <Icon sx={{ fontSize: 20 }} />

                    {!collapsed && (
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: isActive ? 600 : 400,
                          opacity: isActive ? 1 : 0.85,
                        }}
                      >
                        {item.label}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>

        {/* USER */}
        {!collapsed && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              borderRadius: "12px",
              bgcolor: "rgba(255,255,255,0.06)",
            }}
          >
            <Avatar sx={{ width: 36, height: 36 }}>A</Avatar>

            <Box>
              <Typography fontSize={13} fontWeight={600}>
                Admin
              </Typography>
              <Typography fontSize={11} opacity={0.7}>
                Administrator
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ================= MAIN ================= */}
      <Box
        component="main"
        sx={{
          flex: 1,
          marginLeft: `${SIDEBAR_WIDTH}px`,
          transition: "margin-left 0.3s ease",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 4,
            overflowY: "auto",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}