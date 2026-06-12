// src/pages/student/StudentAssignments.jsx

import { useEffect, useMemo, useState } from "react";
import API from "../../lib/api";
import {
  Box,
  Typography,
  Card,
  Stack,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
  Container
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const navigate = useNavigate();

  const showToast = (message, severity = "error") => {
    setToast({
      open: true,
      message,
      severity,
    });
  };

  const handleToastClose = (_, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    API.get("/api/student/assignments/")
      .then((res) => setAssignments(res.data))
      .catch(() => showToast("Failed to load assignments", "error"))
      .finally(() => setLoading(false));
  }, []);

  const getTimeLeft = (dueDate) => {
    const total = new Date(dueDate) - new Date();
    if (total <= 0) return "Expired";

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);

    if (days > 0) return `${days}d ${hours}h left`;

    const minutes = Math.floor((total / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m left`;
  };

  const getDeadlineTone = (dueDate) => {
    const total = new Date(dueDate) - new Date();
    if (total <= 0) {
      return {
        labelBg: "rgba(249,115,22,0.12)",
        labelBorder: "rgba(249,115,22,0.22)",
        labelColor: "#c2410c",
      };
    }

    const days = total / (1000 * 60 * 60 * 24);

    if (days <= 1) {
      return {
        labelBg: "rgba(239,68,68,0.10)",
        labelBorder: "rgba(239,68,68,0.20)",
        labelColor: "#dc2626",
      };
    }

    if (days <= 3) {
      return {
        labelBg: "rgba(245,158,11,0.12)",
        labelBorder: "rgba(245,158,11,0.22)",
        labelColor: "#d97706",
      };
    }

    return {
      labelBg: "rgba(16,185,129,0.10)",
      labelBorder: "rgba(16,185,129,0.18)",
      labelColor: "#059669",
    };
  };

  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter(
      (a) => !a.due_date || new Date(a.due_date) > new Date()
    ).length;
    const expired = assignments.filter(
      (a) => a.due_date && new Date(a.due_date) <= new Date()
    ).length;

    return { total, active, expired };
  }, [assignments]);

  const pageVariants = {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    initial: { opacity: 0, y: 16, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 24%), radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 20%), linear-gradient(180deg, #fafbff 0%, #f7f4ff 48%, #f8fafc 100%)",
      }}
    >
      <Container
        maxWidth="lg"
        component={motion.div}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.35 }}
        sx={{
          py: { xs: 2.5, md: 3.5 },
        }}
      >
      {/* HERO */}
      <Card
        sx={{
          mb: 2.5,
          p: { xs: 2.25, md: 3.2 },
          borderRadius: "28px",
          border: "1px solid rgba(124,58,237,0.10)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,244,255,0.98) 100%)",
          boxShadow: "0 18px 50px rgba(99,102,241,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(124,58,237,0.10)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            left: -50,
            bottom: -50,
            width: 190,
            height: 190,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.08)",
            filter: "blur(48px)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Box>
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label="Student Workspace"
              sx={{
                mb: 1.5,
                borderRadius: "999px",
                bgcolor: "rgba(124,58,237,0.10)",
                color: "#6d28d9",
                fontWeight: 800,
                border: "1px solid rgba(124,58,237,0.14)",
              }}
            />

            <Typography
              variant="h4"
              sx={{
                fontWeight: 950,
                letterSpacing: -0.8,
                color: "#0f172a",
                lineHeight: 1.15,
                mb: 1,
                fontSize: { xs: "1.85rem", md: "2.3rem" },
              }}
            >
              Assignments & Quizzes
            </Typography>

            <Typography
              sx={{
                color: "#64748b",
                maxWidth: 760,
                lineHeight: 1.8,
              }}
            >
              Track your tasks, deadlines, and upcoming work in one clean place.
              Open any card to view the full assignment details.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} flexWrap="wrap">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)", // mobile → 2 per row
                    sm: "repeat(3, 1fr)", // desktop → 3 in one row
                  },
                  gap: 1.2,
                  minWidth: { xs: "100%", sm: 300 },
                }}
              >
                {/* TOTAL */}
                <Box
                  sx={{
                    px: 1.7,
                    py: 1.2,
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
                    textAlign: "center",
                    transition: "0.25s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(99,102,241,0.08)",
                    },
                  }}
                >
                  <Typography fontSize={11} color="text.secondary" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography fontWeight={950} fontSize={18}>
                    {stats.total}
                  </Typography>
                </Box>

                {/* ACTIVE */}
                <Box
                  sx={{
                    px: 1.7,
                    py: 1.2,
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
                    textAlign: "center",
                    transition: "0.25s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(99,102,241,0.08)",
                    },
                  }}
                >
                  <Typography fontSize={11} color="text.secondary" fontWeight={700}>
                    Active
                  </Typography>
                  <Typography fontWeight={950} fontSize={18}>
                    {stats.active}
                  </Typography>
                </Box>

                {/* EXPIRED */}
                <Box
                  sx={{
                    px: 1.7,
                    py: 1.2,
                    borderRadius: "20px",
                    background: "rgba(255,255,255,0.85)",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
                    textAlign: "center",
                    transition: "0.25s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 12px 28px rgba(99,102,241,0.08)",
                    },
                  }}
                >
                  <Typography fontSize={11} color="text.secondary" fontWeight={700}>
                    Expired
                  </Typography>
                  <Typography fontWeight={950} fontSize={18}>
                    {stats.expired}
                  </Typography>
                </Box>
              </Box>
          </Stack>
        </Stack>
      </Card>

      {loading ? (
        <Card
          sx={{
            p: 5,
            borderRadius: "26px",
            border: "1px solid rgba(15,23,42,0.06)",
            background: "rgba(255,255,255,0.8)",
            boxShadow: "0 12px 32px rgba(15,23,42,0.05)",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CircularProgress sx={{ color: "#7c3aed" }} />
            <Typography color="text.secondary" fontWeight={600}>
              Loading your assignments...
            </Typography>
          </Stack>
        </Card>
      ) : assignments.length === 0 ? (
        <Card
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: "28px",
            textAlign: "center",
            border: "1px dashed rgba(124,58,237,0.20)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,244,255,0.96) 100%)",
            boxShadow: "0 14px 36px rgba(99,102,241,0.06)",
          }}
        >
          <Box
            sx={{
              width: 78,
              height: 78,
              borderRadius: "24px",
              display: "grid",
              placeItems: "center",
              mx: "auto",
              mb: 2,
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.10))",
              border: "1px solid rgba(124,58,237,0.14)",
            }}
          >
            <ChecklistRoundedIcon sx={{ fontSize: 34, color: "#6d28d9" }} />
          </Box>

          <Typography
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              fontSize: "1.15rem",
              mb: 1,
            }}
          >
            No assignments available yet
          </Typography>

          <Typography
            sx={{
              color: "#64748b",
              maxWidth: 460,
              mx: "auto",
              lineHeight: 1.8,
            }}
          >
            Your teachers will upload tasks here. Once something is assigned, it
            will appear in this workspace.
          </Typography>
        </Card>
      ) : (
          <Stack spacing={2} sx={{ maxWidth: "100%" }}>
          {assignments.map((a, index) => {
            const dueTone = a.due_date ? getDeadlineTone(a.due_date) : null;

            return (
              <Card
                key={a.id}
                component={motion.div}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.22, delay: index * 0.04 }}
                onClick={() => navigate(`/student/assignments/${a.id}`)}
                sx={{
                  p: { xs: 2.2, md: 2.6 },
                  cursor: "pointer",
                  borderRadius: "26px",
                  border: "1px solid rgba(15,23,42,0.06)",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(250,247,255,0.94))",
                  boxShadow: "0 10px 26px rgba(15,23,42,0.05)",
                  transition: "all 0.22s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
                    borderColor: "rgba(124,58,237,0.14)",
                  },
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        width: 62,
                        height: 62,
                        minWidth: 62,
                        borderRadius: "20px",
                        display: "grid",
                        placeItems: "center",
                        background:
                          "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(99,102,241,0.12))",
                        border: "1px solid rgba(124,58,237,0.14)",
                        boxShadow: "0 10px 24px rgba(99,102,241,0.08)",
                      }}
                    >
                      <AssignmentOutlinedIcon
                        sx={{ fontSize: 30, color: "#6366f1" }}
                      />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        fontWeight={900}
                        sx={{
                          fontSize: { xs: 18, md: 20 },
                          color: "#0f172a",
                          lineHeight: 1.3,
                          mb: 0.4,
                        }}
                      >
                        {a.title}
                      </Typography>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.8}
                        flexWrap="wrap"
                        sx={{ mb: 1.6 }}
                      >
                        <SchoolRoundedIcon
                          sx={{ fontSize: 16, color: "#64748b" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ color: "#64748b", fontWeight: 600 }}
                        >
                          {a.course_title}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={`${a.points} Points`}
                          sx={{
                            fontWeight: 800,
                            borderRadius: "999px",
                            color: "#6366f1",
                            bgcolor: alpha("#6366f1", 0.08),
                            border: "1px solid rgba(99,102,241,0.16)",
                          }}
                        />

                        {a.due_date && (
                          <Chip
                            icon={<CalendarMonthRoundedIcon />}
                            label={new Date(a.due_date).toLocaleString()}
                            sx={{
                              fontWeight: 700,
                              borderRadius: "999px",
                              bgcolor: "rgba(15,23,42,0.05)",
                              border: "1px solid rgba(15,23,42,0.08)",
                            }}
                          />
                        )}

                        {a.due_date && (
                          <Chip
                            icon={<AccessTimeRoundedIcon />}
                            label={getTimeLeft(a.due_date)}
                            sx={{
                              fontWeight: 800,
                              borderRadius: "999px",
                              bgcolor: dueTone?.labelBg,
                              border: `1px solid ${dueTone?.labelBorder}`,
                              color: dueTone?.labelColor,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  <Button
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      flexShrink: 0,
                      textTransform: "none",
                      fontWeight: 800,
                      borderRadius: "999px",
                      px: 2.2,
                      py: 1,
                      color: "#5b21b6",
                      bgcolor: "rgba(124,58,237,0.06)",
                      border: "1px solid rgba(124,58,237,0.12)",
                      "&:hover": {
                        bgcolor: "rgba(124,58,237,0.10)",
                      },
                    }}
                  >
                    Open
                  </Button>
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ mb: 2, ml: 2 }}
      >
        <Alert
          onClose={handleToastClose}
          variant="filled"
          sx={{
            borderRadius: "14px",
            fontWeight: 800,
            fontSize: "0.95rem",
            px: 2.5,
            py: 1.4,
            backdropFilter: "blur(12px)",
            boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
            background:
              toast.severity === "success"
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : toast.severity === "error"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : toast.severity === "warning"
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",
            color: "#fff",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
}