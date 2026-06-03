// src/pages/instructor/InstructorCourses.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../lib/api";
import AssignmentsManager from "./AssignmentsManager";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Avatar,
  Divider,
  Snackbar
} from "@mui/material";

import EditOutlined from "@mui/icons-material/EditOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import AddCircleOutlineRounded from "@mui/icons-material/AddCircleOutlineRounded";
import AssignmentTurnedInRounded from "@mui/icons-material/AssignmentTurnedInRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";

import { motion, AnimatePresence } from "framer-motion";

/* ------------------------------------------------------------------- */
/* ----------------- Helper: Extract YouTube Thumbnail ---------------- */
/* ------------------------------------------------------------------- */

function getYoutubeId(raw) {
  if (!raw) return null;
  const urlStr = String(raw).trim();

  if (/^[a-zA-Z0-9_-]{10,}$/.test(urlStr) && !urlStr.includes("http")) {
    return urlStr;
  }

  try {
    const url = new URL(urlStr);

    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "");
    }

    const vParam = url.searchParams.get("v");
    if (vParam) return vParam;

    const parts = url.pathname.split("/");
    const embedIndex = parts.indexOf("embed");
    if (embedIndex !== -1 && parts[embedIndex + 1]) {
      return parts[embedIndex + 1];
    }
  } catch { }

  const shortMatch = urlStr.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) return shortMatch[1];

  const watchMatch = urlStr.match(/[?&]v=([^?&]+)/);
  if (watchMatch?.[1]) return watchMatch[1];

  return null;
}

function stripHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function getCourseThumbnail(course) {
  if (course.thumbnail) return course.thumbnail;

  const videoUrl = course.intro_video_url || "";
  const videoId = getYoutubeId(videoUrl);
  if (!videoId) return null;

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/* ------------------------------------------------------------------- */
/* --------------------------- STYLES -------------------------------- */
/* ------------------------------------------------------------------- */

const palette = {
  primary: "#7c3aed",
  secondary: "#6366f1",
  dark: "#111827",
  muted: "#6b7280",
  softBg: "#faf7ff",
  softBg2: "#f3ecff",
  softChip: "rgba(124, 58, 237, 0.10)",
  border: "rgba(124, 58, 237, 0.12)",
  borderStrong: "rgba(124, 58, 237, 0.22)",
  white: "#ffffff",
};

const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const heroVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const gridVariants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 15, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

/* ------------------------------------------------------------------- */
/* --------------------------- MAIN PAGE ------------------------------ */
/* ------------------------------------------------------------------- */

export default function InstructorCourses() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const meRes = await API.get("/api/auth/me/");
        if (cancelled) return;
        setMe(meRes.data);

        if (meRes.data.role !== "TEACHER_APPROVED") {
          navigate("/teacher/status");
          return;
        }

        const coursesRes = await API.get("/api/instructor/courses/");
        if (cancelled) return;
        setCourses(coursesRes.data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showToast = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleToastClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;

    try {
      await API.delete(`/api/instructor/courses/${toDelete.id}/`);
      showToast("Course deleted successfully", "success");
      setToDelete(null);
      const res = await API.get("/api/instructor/courses/");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete course", "error");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 22%), linear-gradient(180deg, #ffffff 0%, #faf7ff 45%, #f3ecff 100%)",
        }}
      >
        <Box textAlign="center">
          <CircularProgress sx={{ color: palette.primary }} />
          <Typography sx={{ mt: 2, color: palette.muted }}>
            Loading your instructor workspace...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        px: { xs: 1.5, md: 2 },
        background:
          "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 24%), radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 22%), linear-gradient(180deg, #ffffff 0%, #faf7ff 42%, #f3ecff 100%)",
      }}
    >
      <Container
        maxWidth="xl"
        component={motion.div}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.4 }}
      >
        {/* ---------- HERO ---------- */}
        <Paper
          component={motion.div}
          variants={heroVariants}
          initial="initial"
          animate="animate"
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2.5, md: 4 },
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(250,247,255,0.97) 100%)",
            boxShadow: "0 20px 60px rgba(124,58,237,0.08)",
            overflow: "hidden",
            position: "relative",
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
              background: "rgba(124,58,237,0.08)",
              filter: "blur(8px)",
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box>
              <Chip
                label="Instructor Workspace"
                sx={{
                  mb: 1.5,
                  borderRadius: 999,
                  bgcolor: palette.softChip,
                  color: palette.primary,
                  fontWeight: 700,
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: palette.dark,
                  lineHeight: 1.2,
                  mb: 1,
                }}
              >
                Manage your courses
              </Typography>
              <Typography
                sx={{
                  color: palette.muted,
                  maxWidth: 720,
                  lineHeight: 1.8,
                }}
              >
                Create new learning experiences, update content, and manage your
                course and assignment workflow from one clean dashboard.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddCircleOutlineRounded />}
              sx={{
                borderRadius: 999,
                px: 3.2,
                py: 1.2,
                textTransform: "none",
                fontWeight: 800,
                background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                boxShadow: "0 16px 34px rgba(124,58,237,0.24)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                },
              }}
              onClick={() => navigate("/instructor/courses/new")}
            >
              Create your course
            </Button>
          </Box>
        </Paper>

        {/* ---------- TABS ---------- */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 1,
            borderRadius: 1,
            border: `1px solid ${palette.border}`,
            bgcolor: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 10px 30px rgba(124,58,237,0.04)",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              minHeight: "unset",
              "& .MuiTabs-indicator": {
                display: "none",
              },
            }}
          >
            <Tab
              icon={<MenuBookRounded fontSize="small" />}
              iconPosition="start"
              label="Courses"
              sx={{
                minHeight: 44,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                color: palette.muted,
                "&.Mui-selected": {
                  color: palette.primary,
                  bgcolor: palette.softChip,
                },
              }}
            />
            <Tab
              icon={<AssignmentTurnedInRounded fontSize="small" />}
              iconPosition="start"
              label="Assignments"
              sx={{
                minHeight: 44,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                color: palette.muted,
                "&.Mui-selected": {
                  color: palette.primary,
                  bgcolor: palette.softChip,
                },
              }}
            />
          </Tabs>
        </Paper>

        {/* ---------- ERROR ---------- */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {/* ===================================================================== */}
        {/* ========================== TAB 1: COURSES ============================ */}
        {/* ===================================================================== */}
        {tab === 0 && (
          <>
            <Paper
              component={motion.div}
              variants={heroVariants}
              initial="initial"
              animate="animate"
              elevation={0}
              sx={{
                borderRadius: 1,
                border: `1px solid ${palette.border}`,
                p: { xs: 2.5, md: 3 },
                mb: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(250,247,255,0.96) 100%)",
              }}
            >
              <Box>
                <Typography
                  fontWeight={800}
                  sx={{ mb: 0.5, color: palette.dark, fontSize: "1.06rem" }}
                >
                  Ready to build something new?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start crafting your next course with a cleaner, more polished
                  workflow.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                endIcon={<ArrowForwardRounded />}
                sx={{
                  borderRadius: 999,
                  px: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  color: palette.primary,
                  borderColor: palette.borderStrong,
                }}
                onClick={() => navigate("/instructor/courses/new")}
              >
                Create your course
              </Button>
            </Paper>

            {courses.length === 0 && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 1,
                  p: 5,
                  textAlign: "center",
                  border: "1px dashed rgba(124,58,237,0.22)",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(250,247,255,0.96) 100%)",
                }}
              >
                <Avatar
                  sx={{
                    width: 68,
                    height: 68,
                    mx: "auto",
                    mb: 2,
                    bgcolor: palette.softChip,
                    color: palette.primary,
                  }}
                >
                  <MenuBookRounded />
                </Avatar>

                <Typography fontWeight={800} sx={{ mb: 1, color: palette.dark }}>
                  You don’t have any courses yet
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                  Create your first course and start building your instructor space.
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    textTransform: "none",
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                  }}
                  onClick={() => navigate("/instructor/courses/new")}
                >
                  Create your first course
                </Button>
              </Paper>
            )}

            {courses.length > 0 && (
              <AnimatePresence>
                <Box
                  component={motion.div}
                  variants={gridVariants}
                  initial="initial"
                  animate="animate"
                  sx={{
                    display: "grid",
                    gap: 3,
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, 1fr)",
                      xl: "repeat(3, 1fr)",
                    },
                  }}
                >
                  {courses.map((course) => {
                    const price = Number(course.price || 0);
                    const thumbSrc = getCourseThumbnail(course);

                    return (
                      <Card
                        key={course.id}
                        component={motion.div}
                        variants={cardVariants}
                        initial="initial"
                        animate="animate"
                        exit={{ opacity: 0, scale: 0.96, y: 5 }}
                        transition={{ duration: 0.25 }}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          cursor: "pointer",
                          borderRadius: 1,
                          overflow: "hidden",
                          border: `1px solid ${palette.border}`,
                          background: "rgba(255,255,255,0.9)",
                          boxShadow: "0 12px 34px rgba(17,24,39,0.06)",
                          transition: "all 0.25s ease",
                          "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: "0 24px 48px rgba(17,24,39,0.10)",
                          },
                        }}
                        onClick={() => navigate(`/courses/${course.id}`)}
                      >
                        {thumbSrc ? (
                          <CardMedia
                            component="img"
                            image={thumbSrc}
                            alt={course.title}
                            sx={{ height: 210, objectFit: "cover" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 210,
                              background:
                                "linear-gradient(135deg, #7c3aed 0%, #6366f1 60%, #a855f7 100%)",
                              color: "white",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontSize: 40,
                              fontWeight: 800,
                            }}
                          >
                            {course.title?.[0]?.toUpperCase()}
                          </Box>
                        )}

                        <CardContent sx={{ flexGrow: 1, p: 2.4 }}>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                            noWrap
                            sx={{ mb: 0.7 }}
                          >
                            {me?.username}
                          </Typography>

                          <Typography
                            variant="h6"
                            fontWeight={800}
                            gutterBottom
                            sx={{
                              color: palette.dark,
                              lineHeight: 1.35,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              minHeight: 58,
                            }}
                          >
                            {course.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              mb: 2,
                              lineHeight: 1.75,
                              minHeight: 66,
                            }}
                          >
                            {stripHtml(course.description)}
                          </Typography>

                          <Box
                            sx={{
                              mt: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              size="small"
                              label={
                                course.course_type === "PRACTICE_TEST"
                                  ? "Practice Test"
                                  : "Course"
                              }
                              sx={{
                                borderRadius: 999,
                                bgcolor: palette.softChip,
                                color: palette.primary,
                                fontWeight: 700,
                              }}
                            />
                            <Typography fontWeight={800} sx={{ color: palette.dark }}>
                              {price > 0 ? `$${price.toFixed(2)}` : "Free"}
                            </Typography>
                          </Box>
                        </CardContent>

                        <Divider />

                        <CardActions
                          sx={{
                            justifyContent: "space-between",
                            px: 2.2,
                            py: 1.5,
                            gap: 1,
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* LEFT SIDE BUTTONS */}
                          <Box sx={{ display: "flex", gap: 1 }}>

                            {/* 🔴 START LIVE BUTTON */}
                            <Button
                              size="small"
                              sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 999,
                                px: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                color: "#ef4444",
                                backgroundColor: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.2)",
                              }}
                              onClick={async () => {
                                try {
                                  const cur = await API.get(`/api/courses/${course.id}/curriculum/`);

                                  let firstLecture = null;
                                  for (const section of cur.data) {
                                    if (section.lectures && section.lectures.length > 0) {
                                      firstLecture = section.lectures[0];
                                      break;
                                    }
                                  }

                                  if (!firstLecture) {
                                    showToast("No lecture found", "warning");
                                    return;
                                  }

                                  // 🔥 REDIRECT instead of starting meeting
                                  navigate(`/instructor/live-session/${firstLecture.id}`);

                                } catch (err) {
                                  console.error(err);
                                  showToast("Failed to load lecture", "error");
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  backgroundColor: "#ef4444",
                                  animation: "pulse 1.2s infinite",
                                  "@keyframes pulse": {
                                    "0%": { opacity: 1 },
                                    "50%": { opacity: 0.3 },
                                    "100%": { opacity: 1 },
                                  },
                                }}
                              />
                              Go Live
                            </Button>

                          </Box>

                          {/* RIGHT SIDE ICONS */}
                          <Box sx={{ display: "flex", gap: 0.8 }}>
                            <Tooltip title="Edit course">
                              <IconButton
                                size="small"
                                sx={{
                                  border: `1px solid ${palette.border}`,
                                  color: palette.primary,
                                }}
                                onClick={() =>
                                  navigate(`/instructor/courses/${course.id}/edit`)
                                }
                              >
                                <EditOutlined fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Delete course">
                              <IconButton
                                size="small"
                                color="error"
                                sx={{
                                  border: "1px solid rgba(239,68,68,0.18)",
                                }}
                                onClick={() => setToDelete(course)}
                              >
                                <DeleteOutline fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardActions>
                      </Card>
                    );
                  })}
                </Box>
              </AnimatePresence>
            )}
          </>
        )}

        {/* ===================================================================== */}
        {/* ======================== TAB 2: ASSIGNMENTS ========================== */}
        {/* ===================================================================== */}
        {tab === 1 && (
          <Box>
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                p: { xs: 2.5, md: 3 },
                borderRadius: 1,
                border: `1px solid ${palette.border}`,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(250,247,255,0.96) 100%)",
                boxShadow: "0 14px 34px rgba(17,24,39,0.05)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", md: "center" },
                  justifyContent: "space-between",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 2,
                }}
              >
                <Box>
                  <Chip
                    icon={<AssignmentTurnedInRounded />}
                    label="Assignment Workspace"
                    sx={{
                      mb: 1.5,
                      borderRadius: 999,
                      bgcolor: palette.softChip,
                      color: palette.primary,
                      fontWeight: 700,
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: palette.dark,
                      mb: 0.8,
                    }}
                  >
                    Manage assignments with a cleaner workflow
                  </Typography>
                  <Typography
                    sx={{
                      color: palette.muted,
                      maxWidth: 760,
                      lineHeight: 1.75,
                    }}
                  >
                    Create, organize, and manage assignments for your course content
                    in one focused space. This section is now wrapped in a more
                    premium layout so the workflow feels cleaner and easier to use.
                  </Typography>
                </Box>

                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: palette.softChip,
                    color: palette.primary,
                  }}
                >
                  <AssignmentTurnedInRounded />
                </Avatar>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                borderRadius: 1,
                border: `1px solid ${palette.border}`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(249,245,255,0.98) 100%)",
                boxShadow: "0 22px 60px rgba(124,58,237,0.08)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: { xs: 2, md: 3 },
                  py: 2,
                  borderBottom: `1px solid ${palette.border}`,
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(99,102,241,0.05) 100%)",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: palette.dark,
                    fontSize: "1rem",
                  }}
                >
                  Assignment Manager
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: palette.muted, mt: 0.5 }}
                >
                  Build and manage assignment items inside this workspace.
                </Typography>
              </Box>

              <Box sx={{ p: { xs: 1.5, md: 2.5 } }}>
                <AssignmentsManager />
              </Box>
            </Paper>
          </Box>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        <Dialog
          open={!!toDelete}
          onClose={() => setToDelete(null)}
          PaperProps={{
            sx: {
              borderRadius: "26px",
              p: 1,
              textAlign: "center",
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(18px)",
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: "0 30px 80px rgba(15,23,42,0.2)",
              minWidth: { xs: 300, sm: 420 },
            },
          }}
        >
          <DialogContent sx={{ pt: 3 }}>

            {/* ICON */}
            <Box sx={{ mb: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "22px",
                  background: "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.05))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  boxShadow: "0 10px 30px rgba(239,68,68,0.2)",
                }}
              >
                <DeleteOutline sx={{ color: "#ef4444", fontSize: 30 }} />
              </Box>
            </Box>

            {/* TITLE */}
            <Typography
              fontWeight={900}
              sx={{ mb: 1, fontSize: "1.2rem", color: "#0f172a" }}
            >
              Delete Course
            </Typography>

            {/* TEXT */}
            <Typography
              sx={{
                color: "#6b7280",
                fontSize: "0.95rem",
                lineHeight: 1.7,
                maxWidth: 320,
                mx: "auto",
              }}
            >
              Are you sure you want to delete{" "}
              <b>{toDelete?.title}</b>? <br />
              This action cannot be undone.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button
              onClick={() => setToDelete(null)}
              sx={{
                textTransform: "none",
                fontWeight: 800,
                borderRadius: "999px",
                px: 3,
                color: "#6366f1",
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleDeleteConfirm}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                borderRadius: "999px",
                px: 3.5,
                color: "#fff",
                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                boxShadow: "0 14px 30px rgba(239,68,68,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      <Snackbar
        open={snackbar.open}
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
              snackbar.severity === "success"
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : snackbar.severity === "error"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : snackbar.severity === "warning"
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",

            color: "#fff",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}