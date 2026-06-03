// src/pages/admin/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../lib/api";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Grid from "@mui/material/Grid";

import {
  alpha,
  useTheme,
} from "@mui/material/styles";

import { motion } from "framer-motion";
import AdminLayout from "../../components/AdminLayout";

import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import DraftsRoundedIcon from "@mui/icons-material/DraftsRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";

const MotionPaper = motion(Paper);

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getStatusMeta(status) {
  switch (status) {
    case "APPROVED":
      return {
        color: "#16a34a",
        bg: "rgba(34,197,94,0.10)",
        border: "rgba(34,197,94,0.18)",
        icon: <CheckCircleRoundedIcon sx={{ fontSize: 15 }} />,
      };
    case "REJECTED":
      return {
        color: "#dc2626",
        bg: "rgba(239,68,68,0.10)",
        border: "rgba(239,68,68,0.18)",
        icon: <CancelRoundedIcon sx={{ fontSize: 15 }} />,
      };
    default:
      return {
        color: "#d97706",
        bg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.22)",
        icon: <HourglassTopRoundedIcon sx={{ fontSize: 15 }} />,
      };
  }
}

function getInitials(name = "", fallback = "U") {
  if (!name.trim()) return fallback;
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || fallback;
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}

async function fetchFirstWorkingEndpoint(endpoints) {
  for (const endpoint of endpoints) {
    try {
      const res = await API.get(endpoint);
      return res.data;
    } catch (err) {
      // continue trying next endpoint
    }
  }
  return [];
}

function StatsCard({
  title,
  value,
  helper,
  icon,
  accent = "#6d61d2",
  softBg = "rgba(109,97,210,0.10)",
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.25,
        height: "100%",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.75)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.74) 100%)",
        backdropFilter: "blur(18px)",
        boxShadow:
          "0 16px 40px rgba(15,23,42,0.05), 0 8px 20px rgba(109,97,210,0.04)",
        transition: "all 0.28s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            "0 22px 48px rgba(15,23,42,0.08), 0 8px 26px rgba(109,97,210,0.08)",
        },
      }}
    >
      <Stack direction="row" spacing={1.6} alignItems="center">
        <Avatar
          sx={{
            width: 54,
            height: 54,
            borderRadius: "18px",
            bgcolor: softBg,
            color: accent,
            boxShadow: `0 12px 24px ${alpha(accent, 0.14)}`,
          }}
        >
          {icon}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              color: "#64748b",
              fontWeight: 700,
              mb: 0.35,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: 24, md: 28 },
              fontWeight: 950,
              color: "#0f172a",
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: 12.5,
              color: "#94a3b8",
              mt: 0.35,
              lineHeight: 1.55,
            }}
          >
            {helper}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function SmallInsightCard({
  title,
  value,
  helper,
  icon,
  accent = "#6d61d2",
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.1,
        height: "100%",
        borderRadius: "22px",
        border: "1px solid rgba(255,255,255,0.72)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(248,250,252,0.92))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.25 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            borderRadius: "14px",
            bgcolor: alpha(accent, 0.10),
            color: accent,
          }}
        >
          {icon}
        </Avatar>

        <Typography
          sx={{
            fontWeight: 800,
            color: "#0f172a",
            fontSize: 14,
          }}
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontSize: 26,
          lineHeight: 1.05,
          fontWeight: 900,
          color: "#0f172a",
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </Typography>

      <Typography
        sx={{
          fontSize: 12.5,
          color: "#64748b",
          mt: 0.6,
          lineHeight: 1.6,
        }}
      >
        {helper}
      </Typography>
    </Paper>
  );
}

function AppRow({ row, navigate }) {
  const statusUi = getStatusMeta(row.status);
  const fullName = `${row.first_name || ""} ${row.last_name || ""}`.trim();
  const initials = getInitials(fullName || row.username || "U");

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.6,
        borderRadius: "20px",
        border: "1px solid rgba(226,232,240,0.75)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.96))",
        boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Stack direction="row" spacing={1.3} alignItems="center">
          <Avatar
            sx={{
              width: 46,
              height: 46,
              borderRadius: "15px",
              background: "linear-gradient(135deg, #6d61d2 0%, #5146c4 100%)",
              fontWeight: 900,
              boxShadow: "0 10px 20px rgba(109,97,210,0.18)",
            }}
          >
            {initials}
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                fontSize: 14.5,
              }}
            >
              {fullName || row.username}
            </Typography>

            <Typography
              sx={{
                fontSize: 12.5,
                color: "#64748b",
              }}
            >
              @{row.username}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Chip
            icon={statusUi.icon}
            label={row.status}
            sx={{
              borderRadius: "999px",
              fontWeight: 800,
              color: statusUi.color,
              bgcolor: statusUi.bg,
              border: `1px solid ${statusUi.border}`,
            }}
          />

          <Button
            size="small"
            onClick={() => navigate("/admin/teacher-apps")}
            endIcon={<ArrowOutwardRoundedIcon />}
            sx={{
              textTransform: "none",
              borderRadius: "999px",
              fontWeight: 800,
              color: "#5b21b6",
            }}
          >
            Open queue
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default function AdminDashboard() {
  const [me, setMe] = useState(null);
  const [apps, setApps] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const theme = useTheme();

  const loadDashboard = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const meRes = await API.get("/api/auth/me/");
      setMe(meRes.data);

      if (!meRes.data?.is_staff) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const [appsRes, coursesRes, dashboardRes] = await Promise.all([
        API.get("/api/teacher/applications/").catch(() => ({ data: [] })),
        API.get("/api/courses/").catch(() => ({ data: [] })),
        API.get("/api/admin/dashboard/").catch(() => ({ data: {} })),
      ]);

      setApps(safeArray(appsRes.data));
      setCourses(safeArray(coursesRes.data));

      setApps(safeArray(appsRes.data));
      setCourses(safeArray(coursesRes.data));

      // ✅ correct way
      setUsers([{ count: dashboardRes.data?.total_users || 0 }]);
    } catch (err) {
      setError("Failed to load admin dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboard = useMemo(() => {
    const appList = safeArray(apps);
    const courseList = safeArray(courses);
    const userList = safeArray(users);

    const approvedApps = appList.filter((a) => a.status === "APPROVED");
    const pendingApps = appList.filter((a) => a.status === "PENDING");
    const rejectedApps = appList.filter((a) => a.status === "REJECTED");

    const publishedCourses = courseList.filter(
      (c) =>
        c?.is_published === true ||
        c?.published === true ||
        c?.status === "PUBLISHED"
    );

    const draftCourses = courseList.length - publishedCourses.length;
    const freeCourses = courseList.filter((c) => Number(c?.price || 0) === 0);
    const paidCourses = courseList.length - freeCourses.length;

    const liveCourses = courseList.filter((c) =>
      String(c?.course_type || "").toUpperCase().includes("LIVE")
    ).length;

    const fullCourses = courseList.filter((c) => {
      const type = String(c?.course_type || "").toUpperCase();
      return type === "COURSE" || type === "FULL_COURSE";
    }).length;

    const totalRevenue = courseList.reduce(
      (sum, c) => sum + Number(c?.price || 0),
      0
    );

    const completionScoreParts = [
      userList.length > 0 ? 20 : 0,
      courseList.length > 0 ? 25 : 0,
      publishedCourses.length > 0 ? 20 : 0,
      appList.length > 0 ? 15 : 0,
      courseList.some((c) => c?.thumbnail) ? 10 : 0,
      courseList.some((c) => c?.description) ? 10 : 0,
    ];

    const platformCompletion = Math.min(
      completionScoreParts.reduce((a, b) => a + b, 0),
      100
    );

    const coursePublishingRate = courseList.length
      ? Math.round((publishedCourses.length / courseList.length) * 100)
      : 0;

    const applicationResolutionRate = appList.length
      ? Math.round(
        ((approvedApps.length + rejectedApps.length) / appList.length) * 100
      )
      : 0;

    const monetizationRate = courseList.length
      ? Math.round((paidCourses / courseList.length) * 100)
      : 0;

    return {
      totalUsers: users[0]?.count || 0,
      totalCourses: courseList.length,
      approvedTeachers: approvedApps.length,
      pendingApps: pendingApps.length,
      rejectedApps: rejectedApps.length,
      totalRevenue,
      publishedCourses: publishedCourses.length,
      draftCourses,
      freeCourses: freeCourses.length,
      paidCourses,
      liveCourses,
      fullCourses,
      applicationResolutionRate,
      coursePublishingRate,
      monetizationRate,
      platformCompletion,
      recentApps: [...appList].slice(0, 4),
    };
  }, [apps, courses, users]);

  if (error) {
    return (
      <AdminLayout>
        <Container maxWidth="md" sx={{ mt: 6 }}>
          <Alert
            severity="error"
            sx={{
              borderRadius: "18px",
              fontWeight: 700,
            }}
          >
            {error}
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(circle at top left, rgba(109,97,210,0.08), transparent 24%), linear-gradient(180deg, #ffffff 0%, #faf7ff 40%, #f3ecff 100%)",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress sx={{ color: "#6d61d2" }} />
            <Typography color="text.secondary" fontWeight={600}>
              Loading admin dashboard...
            </Typography>
          </Stack>
        </Box>
      </AdminLayout>
    );
  }

  if (me && !me.is_staff) {
    return (
      <AdminLayout>
        <Container maxWidth="md" sx={{ mt: 6 }}>
          <Alert
            severity="warning"
            sx={{
              borderRadius: "18px",
              fontWeight: 700,
            }}
          >
            You are not an admin.
          </Alert>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 2.5, md: 4.5 },
          px: { xs: 1, md: 2 },
          background:
            "radial-gradient(circle at top left, rgba(109,97,210,0.10), transparent 18%), radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 20%), linear-gradient(180deg, #fbfbff 0%, #f8f5ff 42%, #f5f7fb 100%)",
        }}
      >
        <Container
          maxWidth="xl"
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          sx={{ px: { xs: 0.5, sm: 1.5, md: 2 } }}
        >
          <Stack spacing={3}>
            {/* HERO */}
            <MotionPaper
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.35, ease: "easeOut" }}
              elevation={0}
              sx={{
                p: { xs: 2.3, sm: 2.8, md: 3.4 },
                borderRadius: "34px",
                overflow: "hidden",
                position: "relative",
                border: "1px solid rgba(109,97,210,0.15)",
                background:
                  "linear-gradient(135deg, rgba(248,245,255,0.96) 0%, rgba(255,255,255,0.99) 42%, rgba(243,240,255,0.96) 100%)",
                boxShadow:
                  "0 24px 55px rgba(109,97,210,0.10), 0 8px 20px rgba(15,23,42,0.04)",
                backdropFilter: "blur(18px)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: -90,
                  right: -80,
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(109,97,210,0.18), transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: -100,
                  left: -70,
                  width: 230,
                  height: 230,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <Stack
                direction={{ xs: "column", lg: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", lg: "center" }}
                spacing={2.5}
                sx={{ position: "relative", zIndex: 1 }}
              >
                <Box sx={{ maxWidth: 780 }}>
                  <Chip
                    icon={<AdminPanelSettingsRoundedIcon />}
                    label="Admin Overview"
                    sx={{
                      mb: 1.5,
                      borderRadius: "999px",
                      bgcolor: "rgba(109,97,210,0.10)",
                      color: "#6d61d2",
                      fontWeight: 800,
                      border: "1px solid rgba(109,97,210,0.16)",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: { xs: "1.95rem", md: "2.8rem" },
                      lineHeight: 1.05,
                      fontWeight: 950,
                      letterSpacing: "-0.05em",
                      color: "#0f172a",
                      mb: 1.05,
                    }}
                  >
                    Admin Dashboard
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      maxWidth: 760,
                      lineHeight: 1.85,
                      fontSize: { xs: "0.96rem", md: "1rem" },
                    }}
                  >
                    Welcome, <strong>{me?.username}</strong>. Monitor real
                    platform activity, review teacher applications, inspect your
                    course catalog, and keep an eye on how Learnify is growing
                    from one premium admin workspace.
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 1.7 }}
                  >
                    <Chip
                      icon={<TaskAltRoundedIcon />}
                      label={`${dashboard.platformCompletion}% platform setup`}
                      sx={heroChipStyle}
                    />
                    <Chip
                      icon={<InsightsRoundedIcon />}
                      label="Live metrics enabled"
                      sx={heroChipStyle}
                    />
                  </Stack>
                </Box>

                <Stack
                  spacing={1.2}
                  sx={{
                    minWidth: { xs: "100%", lg: 320 },
                    width: { xs: "100%", lg: "auto" },
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: "24px",
                      bgcolor: "rgba(255,255,255,0.84)",
                      border: "1px solid rgba(15,23,42,0.06)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: "#64748b",
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: 0.3,
                          }}
                        >
                          Platform readiness
                        </Typography>

                        <Typography
                          sx={{
                            color: "#0f172a",
                            fontWeight: 900,
                            fontSize: 28,
                            lineHeight: 1.1,
                            mt: 0.4,
                          }}
                        >
                          {dashboard.platformCompletion}%
                        </Typography>
                      </Box>

                      <Avatar
                        sx={{
                          width: 46,
                          height: 46,
                          bgcolor: "rgba(109,97,210,0.12)",
                          color: "#6d61d2",
                        }}
                      >
                        <WorkspacePremiumRoundedIcon />
                      </Avatar>
                    </Stack>

                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 12.5,
                        mt: 0.8,
                        lineHeight: 1.65,
                      }}
                    >
                      Real dashboard values are being pulled from your available
                      backend endpoints.
                    </Typography>
                  </Paper>

                  <Button
                    variant="contained"
                    startIcon={
                      refreshing ? (
                        <CircularProgress size={16} sx={{ color: "#fff" }} />
                      ) : (
                        <RefreshRoundedIcon />
                      )
                    }
                    onClick={() => loadDashboard(true)}
                    disabled={refreshing}
                    sx={{
                      textTransform: "none",
                      borderRadius: "18px",
                      py: 1.2,
                      fontWeight: 800,
                      fontSize: 14,
                      color: "white",
                      background:
                        "linear-gradient(135deg, #6d61d2, #5146c4)",
                      boxShadow: "0 12px 28px rgba(109,97,210,0.24)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5f55c7, #4338ca)",
                      },
                    }}
                  >
                    Refresh dashboard
                  </Button>
                </Stack>
              </Stack>
            </MotionPaper>

            {/* TOP STATS */}
            <Box
              component={motion.div}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.38, ease: "easeOut", delay: 0.05 }}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: 2,
              }}
            >
              <StatsCard
                title="Total users"
                value={dashboard.totalUsers}
                helper="Users fetched from available user endpoints"
                icon={<PeopleAltRoundedIcon />}
                accent="#6d61d2"
                softBg="rgba(109,97,210,0.10)"
              />

              <StatsCard
                title="Approved teachers"
                value={dashboard.approvedTeachers}
                helper="Approved teacher applications"
                icon={<SchoolRoundedIcon />}
                accent="#16a34a"
                softBg="rgba(34,197,94,0.10)"
              />

              <StatsCard
                title="Pending applications"
                value={dashboard.pendingApps}
                helper="Waiting for admin review"
                icon={<PendingActionsRoundedIcon />}
                accent="#f59e0b"
                softBg="rgba(245,158,11,0.12)"
              />

              <StatsCard
                title="Catalog value"
                value={formatMoney(dashboard.totalRevenue)}
                helper="Sum of course prices in your catalog"
                icon={<MonetizationOnRoundedIcon />}
                accent="#0f9d58"
                softBg="rgba(34,197,94,0.10)"
              />
            </Box>

            {/* SECOND ROW */}
            <Grid container spacing={2.5} columns={{ xs: 12, lg: 15 }}>
              {/* LEFT - RECENT APPLICATIONS (SAME) */}
              <Grid item xs={12} lg={7}>
                <MotionPaper
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.42, delay: 0.16 }}
                  elevation={0}
                  sx={{
                    p: { xs: 2.1, md: 2.5 },
                    borderRadius: "28px",
                    border: "1px solid rgba(255,255,255,0.72)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.96))",
                    boxShadow: "0 18px 38px rgba(15,23,42,0.05)",
                    height: "100%",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1.2}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          color: "#0f172a",
                          fontSize: "1.08rem",
                          mb: 0.25,
                        }}
                      >
                        Recent teacher applications
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 13.5,
                          color: "#64748b",
                          lineHeight: 1.7,
                        }}
                      >
                        The latest requests currently visible from the teacher applications
                        endpoint.
                      </Typography>
                    </Box>

                    <Button
                      variant="text"
                      endIcon={<ArrowOutwardRoundedIcon />}
                      onClick={() => navigate("/admin/teacher-apps")}
                      sx={{
                        textTransform: "none",
                        borderRadius: "999px",
                        fontWeight: 800,
                        color: "#5b21b6",
                      }}
                    >
                      Open full queue
                    </Button>
                  </Stack>

                  {dashboard.recentApps.length === 0 ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: "22px",
                        textAlign: "center",
                        border: "1px dashed rgba(109,97,210,0.20)",
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,244,255,0.94))",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 62,
                          height: 62,
                          mx: "auto",
                          mb: 1.4,
                          borderRadius: "20px",
                          bgcolor: "rgba(109,97,210,0.10)",
                          color: "#6d61d2",
                        }}
                      >
                        <DescriptionRoundedIcon />
                      </Avatar>

                      <Typography
                        sx={{
                          fontWeight: 900,
                          color: "#0f172a",
                          mb: 0.7,
                        }}
                      >
                        No teacher applications yet
                      </Typography>

                      <Typography
                        sx={{
                          color: "#64748b",
                          maxWidth: 440,
                          mx: "auto",
                          lineHeight: 1.8,
                        }}
                      >
                        Once users submit instructor requests, they will appear here and
                        inside the applications review page.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={1.35}>
                      {dashboard.recentApps.map((row) => (
                        <AppRow key={row.id} row={row} navigate={navigate} />
                      ))}
                    </Stack>
                  )}
                </MotionPaper>
              </Grid>

              {/* CENTER - CHART ONLY */}
              <Grid item xs={12} lg={4}>
                <MotionPaper
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.42, delay: 0.12 }}
                  elevation={0}
                  sx={{
                    p: { xs: 2.1, md: 2.5 },
                    borderRadius: "28px",
                    border: "1px solid rgba(255,255,255,0.72)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,244,255,0.94))",
                    boxShadow: "0 18px 38px rgba(15,23,42,0.05)",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#0f172a",
                      fontSize: "1.08rem",
                      mb: 0.35,
                    }}
                  >
                    Applications analytics
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13.5,
                      color: "#64748b",
                      lineHeight: 1.7,
                      mb: 2,
                    }}
                  >
                    Distribution of teacher application statuses.
                  </Typography>

                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Approved", value: dashboard.approvedTeachers },
                            { name: "Pending", value: dashboard.pendingApps },
                            { name: "Rejected", value: dashboard.rejectedApps },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={88}
                          paddingAngle={2}
                          stroke="none"
                        >
                          <Cell fill="#22c55e" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Stack spacing={1.15} sx={{ mt: 1 }}>
                    <LegendItem
                      color="#22c55e"
                      label="Approved"
                      value={dashboard.approvedTeachers}
                    />
                    <LegendItem
                      color="#f59e0b"
                      label="Pending"
                      value={dashboard.pendingApps}
                    />
                    <LegendItem
                      color="#ef4444"
                      label="Rejected"
                      value={dashboard.rejectedApps}
                    />
                  </Stack>
                </MotionPaper>
              </Grid>

              {/* RIGHT - QUICK ACTIONS (SAME) */}
              <Grid item xs={12} lg={4}>
                <MotionPaper
                  variants={fadeUp}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.42, delay: 0.12 }}
                  elevation={0}
                  sx={{
                    p: { xs: 2.1, md: 2.5 },
                    borderRadius: "28px",
                    border: "1px solid rgba(255,255,255,0.72)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,244,255,0.94))",
                    boxShadow: "0 18px 38px rgba(15,23,42,0.05)",
                    height: "100%",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 900,
                      color: "#0f172a",
                      fontSize: "1.08rem",
                      mb: 0.35,
                    }}
                  >
                    Quick actions
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 13.5,
                      color: "#64748b",
                      lineHeight: 1.7,
                      mb: 2,
                    }}
                  >
                    Jump directly to the most important admin workflows.
                  </Typography>

                  <Stack spacing={1.2}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate("/admin/teacher-apps")}
                      sx={primaryActionBtn}
                    >
                      Review teacher applications
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate("/admin/users")}
                      sx={secondaryActionBtn}
                    >
                      View all users
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate("/admin/courses")}
                      sx={secondaryActionBtn}
                    >
                      Manage courses
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  <Stack spacing={1.2}>
                    <QuickActionMini
                      icon={<DescriptionRoundedIcon />}
                      title="Teacher applications"
                      value={apps.length}
                    />
                    <QuickActionMini
                      icon={<MenuBookRoundedIcon />}
                      title="Courses in catalog"
                      value={dashboard.totalCourses}
                    />
                    <QuickActionMini
                      icon={<Groups2RoundedIcon />}
                      title="Platform users"
                      value={dashboard.totalUsers}
                    />
                  </Stack>
                </MotionPaper>
              </Grid>
            </Grid>

            {/* THIRD ROW */}
            <Grid container spacing={2.2}>


              <Grid item xs={12} lg={5}>
                <Stack spacing={2.2} sx={{ height: "100%" }}>

                  <MotionPaper
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.42, delay: 0.22 }}
                    elevation={0}
                    sx={{
                      p: { xs: 2.1, md: 2.5 },
                      borderRadius: "28px",
                      border: "1px solid rgba(255,255,255,0.72)",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,244,255,0.94))",
                      boxShadow: "0 18px 38px rgba(15,23,42,0.05)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 900,
                        color: "#0f172a",
                        fontSize: "1.08rem",
                        mb: 0.6,
                      }}
                    >
                      Admin note
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 13.5,
                        color: "#64748b",
                        lineHeight: 1.8,
                        mb: 1.6,
                      }}
                    >
                      This dashboard now uses real values from the endpoints
                      available in your current project. If your backend later
                      exposes richer analytics endpoints, you can extend this
                      same UI without changing the design system.
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip label="Real applications" sx={noteChip} />
                      <Chip label="Real courses" sx={noteChip} />
                      <Chip label="Real user count when endpoint exists" sx={noteChip} />
                    </Stack>
                  </MotionPaper>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Container>
      </Box>
    </AdminLayout>
  );
}

function MetricProgressBlock({ title, value, helper, gradient }) {
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 0.7 }}
      >
        <Typography
          sx={{
            fontSize: 13.5,
            color: "#475569",
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 13.5,
            color: "#475569",
            fontWeight: 800,
          }}
        >
          {value}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 10,
          borderRadius: "999px",
          bgcolor: "rgba(148,163,184,0.16)",
          "& .MuiLinearProgress-bar": {
            borderRadius: "999px",
            background: gradient,
          },
        }}
      />

      <Typography
        sx={{
          fontSize: 12.3,
          color: "#64748b",
          mt: 0.7,
          lineHeight: 1.6,
        }}
      >
        {helper}
      </Typography>
    </Box>
  );
}

function QuickActionMini({ icon, title, value }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 1.15,
        borderRadius: "16px",
        border: "1px solid rgba(226,232,240,0.7)",
        background: "rgba(255,255,255,0.76)",
      }}
    >
      <Stack direction="row" spacing={1.1} alignItems="center">
        <Avatar
          sx={{
            width: 34,
            height: 34,
            borderRadius: "12px",
            bgcolor: "rgba(109,97,210,0.10)",
            color: "#6d61d2",
          }}
        >
          {icon}
        </Avatar>

        <Typography
          sx={{
            fontSize: 13.5,
            color: "#334155",
            fontWeight: 700,
          }}
        >
          {title}
        </Typography>
      </Stack>

      <Typography
        sx={{
          fontWeight: 900,
          color: "#0f172a",
          fontSize: 14,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function LegendItem({ color, label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: color,
          }}
        />
        <Typography sx={{ fontSize: 13 }}>{label}</Typography>
      </Stack>

      <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
    </Stack>
  );
}

const heroChipStyle = {
  borderRadius: "999px",
  fontWeight: 800,
  bgcolor: "rgba(109,97,210,0.08)",
  color: "#5b21b6",
  border: "1px solid rgba(109,97,210,0.14)",
};

const smallLiveChip = {
  borderRadius: "999px",
  fontWeight: 800,
  bgcolor: "rgba(14,165,233,0.08)",
  color: "#0369a1",
  border: "1px solid rgba(14,165,233,0.14)",
};

const primaryActionBtn = {
  textTransform: "none",
  borderRadius: "16px",
  py: 1.15,
  fontWeight: 800,
  background: "linear-gradient(135deg, #6d61d2 0%, #5146c4 100%)",
  boxShadow: "0 12px 24px rgba(109,97,210,0.22)",
  "&:hover": {
    background: "linear-gradient(135deg, #6154cb 0%, #473db6 100%)",
  },
};

const secondaryActionBtn = {
  textTransform: "none",
  borderRadius: "16px",
  py: 1.1,
  fontWeight: 800,
  borderColor: "rgba(109,97,210,0.18)",
  color: "#5b21b6",
  "&:hover": {
    borderColor: "rgba(109,97,210,0.28)",
    background: "rgba(109,97,210,0.03)",
  },
};

const noteChip = {
  borderRadius: "999px",
  fontWeight: 800,
  bgcolor: "rgba(109,97,210,0.08)",
  color: "#5b21b6",
  border: "1px solid rgba(109,97,210,0.14)",
};

const cardStyle = {
  p: { xs: 2.1, md: 2.5 },
  borderRadius: "28px",
  border: "1px solid rgba(255,255,255,0.72)",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,252,0.96))",
  boxShadow: "0 18px 38px rgba(15,23,42,0.05)",
};

const titleStyle = {
  fontWeight: 900,
  fontSize: "1.05rem",
  mb: 0.4,
};

const subTitleStyle = {
  fontSize: 13.5,
  color: "#64748b",
  mb: 2,
};