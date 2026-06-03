// src/components/NavBar.jsx
import { useContext, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Fade,
  useScrollTrigger,
  alpha,
  Badge,
  Stack,
  Paper,
  Chip,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import SchoolIcon from "@mui/icons-material/School";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DynamicFeedOutlinedIcon from "@mui/icons-material/DynamicFeedOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocalLibraryOutlinedIcon from "@mui/icons-material/LocalLibraryOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";

import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";

export default function NavBar() {
  const { user, setUser } = useContext(AuthContext);
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 8 });

  const isAdmin = !!user?.is_staff;
  const openUserMenu = Boolean(anchorEl);

  const navItems = [
    { label: "Home", to: "/", icon: <HomeRoundedIcon fontSize="small" /> },
    { label: "About Us", to: "/about", icon: <InfoOutlinedIcon fontSize="small" /> },
    { label: "Courses", to: "/courses", icon: <LocalLibraryOutlinedIcon fontSize="small" /> },
    { label: "Contact Us", to: "/contact", icon: <CallOutlinedIcon fontSize="small" /> },
  ];

  const appBarSx = useMemo(
    () => ({
      top: 0,
      borderBottom: "1px solid",
      borderColor: scrolled ? "rgba(226,232,240,0.9)" : "rgba(226,232,240,0.55)",
      boxShadow: scrolled
        ? "0 10px 30px rgba(15,23,42,0.08)"
        : "0 8px 24px rgba(15,23,42,0.04)",
      backgroundColor: (theme) =>
        scrolled
          ? alpha(theme.palette.background.paper, 0.92)
          : alpha(theme.palette.background.paper, 0.78),
      backdropFilter: "blur(16px)",
      transition:
        "background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
    }),
    [scrolled]
  );

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setUser(null);
    navigate("/login");
  };

  const handleOpenUserMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);

  let adminDesktopItem = null;
  let adminMobileLabel = "";
  let adminMobileTo = "";

  if (isAdmin) {
    adminDesktopItem = [
      <MenuItem
        key="admin-dashboard"
        onClick={() => {
          handleCloseUserMenu();
          navigate("/admin-dashboard");
        }}
        sx={menuItemSx}
      >
        <ListItemIcon sx={{ minWidth: 34 }}>
          <AdminPanelSettingsIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Admin Dashboard"
          secondary="Manage the platform"
          primaryTypographyProps={{ fontWeight: 700 }}
          secondaryTypographyProps={{ fontSize: 12.5 }}
        />
      </MenuItem>,
      <Divider key="admin-divider" sx={{ my: 0.5 }} />,
    ];

    adminMobileLabel = "Admin Dashboard";
    adminMobileTo = "/admin-dashboard";
  }

  let teacherDesktopItem = null;
  let teacherMobileLabel = "";
  let teacherMobileTo = "";

  if (user && !user.is_staff) {
    if (user.role === "STUDENT") {
      teacherDesktopItem = [
        <MenuItem
          key="apply-teacher"
          onClick={() => {
            handleCloseUserMenu();
            navigate("/teacher/register");
          }}
          sx={menuItemSx}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <SchoolIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Be a Teacher"
            secondary="Apply to teach"
            primaryTypographyProps={{ fontWeight: 700 }}
            secondaryTypographyProps={{ fontSize: 12.5 }}
          />
        </MenuItem>,
        <Divider key="teacher-divider" sx={{ my: 0.5 }} />,
      ];
      teacherMobileLabel = "Be a Teacher";
      teacherMobileTo = "/teacher/register";
    } else if (user.role === "TEACHER_PENDING") {
      teacherDesktopItem = [
        <MenuItem
          key="teacher-status"
          onClick={() => {
            handleCloseUserMenu();
            navigate("/teacher/status");
          }}
          sx={menuItemSx}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <HourglassTopIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Application Status"
            secondary="Waiting approval"
            primaryTypographyProps={{ fontWeight: 700 }}
            secondaryTypographyProps={{ fontSize: 12.5 }}
          />
        </MenuItem>,
        <Divider key="teacher-divider2" sx={{ my: 0.5 }} />,
      ];
      teacherMobileLabel = "Application Status";
      teacherMobileTo = "/teacher/status";
    } else if (user.role === "TEACHER_APPROVED") {
      teacherDesktopItem = [
        <MenuItem
          key="teacher-dashboard"
          onClick={() => {
            handleCloseUserMenu();
            navigate("/instructor");
          }}
          sx={menuItemSx}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>
            <DashboardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Teacher Dashboard"
            secondary="Manage courses"
            primaryTypographyProps={{ fontWeight: 700 }}
            secondaryTypographyProps={{ fontSize: 12.5 }}
          />
        </MenuItem>,
        <Divider key="teacher-divider3" sx={{ my: 0.5 }} />,
      ];
      teacherMobileLabel = "Teacher Dashboard";
      teacherMobileTo = "/instructor";
    }
  }

  let studentDesktopItem = null;

  if (user && user.role === "STUDENT") {
    studentDesktopItem = [
      <MenuItem
        key="student-dashboard"
        onClick={() => {
          handleCloseUserMenu();
          navigate("/student/dashboard");
        }}
        sx={menuItemSx}
      >
        <ListItemIcon sx={{ minWidth: 34 }}>
          <DashboardIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Student Dashboard"
          secondary="Your enrolled courses"
          primaryTypographyProps={{ fontWeight: 700 }}
          secondaryTypographyProps={{ fontSize: 12.5 }}
        />
      </MenuItem>,
      <Divider key="student-divider" sx={{ my: 0.5 }} />,
    ];
  }

  const profileItems = [
    {
      label: "Community Feed",
      to: "/account",
      icon: <DynamicFeedOutlinedIcon fontSize="small" />,
    },
    {
      label: "Edit Profile",
      to: "/profile/edit",
      icon: <EditOutlinedIcon fontSize="small" />,
    },
  ];

  const ProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={openUserMenu}
      onClose={handleCloseUserMenu}
      TransitionComponent={Fade}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{
        elevation: 0,
        sx: {
          mt: 1.2,
          width: 330,
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid #eef2f7",
          boxShadow: "0 22px 60px rgba(15,23,42,0.14)",
          background: "#ffffff",
        },
      }}
    >
      <Box
        sx={{
          px: 2.2,
          py: 2,
          background:
            "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(99,102,241,0.04) 100%)",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: "primary.main",
              fontWeight: 800,
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
              {user?.full_name || user?.username}
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Stack>

        <Chip
          label={isAdmin ? "ADMIN" : user?.role || "USER"}
          size="small"
          sx={{
            mt: 1.6,
            borderRadius: 999,
            fontWeight: 800,
            bgcolor: "#ffffff",
            color: "primary.main",
            border: "1px solid rgba(124,58,237,0.18)",
          }}
        />
      </Box>

      <Divider />

      {studentDesktopItem}
      {adminDesktopItem}
      {teacherDesktopItem}

      {profileItems.map((item) => (
        <MenuItem
          key={item.label}
          onClick={() => {
            handleCloseUserMenu();
            navigate(item.to);
          }}
          sx={menuItemSx}
        >
          <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ fontWeight: 600 }}
          />
        </MenuItem>
      ))}

      <Divider sx={{ my: 0.5 }} />

      <MenuItem
        onClick={() => {
          handleCloseUserMenu();
          logout();
        }}
        sx={{
          ...menuItemSx,
          color: "#dc2626",
        }}
      >
        <ListItemIcon sx={{ minWidth: 34, color: "#dc2626" }}>
          <LogoutRoundedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary="Log out"
          primaryTypographyProps={{ fontWeight: 700 }}
        />
      </MenuItem>
    </Menu>
  );

  const desktopLinks = (
    <>
      <IconButton
        component={RouterLink}
        to="/cart"
        sx={iconButtonSx(location.pathname === "/cart")}
      >
        <Badge
          badgeContent={cartCount}
          color="secondary"
          overlap="circular"
          invisible={cartCount === 0}
        >
          <ShoppingCartOutlinedIcon sx={{ fontSize: 24 }} />
        </Badge>
      </IconButton>

      {user ? (
        <>
          <Button
            onClick={handleOpenUserMenu}
            sx={{
              minWidth: 0,
              p: 0.5,
              borderRadius: 999,
              textTransform: "none",
              color: "text.primary",
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "primary.main",
                  fontWeight: 800,
                }}
              >
                {user.username?.[0]?.toUpperCase()}
              </Avatar>
            </Stack>
          </Button>
          {ProfileMenu}
        </>
      ) : (
        <Stack direction="row" spacing={1.2}>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/login"
            startIcon={<LoginRoundedIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2.1,
              fontWeight: 700,
              borderColor: "rgba(124,58,237,0.18)",
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            component={RouterLink}
            to="/register"
            startIcon={<PersonAddAlt1RoundedIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2.2,
              fontWeight: 700,
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              boxShadow: "0 10px 30px rgba(99,102,241,0.22)",
            }}
          >
            Register
          </Button>
        </Stack>
      )}
    </>
  );

  return (
    <AppBar position="sticky" sx={appBarSx}>
      <Container maxWidth="xl">
        <Toolbar
          sx={{
            minHeight: 76,
            display: "grid",
            gridTemplateColumns: { xs: "1fr auto", md: "auto 1fr auto" },
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* LEFT LOGO */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              textDecoration: "none",
              minWidth: "fit-content",
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.16) 100%)",
                color: "primary.main",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
              }}
            >
              <SchoolIcon sx={{ fontSize: 24 }} />
            </Box>

            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "primary.main",
                  lineHeight: 1,
                }}
              >
                Learnify
              </Typography>
            </Box>
          </Box>

          {/* CENTER NAV */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { md: 0.5, lg: 0.8 },
                px: 1,
                py: 0.7,
                borderRadius: "999px",
                background: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(226,232,240,0.9)",
                boxShadow: "0 8px 26px rgba(15,23,42,0.04)",
                backdropFilter: "blur(10px)",
              }}
            >
              {navItems.map((item) => (
                <NavPill
                  key={item.label}
                  label={item.label}
                  to={item.to}
                  icon={item.icon}
                  active={
                    item.to === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.to)
                  }
                />
              ))}
            </Paper>
          </Box>

          {/* RIGHT DESKTOP */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 1,
            }}
          >
            {desktopLinks}
          </Box>

          {/* MOBILE BUTTON */}
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              color: "#334155",
              justifySelf: "end",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      {/* MOBILE DRAWER */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 320,
            p: 2,
            background: "#ffffff",
          },
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 0.5, pt: 0.5 }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "14px",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.16) 100%)",
                  color: "primary.main",
                }}
              >
                <SchoolIcon />
              </Box>
              <Typography sx={{ fontSize: 20, fontWeight: 900, color: "primary.main" }}>
                Learnify
              </Typography>
            </Stack>

            <IconButton
              onClick={() => setOpen(false)}
              sx={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
            >
              <ChevronRightRoundedIcon />
            </IconButton>
          </Stack>

          {user && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: "18px",
                border: "1px solid #eef2f7",
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(99,102,241,0.03) 100%)",
              }}
            >
              <Stack direction="row" spacing={1.4} alignItems="center">
                <Avatar sx={{ bgcolor: "primary.main", width: 46, height: 46 }}>
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800 }}>
                    {user?.full_name || user?.username}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: "text.secondary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}

          <List sx={{ p: 0 }}>
            {navItems.map((item) => (
              <MobileNavItem
                key={item.label}
                label={item.label}
                to={item.to}
                onClose={() => setOpen(false)}
              />
            ))}

            <MobileNavItem
              label={`Cart (${cartCount})`}
              to="/cart"
              onClose={() => setOpen(false)}
            />

            {user && user.role === "STUDENT" && (
              <MobileNavItem
                label="Student Dashboard"
                to="/student/dashboard"
                onClose={() => setOpen(false)}
              />
            )}

            {user && isAdmin && (
              <MobileNavItem
                label={adminMobileLabel}
                to={adminMobileTo}
                onClose={() => setOpen(false)}
              />
            )}

            {user && !user.is_staff && teacherMobileLabel && (
              <MobileNavItem
                label={teacherMobileLabel}
                to={teacherMobileTo}
                onClose={() => setOpen(false)}
              />
            )}

            {user && (
              <>
                <MobileNavItem
                  label="Community Feed"
                  to="/account"
                  onClose={() => setOpen(false)}
                />
                <MobileNavItem
                  label="Edit Profile"
                  to="/profile/edit"
                  onClose={() => setOpen(false)}
                />
              </>
            )}

            {!user && (
              <>
                <MobileNavItem
                  label="Login"
                  to="/login"
                  onClose={() => setOpen(false)}
                />
                <MobileNavItem
                  label="Register"
                  to="/register"
                  onClose={() => setOpen(false)}
                />
              </>
            )}

            {user && (
              <ListItemButton
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                sx={{
                  borderRadius: "14px",
                  mb: 0.7,
                  color: "#dc2626",
                  "&:hover": {
                    bgcolor: "rgba(220,38,38,0.06)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 34, color: "#dc2626" }}>
                  <LogoutRoundedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ fontWeight: 700 }}
                />
              </ListItemButton>
            )}
          </List>
        </Stack>
      </Drawer>
    </AppBar>
  );
}

/* ================= HELPERS ================= */

const menuItemSx = {
  py: 1.35,
  px: 2.2,
  mx: 1,
  my: 0.2,
  borderRadius: "14px",
  "&:hover": {
    bgcolor: "rgba(124,58,237,0.06)",
  },
};

function NavPill({ label, to, active, icon }) {
  return (
    <Button
      component={RouterLink}
      to={to}
      startIcon={icon}
      sx={{
        textTransform: "none",
        minWidth: "unset",

        // 🔥 RESPONSIVE SIZING
        px: { xs: 1.6, md: 1.4, lg: 2.1 },
        py: { xs: 0.6, md: 0.55, lg: 1 },

        borderRadius: active ? "18px" : "14px",

        fontWeight: 700,
        fontSize: { xs: 13.2, md: 13, lg: 14.5 },

        letterSpacing: "-0.01em",

        color: active ? "#5b4ad6" : "#334155",

        background: active
          ? "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(99,102,241,0.10) 100%)"
          : "transparent",

        border: active
          ? "1px solid rgba(124,58,237,0.14)"
          : "1px solid transparent",

        transition: "all 0.22s ease",

        "&:hover": {
          background: active
            ? "linear-gradient(135deg, rgba(124,58,237,0.14) 0%, rgba(99,102,241,0.14) 100%)"
            : "rgba(15,23,42,0.05)",
          color: active ? "#5b4ad6" : "#0f172a",
        },

        "& .MuiButton-startIcon": {
          mr: { xs: 0.5, md: 0.4, lg: 0.8 },
          "& svg": {
            fontSize: { xs: 16, md: 15, lg: 18 },
          },
        },
      }}
    >
      {label}
    </Button>
  );
}

function MobileNavItem({ label, to, onClose }) {
  return (
    <ListItemButton
      component={RouterLink}
      to={to}
      onClick={onClose}
      sx={{
        borderRadius: "14px",
        mb: 0.7,
        "&:hover": {
          bgcolor: "rgba(124,58,237,0.06)",
        },
      }}
    >
      <ListItemText
        primary={label}
        primaryTypographyProps={{ fontWeight: 600 }}
      />
    </ListItemButton>
  );
}

function iconButtonSx(active = false) {
  return {
    width: 42,
    height: 42,
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    color: active ? "#6d28d9" : "#334155",
    bgcolor: active ? "rgba(124,58,237,0.06)" : "#ffffff",
    "&:hover": {
      bgcolor: "rgba(124,58,237,0.08)",
    },
  };
}