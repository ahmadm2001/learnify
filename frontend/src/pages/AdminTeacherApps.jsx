// src/pages/AdminTeacherApps.jsx
import { useEffect, useMemo, useState } from "react";
import API from "../lib/api";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";

import AdminLayout from "../components/AdminLayout";

import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import DoDisturbAltRoundedIcon from "@mui/icons-material/DoDisturbAltRounded";

function statusColor(status) {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    default:
      return "warning";
  }
}

function getStatusStyles(status) {
  switch (status) {
    case "APPROVED":
      return {
        color: "#15803d",
        bg: "rgba(34,197,94,0.10)",
        border: "rgba(34,197,94,0.18)",
        icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />,
      };
    case "REJECTED":
      return {
        color: "#dc2626",
        bg: "rgba(239,68,68,0.10)",
        border: "rgba(239,68,68,0.18)",
        icon: <CancelRoundedIcon sx={{ fontSize: 16 }} />,
      };
    default:
      return {
        color: "#b45309",
        bg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.22)",
        icon: <PendingActionsRoundedIcon sx={{ fontSize: 16 }} />,
      };
  }
}

function getInitials(firstName, lastName, username) {
  const first = (firstName || "").trim().charAt(0);
  const last = (lastName || "").trim().charAt(0);

  if (first || last) return `${first}${last}`.toUpperCase();
  return (username || "U").trim().charAt(0).toUpperCase();
}

const rowVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

function StatsCard({
  title,
  value,
  helper,
  icon,
  accent = "#6d61d2",
  softBg = "rgba(109,97,210,0.08)",
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        height: "100%",
        borderRadius: "24px",
        border: "1px solid rgba(255,255,255,0.7)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 100%)",
        backdropFilter: "blur(18px)",
        boxShadow:
          "0 12px 30px rgba(15,23,42,0.05), 0 2px 10px rgba(109,97,210,0.04)",
        transition: "all 0.28s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            "0 18px 40px rgba(15,23,42,0.08), 0 8px 18px rgba(109,97,210,0.08)",
        },
      }}
    >
      <Stack direction="row" spacing={1.6} alignItems="center">
        <Avatar
          sx={{
            width: 52,
            height: 52,
            borderRadius: "18px",
            bgcolor: softBg,
            color: accent,
            boxShadow: `0 10px 24px ${alpha(accent, 0.16)}`,
          }}
        >
          {icon}
        </Avatar>

        <Box>
          <Typography
            sx={{
              fontSize: 13,
              color: "#64748b",
              fontWeight: 700,
              mb: 0.2,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 28,
              lineHeight: 1.05,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#0f172a",
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: "#94a3b8",
              mt: 0.3,
            }}
          >
            {helper}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function EmptyState() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: "30px",
        textAlign: "center",
        border: "1px dashed rgba(109,97,210,0.20)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.90), rgba(248,244,255,0.94))",
        boxShadow: "0 16px 38px rgba(15,23,42,0.04)",
      }}
    >
      <Box
        sx={{
          width: 82,
          height: 82,
          mx: "auto",
          mb: 2,
          borderRadius: "24px",
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(135deg, rgba(109,97,210,0.12), rgba(81,70,196,0.10))",
          border: "1px solid rgba(109,97,210,0.14)",
        }}
      >
        <SchoolRoundedIcon sx={{ fontSize: 36, color: "#6d61d2" }} />
      </Box>

      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.18rem",
          color: "#0f172a",
          mb: 1,
        }}
      >
        No teacher applications yet
      </Typography>

      <Typography
        sx={{
          color: "#64748b",
          maxWidth: 520,
          mx: "auto",
          lineHeight: 1.8,
        }}
      >
        When users apply to become instructors, their requests will appear here
        for review, approval, or rejection.
      </Typography>
    </Paper>
  );
}

function MobileApplicationCard({ row, handleAction, actionLoading }) {
  const statusUi = getStatusStyles(row.status);
  const initials = getInitials(row.first_name, row.last_name, row.username);

  return (
    <Paper
      variant="outlined"
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      sx={{
        p: 2,
        borderRadius: "24px",
        borderColor: "rgba(226,232,255,0.9)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.96) 100%)",
        boxShadow: "0 12px 28px rgba(15,23,42,0.04)",
      }}
    >
      <Stack spacing={1.8}>
        <Stack direction="row" spacing={1.4} alignItems="center">
          <Avatar
            sx={{
              width: 56,
              height: 56,
              borderRadius: "18px",
              background: "linear-gradient(135deg, #6d61d2 0%, #5146c4 100%)",
              fontWeight: 900,
              boxShadow: "0 10px 24px rgba(109,97,210,0.24)",
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: 16,
                color: "#0f172a",
                lineHeight: 1.3,
              }}
            >
              {row.first_name} {row.last_name}
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: "#64748b",
                mt: 0.2,
              }}
            >
              @{row.username}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={1.1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MailOutlineRoundedIcon sx={{ fontSize: 17, color: "#6366f1" }} />
            <Typography sx={{ fontSize: 13.5, color: "#334155" }}>
              {row.email}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <PhoneRoundedIcon sx={{ fontSize: 17, color: "#6366f1" }} />
            <Typography sx={{ fontSize: 13.5, color: "#334155" }}>
              {row.phone || "—"}
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
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

          {row.resume_url ? (
            <Button
              size="small"
              href={row.resume_url}
              target="_blank"
              rel="noreferrer"
              startIcon={<DescriptionRoundedIcon />}
              sx={{
                textTransform: "none",
                fontSize: 12.5,
                px: 1.5,
                py: 0.7,
                borderRadius: "999px",
                color: "#5b21b6",
                bgcolor: "rgba(109,97,210,0.08)",
                border: "1px solid rgba(109,97,210,0.14)",
                "&:hover": {
                  bgcolor: "rgba(109,97,210,0.12)",
                },
              }}
            >
              View CV
            </Button>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No CV uploaded
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button
            fullWidth
            variant="contained"
            disabled={
              row.status === "APPROVED" ||
              (actionLoading.id === row.id && actionLoading.type === "approve")
            }
            onClick={() => handleAction(row.id, "approve")}
          >
            {actionLoading.id === row.id && actionLoading.type === "approve" ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Approve"
            )}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            disabled={
              row.status === "REJECTED" ||
              (actionLoading.id === row.id && actionLoading.type === "reject")
            }
            onClick={() => handleAction(row.id, "reject")}
            sx={{
              textTransform: "none",
              borderRadius: "16px",
              py: 1.1,
              fontWeight: 800,
              borderWidth: "1.5px",
            }}
          >
            {actionLoading.id === row.id && actionLoading.type === "reject" ? (
              <CircularProgress size={18} />
            ) : (
              "Reject"
            )}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function DesktopApplicationsTable({ apps, handleAction, actionLoading }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: "28px",
        border: "1px solid rgba(226,232,255,0.9)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))",
        width: "100%",
        overflowX: "auto",
        boxShadow: "0 18px 40px rgba(15,23,42,0.05)",
      }}
    >
      <Table
        size="small"
        sx={{
          minWidth: 930,
          "& .MuiTableCell-root": {
            borderColor: "rgba(226,232,240,0.8)",
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              "& th": {
                fontWeight: 800,
                color: "#475569",
                background:
                  "linear-gradient(180deg, rgba(248,250,252,0.92), rgba(255,255,255,0.95))",
                whiteSpace: "nowrap",
                fontSize: 13,
                py: 2.1,
                borderBottom: "1px solid rgba(226,232,240,0.8)",
              },
            }}
          >
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>CV</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <AnimatePresence initial={false}>
            {apps.map((row) => {
              const statusUi = getStatusStyles(row.status);
              const initials = getInitials(
                row.first_name,
                row.last_name,
                row.username
              );

              return (
                <TableRow
                  key={row.id}
                  component={motion.tr}
                  variants={rowVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  sx={{
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(109,97,210,0.03)",
                    },
                  }}
                >
                  <TableCell sx={{ minWidth: 260, py: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "16px",
                          background:
                            "linear-gradient(135deg, #6d61d2 0%, #5146c4 100%)",
                          fontWeight: 900,
                          boxShadow: "0 10px 24px rgba(109,97,210,0.20)",
                        }}
                      >
                        {initials}
                      </Avatar>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: 15,
                            color: "#0f172a",
                            lineHeight: 1.3,
                          }}
                        >
                          {row.first_name} {row.last_name}
                        </Typography>

                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "#64748b",
                            mt: 0.35,
                          }}
                        >
                          @{row.username}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  <TableCell
                    sx={{
                      minWidth: 220,
                      fontSize: 14,
                      color: "#334155",
                    }}
                  >
                    {row.email}
                  </TableCell>

                  <TableCell
                    sx={{
                      minWidth: 130,
                      fontSize: 14,
                      color: "#334155",
                    }}
                  >
                    {row.phone || "—"}
                  </TableCell>

                  <TableCell sx={{ minWidth: 130 }}>
                    <Chip
                      icon={statusUi.icon}
                      label={row.status}
                      sx={{
                        borderRadius: "999px",
                        fontWeight: 800,
                        color: statusUi.color,
                        bgcolor: statusUi.bg,
                        border: `1px solid ${statusUi.border}`,
                        px: 0.3,
                      }}
                    />
                  </TableCell>

                  <TableCell sx={{ minWidth: 120, whiteSpace: "nowrap" }}>
                    {row.resume_url ? (
                      <Button
                        size="small"
                        href={row.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        startIcon={<DescriptionRoundedIcon />}
                        sx={{
                          textTransform: "none",
                          fontSize: 13,
                          fontWeight: 800,
                          borderRadius: "999px",
                          px: 1.6,
                          py: 0.8,
                          color: "#5b21b6",
                          bgcolor: "rgba(109,97,210,0.08)",
                          border: "1px solid rgba(109,97,210,0.12)",
                          "&:hover": {
                            bgcolor: "rgba(109,97,210,0.12)",
                          },
                        }}
                      >
                        View PDF
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right" sx={{ minWidth: 220 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                      alignItems="center"
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={
                          row.status === "APPROVED" ||
                          (actionLoading.id === row.id && actionLoading.type === "approve")
                        }
                        onClick={() => handleAction(row.id, "approve")}
                      >
                        {actionLoading.id === row.id && actionLoading.type === "approve" ? (
                          <CircularProgress size={18} sx={{ color: "#fff" }} />
                        ) : (
                          "Approve"
                        )}
                      </Button>

                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        disabled={
                          row.status === "REJECTED" ||
                          (actionLoading.id === row.id && actionLoading.type === "reject")
                        }
                        onClick={() => handleAction(row.id, "reject")}
                      >
                        {actionLoading.id === row.id && actionLoading.type === "reject" ? (
                          <CircularProgress size={18} />
                        ) : (
                          "Reject"
                        )}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </AnimatePresence>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function AdminTeacherApps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionLoading, setActionLoading] = useState({
    id: null,
    type: null,
  });

  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  const load = async () => {
    setLoading(true);
    setErr("");

    try {
      const { data } = await API.get("/api/teacher/applications/");
      setApps(data);
    } catch (e) {
      setErr(
        "You must be logged in as an Admin (is_staff=true) to view this page."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (id, action) => {
    try {
      setActionLoading({ id, type: action });

      await API.post(`/api/teacher/applications/${id}/${action}/`);

      await load();
    } catch (e) {
      console.error(e);
      setErr("Action failed. Check console / network tab.");
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const total = apps.length;
  const pending = apps.filter((a) => a.status === "PENDING").length;
  const approved = apps.filter((a) => a.status === "APPROVED").length;
  const rejected = apps.filter((a) => a.status === "REJECTED").length;

  const completion = useMemo(() => {
    if (total === 0) return 0;
    return Math.round(((approved + rejected) / total) * 100);
  }, [total, approved, rejected]);

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
              Loading applications...
            </Typography>
          </Stack>
        </Box>
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
            <Paper
              component={motion.div}
              variants={fadeUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.35, ease: "easeOut" }}
              elevation={0}
              sx={{
                p: { xs: 2.2, sm: 2.8, md: 3.4 },
                borderRadius: "34px",
                overflow: "hidden",
                position: "relative",
                background:
                  "linear-gradient(135deg, rgba(248,245,255,0.95) 0%, rgba(255,255,255,0.98) 40%, rgba(243,240,255,0.95) 100%)",
                border: "1px solid rgba(109,97,210,0.15)",
                boxShadow: "0 18px 50px rgba(109,97,210,0.10)",
                backdropFilter: "blur(16px)", // 🔥 premium glass feel
              }}
            >
              {/* BLUR SHAPES */}
              <Box
                sx={{
                  position: "absolute",
                  top: -90,
                  right: -70,
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
                  bottom: -90,
                  left: -70,
                  width: 230,
                  height: 230,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(99,102,241,0.14), transparent 70%)",
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
                {/* LEFT */}
                <Box sx={{ maxWidth: 760 }}>
                  <Chip
                    icon={<AdminPanelSettingsRoundedIcon />}
                    label="Admin Review Center"
                    sx={{
                      mb: 1.5,
                      borderRadius: "999px",
                      bgcolor: "rgba(109,97,210,0.10)",
                      color: "#6d61d2",
                      fontWeight: 800,
                      border: "1px solid rgba(109,97,210,0.18)",
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: { xs: "1.9rem", md: "2.65rem" },
                      lineHeight: 1.06,
                      fontWeight: 950,
                      letterSpacing: "-0.05em",
                      color: "#0f172a", // ✅ FIXED
                      mb: 1.1,
                    }}
                  >
                    Teacher Applications
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b", // ✅ FIXED
                      maxWidth: 760,
                      lineHeight: 1.85,
                      fontSize: { xs: "0.96rem", md: "1rem" },
                    }}
                  >
                    Review requests from users who want to become instructors,
                    verify their details, check uploaded CVs, and approve or
                    reject applications from one premium dashboard.
                  </Typography>
                </Box>

                {/* RIGHT */}
                <Stack
                  spacing={1.2}
                  sx={{
                    minWidth: { xs: "100%", lg: 290 },
                    width: { xs: "100%", lg: "auto" },
                  }}
                >
                  {/* PROGRESS CARD */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: "24px",
                      bgcolor: "rgba(255,255,255,0.85)", // ✅ FIXED
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
                            color: "#64748b", // ✅ FIXED
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Review progress
                        </Typography>

                        <Typography
                          sx={{
                            color: "#0f172a", // ✅ FIXED
                            fontWeight: 900,
                            fontSize: 28,
                            mt: 0.4,
                          }}
                        >
                          {completion}%
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
                        <VerifiedRoundedIcon />
                      </Avatar>
                    </Stack>

                    <Typography
                      sx={{
                        color: "#64748b", // ✅ FIXED
                        fontSize: 12.5,
                        mt: 0.8,
                      }}
                    >
                      {approved + rejected} of {total} applications reviewed so far.
                    </Typography>
                  </Paper>

                  {/* BUTTON */}
                  <Button
                    variant="contained"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={load}
                    sx={{
                      textTransform: "none",
                      borderRadius: "18px",
                      py: 1.2,
                      fontWeight: 800,
                      fontSize: 14,
                      color: "white",
                      background:
                        "linear-gradient(135deg, #6d61d2, #5146c4)", // ✅ FIXED
                      boxShadow: "0 12px 30px rgba(109,97,210,0.25)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5f55c7, #4338ca)",
                      },
                    }}
                  >
                    Refresh applications
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {/* STATS */}
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
                title="Total applications"
                value={total}
                helper="All submitted instructor requests"
                icon={<Inventory2RoundedIcon />}
                accent="#6d61d2"
                softBg="rgba(109,97,210,0.10)"
              />

              <StatsCard
                title="Pending review"
                value={pending}
                helper="Waiting for an admin decision"
                icon={<HourglassTopRoundedIcon />}
                accent="#f59e0b"
                softBg="rgba(245,158,11,0.12)"
              />

              <StatsCard
                title="Approved"
                value={approved}
                helper="Accepted as instructors"
                icon={<CheckCircleRoundedIcon />}
                accent="#22c55e"
                softBg="rgba(34,197,94,0.10)"
              />

              <StatsCard
                title="Rejected"
                value={rejected}
                helper="Requests declined by admins"
                icon={<DoDisturbAltRoundedIcon />}
                accent="#ef4444"
                softBg="rgba(239,68,68,0.10)"
              />
            </Box>

            {/* ERROR */}
            {err && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: "18px",
                  fontWeight: 700,
                }}
              >
                {err}
              </Alert>
            )}

            {/* CONTENT */}
            {apps.length === 0 ? (
              <EmptyState />
            ) : isCompact ? (
              <Stack spacing={2.2}>
                {apps.map((row) => (
                  <MobileApplicationCard
                    key={row.id}
                    row={row}
                    handleAction={handleAction}
                    actionLoading={actionLoading}
                  />
                ))}
              </Stack>
            ) : (
              <DesktopApplicationsTable
                apps={apps}
                handleAction={handleAction}
                actionLoading={actionLoading}
              />
            )}

            {/* FOOTER NOTE */}
            {apps.length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.2,
                  borderRadius: "22px",
                  border: "1px solid rgba(226,232,255,0.85)",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(248,250,252,0.94))",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1.2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#0f172a",
                        mb: 0.3,
                      }}
                    >
                      Admin review flow
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13.5,
                        color: "#64748b",
                        lineHeight: 1.7,
                      }}
                    >
                      Review each applicant carefully before approval. Approved
                      users will gain instructor privileges, while rejected users
                      remain non-instructors.
                    </Typography>
                  </Box>

                  <Button
                    variant="text"
                    endIcon={<ArrowOutwardRoundedIcon />}
                    onClick={load}
                    sx={{
                      textTransform: "none",
                      borderRadius: "999px",
                      fontWeight: 800,
                      color: "#5b21b6",
                    }}
                  >
                    Refresh data
                  </Button>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Container>
      </Box>
    </AdminLayout>
  );
}