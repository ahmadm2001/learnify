import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { motion } from "framer-motion";

import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

function formatMoney(value) {
  const num = Number(value || 0);
  return `$${num.toFixed(2)}`;
}

function getSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function stripHtml(html = "") {
  if (!html) return "";
  return String(html)
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getCourseImage(course) {
  return course?.thumbnail || course?.thumbnail_url || "";
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  gradient = "linear-gradient(135deg, #ffffff 0%, #faf7ff 100%)",
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        height: "100%",
        minHeight: 165,
        borderRadius: 1, // reduced radius
        border: "1px solid rgba(226,232,255,0.95)",
        background: gradient,
        boxShadow: "0 10px 30px rgba(148,163,184,0.08)",
        transition: "0.25s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 18px 36px rgba(124,58,237,0.12)",
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontWeight: 600 }}
          >
            {title}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              mb: 0.8,
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.5,
              display: "-webkit-box",
              overflow: "hidden",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(124,58,237,0.08)",
            color: "#6d28d9",
            border: "1px solid rgba(124,58,237,0.12)",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function SmallInfoCard({ title, value, helper, icon, color = "#7c3aed" }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        height: "100%",
        minHeight: 144,
        borderRadius: 4,
        border: "1px solid rgba(226,232,255,0.92)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(252,250,255,0.98) 100%)",
        boxShadow: "0 10px 30px rgba(148,163,184,0.06)",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.8 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            bgcolor: `${color}14`,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Typography variant="body2" fontWeight={800}>
          {title}
        </Typography>
      </Stack>

      <Typography
        variant="h5"
        fontWeight={900}
        sx={{ mb: 0.4, letterSpacing: "-0.03em" }}
      >
        {value}
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        {helper}
      </Typography>
    </Paper>
  );
}

function CourseRow({ course, nav }) {
  const isPublished =
    course?.is_published === true ||
    course?.published === true ||
    course?.status === "PUBLISHED";

  const price = Number(course?.price || 0);
  const isFree = price === 0;
  const cleanDescription = stripHtml(course?.description) || "No description added yet.";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 1,
        border: "1px solid rgba(226,232,255,0.92)",
        backgroundColor: "rgba(255,255,255,0.98)",
        boxShadow: "0 10px 28px rgba(148,163,184,0.05)",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 30px rgba(99,102,241,0.08)",
        },
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
      >
        <Stack
          direction="row"
          spacing={1.8}
          alignItems="flex-start"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Avatar
            src={getCourseImage(course)}
            variant="rounded"
            sx={{
              width: 78,
              height: 78,
              borderRadius: 3,
              bgcolor: "rgba(124,58,237,0.10)",
              color: "#6d28d9",
              fontWeight: 900,
              fontSize: "1.15rem",
              flexShrink: 0,
            }}
          >
            {(course?.title || "C").charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              fontWeight={800}
              sx={{
                mb: 0.8,
                fontSize: "1.03rem",
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {course?.title || "Untitled course"}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              alignItems="center"
              sx={{ mb: 1.1 }}
            >
              <Chip
                size="small"
                label={isPublished ? "Published" : "Draft"}
                sx={{
                  borderRadius: 999,
                  fontWeight: 800,
                  bgcolor: isPublished
                    ? "rgba(34,197,94,0.10)"
                    : "rgba(245,158,11,0.12)",
                  color: isPublished ? "#15803d" : "#b45309",
                }}
              />

              <Chip
                size="small"
                label={course?.course_type || "Course"}
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  bgcolor: "rgba(99,102,241,0.10)",
                  color: "#4f46e5",
                }}
              />

              <Chip
                size="small"
                label={isFree ? "Free" : formatMoney(price)}
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  bgcolor: isFree
                    ? "rgba(6,182,212,0.10)"
                    : "rgba(124,58,237,0.10)",
                  color: isFree ? "#0f766e" : "#6d28d9",
                }}
              />
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                maxWidth: "100%",
                display: "-webkit-box",
                overflow: "hidden",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.6,
                wordBreak: "break-word",
              }}
            >
              {cleanDescription}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "flex-start", md: "flex-end" },
            minWidth: { xs: "100%", md: 150 },
          }}
        >
          <Button
            variant="outlined"
            endIcon={<ArrowOutwardRoundedIcon />}
            onClick={() => nav("/instructor/courses")}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2.2,
              py: 1,
              fontWeight: 800,
              borderColor: "rgba(124,58,237,0.22)",
              color: "#6d28d9",
              whiteSpace: "nowrap",
            }}
          >
            Manage
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

function SectionCard({ title, subtitle, action, children, sx = {} }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 1,
        border: "1px solid rgba(226,232,255,0.92)",
        backgroundColor: "rgba(255,255,255,0.96)",
        boxShadow: "0 14px 36px rgba(148,163,184,0.06)",
        height: "100%",
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2.2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: "-0.02em" }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        {action}
      </Stack>

      {children}
    </Paper>
  );
}

export default function InstructorDashboard() {
  const nav = useNavigate();

  const [me, setMe] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const meRes = await API.get("/api/auth/me/");

        if (!mounted) return;

        setMe(meRes.data);

        if (meRes.data.role !== "TEACHER_APPROVED") {
          nav("/teacher/status");
          return;
        }

        try {
          const courseRes = await API.get("/api/courses/");
          if (!mounted) return;

          const courseData = getSafeArray(courseRes.data);
          setCourses(courseData);
        } catch (courseErr) {
          console.error("Failed to load courses", courseErr);
          setCourses([]);
        }
      } catch (err) {
        nav("/login");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [nav]);

  const dashboard = useMemo(() => {
    const list = getSafeArray(courses);

    const publishedCourses = list.filter(
      (c) =>
        c?.is_published === true ||
        c?.published === true ||
        c?.status === "PUBLISHED"
    );

    const draftCourses = list.length - publishedCourses.length;
    const freeCourses = list.filter((c) => Number(c?.price || 0) === 0).length;
    const paidCourses = list.length - freeCourses;

    const fullCourses = list.filter((c) => {
      const type = String(c?.course_type || "").toUpperCase();
      return type === "COURSE" || type === "FULL_COURSE";
    }).length;

    const liveSessions = list.filter((c) =>
      String(c?.course_type || "").toUpperCase().includes("LIVE")
    ).length;

    const totalRevenueEstimate = list.reduce(
      (sum, c) => sum + Number(c?.price || 0),
      0
    );

    const profileCompletion =
      (me?.username ? 20 : 0) +
      (list.length > 0 ? 25 : 0) +
      (publishedCourses.length > 0 ? 25 : 0) +
      (list.some((c) => c?.description) ? 15 : 0) +
      (list.some((c) => c?.thumbnail || c?.thumbnail_url) ? 15 : 0);

    return {
      totalCourses: list.length,
      publishedCourses: publishedCourses.length,
      draftCourses,
      freeCourses,
      paidCourses,
      fullCourses,
      liveSessions,
      totalRevenueEstimate,
      profileCompletion: Math.min(profileCompletion, 100),
      recentCourses: [...list].slice(0, 4),
    };
  }, [courses, me]);

  const nextSteps = useMemo(() => {
    const items = [];

    if (dashboard.totalCourses === 0) {
      items.push({
        title: "Create your first course",
        desc: "Start with a title, thumbnail, category, and strong description.",
      });
    }

    if (dashboard.totalCourses > 0 && dashboard.publishedCourses === 0) {
      items.push({
        title: "Publish your first course",
        desc: "Make at least one course visible so students can enroll.",
      });
    }

    if (courses.some((c) => !c?.thumbnail && !c?.thumbnail_url)) {
      items.push({
        title: "Add thumbnails",
        desc: "Courses with clean thumbnails look more professional and get more clicks.",
      });
    }

    if (courses.some((c) => !stripHtml(c?.description))) {
      items.push({
        title: "Improve course descriptions",
        desc: "Write short, clear descriptions so students understand the value quickly.",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "Keep building your academy",
        desc: "Your dashboard looks healthy. Add more lessons, resources, and assessments.",
      });
    }

    return items.slice(0, 4);
  }, [courses, dashboard]);

  const mainStats = [
    {
      title: "Total courses",
      value: dashboard.totalCourses,
      subtitle: "All courses created in your workspace",
      icon: <MenuBookRoundedIcon />,
      gradient: "linear-gradient(135deg, #ffffff 0%, #f6f1ff 100%)",
      iconBg: "rgba(124,58,237,0.10)",
      iconColor: "#6d28d9",
    },
    {
      title: "Published courses",
      value: dashboard.publishedCourses,
      subtitle: "Courses currently visible to students",
      icon: <CheckCircleRoundedIcon />,
      gradient: "linear-gradient(135deg, #ffffff 0%, #effcf3 100%)",
      iconBg: "rgba(34,197,94,0.12)",
      iconColor: "#16a34a",
    },
    {
      title: "Draft courses",
      value: dashboard.draftCourses,
      subtitle: "Still being edited before publishing",
      icon: <PendingActionsRoundedIcon />,
      gradient: "linear-gradient(135deg, #ffffff 0%, #fff8ea 100%)",
      iconBg: "rgba(245,158,11,0.12)",
      iconColor: "#d97706",
    },
    {
      title: "Catalog value",
      value: formatMoney(dashboard.totalRevenueEstimate),
      subtitle: "Estimated sum of your course prices",
      icon: <PaidRoundedIcon />,
      gradient: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
      iconBg: "rgba(59,130,246,0.12)",
      iconColor: "#2563eb",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(180deg, #fcfcff 0%, #faf7ff 45%, #f4efff 100%)",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Loading your dashboard...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 4 },
        background:
          "linear-gradient(180deg, #fcfcff 0%, #faf7ff 35%, #f3ecff 100%)",
      }}
    >
      <Box
        component={motion.div}
        sx={{
          width: "100%",
          maxWidth: "1320px",
          mx: "auto",
          px: { xs: 2, md: 3 },
        }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07 } },
        }}
        initial="hidden"
        animate="show"
      >
        {/* HERO */}
        <Paper
          component={motion.div}
          variants={fadeUp}
          elevation={0}
          sx={{
            p: { xs: 2.2, md: 3 },
            mb: 3,
            borderRadius: 1,
            border: "1px solid rgba(226,232,255,0.92)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,243,255,0.98) 100%)",
            boxShadow: "0 24px 60px rgba(124,58,237,0.08)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: -90,
              top: -90,
              width: 230,
              height: 230,
              borderRadius: "50%",
              background: "rgba(124,58,237,0.08)",
              filter: "blur(10px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 140,
              bottom: -70,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.08)",
              filter: "blur(10px)",
            }}
          />

          <Grid
            container
            spacing={2.5}
            alignItems="center"
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Grid item xs={12} lg={8.5}>
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
                    label="Instructor workspace"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: "rgba(124,58,237,0.10)",
                      color: "#6d28d9",
                    }}
                  />

                  <Chip
                    icon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
                    label="Teacher approved"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: "rgba(34,197,94,0.10)",
                      color: "#15803d",
                    }}
                  />
                </Stack>

                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "2rem", md: "3rem" },
                      fontWeight: 900,
                      letterSpacing: "-0.05em",
                      lineHeight: 1.03,
                      mb: 1.3,
                    }}
                  >
                    Welcome back, {me?.username || "Instructor"} 👋
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      maxWidth: 720,
                      fontSize: { xs: "0.98rem", md: "1.05rem" },
                      lineHeight: 1.75,
                    }}
                  >
                    Manage your courses, track publishing progress, organize live sessions,
                    and grow your learning platform from one clean dashboard.
                  </Typography>
                </Box>

                <Alert
                  severity="success"
                  sx={{
                    mt: 0.8,
                    borderRadius: 3,
                    bgcolor: "rgba(34,197,94,0.06)",
                    border: "1px solid rgba(34,197,94,0.18)",
                    width: "fit-content",
                    maxWidth: "100%",
                    pr: 3,
                    "& .MuiAlert-message": {
                      fontWeight: 500,
                    },
                  }}
                >
                  Your instructor account is active. You can now create, publish, and manage your content.
                </Alert>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={3.5}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1, // smaller radius
                  border: "1px solid rgba(226,232,255,0.92)",
                  backgroundColor: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 12px 30px rgba(148,163,184,0.07)",
                  maxWidth: 360, // keep it smaller
                  ml: { xs: 0, lg: "auto" }, // push to right side on desktop
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: 1.4, fontWeight: 700 }}
                >
                  Dashboard progress
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{ mt: 0.6, mb: 0.7, letterSpacing: "-0.04em" }}
                >
                  {dashboard.profileCompletion}% ready
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1.5, lineHeight: 1.6 }}
                >
                  Keep improving your profile, content, and publishing flow to complete your instructor setup.
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={dashboard.profileCompletion}
                  sx={{
                    height: 9,
                    borderRadius: 999,
                    bgcolor: "rgba(124,58,237,0.10)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      background: "linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)",
                    },
                  }}
                />

                <Stack spacing={1.1} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<RocketLaunchRoundedIcon />}
                    onClick={() => nav("/instructor/courses/new")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      py: 1.15,
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                      boxShadow: "0 16px 34px rgba(99,102,241,0.28)",
                    }}
                  >
                    Create a new course
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<VisibilityRoundedIcon />}
                    onClick={() => nav("/instructor/courses")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      py: 1.05,
                      fontWeight: 800,
                      borderColor: "rgba(124,58,237,0.24)",
                      color: "#6d28d9",
                    }}
                  >
                    View all courses
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

        {/* TOP STATS */}
        <Grid container spacing={2.2} sx={{ mb: 3 }}>
          {mainStats.map((item, index) => (
            <Grid item xs={12} sm={6} xl={3} key={index}>
              <motion.div variants={fadeUp} style={{ height: "100%" }}>
                <StatCard {...item} />
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* MAIN CONTENT */}
        <Stack spacing={2.2}>
          {/* Recent courses - full width */}
          <motion.div variants={fadeUp}>
            <SectionCard
              title="Recent courses"
              subtitle="A quick view of the latest courses in your teaching workspace."
              action={
                <Button
                  variant="text"
                  endIcon={<ArrowOutwardRoundedIcon />}
                  onClick={() => nav("/instructor/courses")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    fontWeight: 800,
                    color: "#6d28d9",
                  }}
                >
                  Manage courses
                </Button>
              }
            >
              {dashboard.recentCourses.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3.5,
                    borderRadius: 1,
                    textAlign: "center",
                    border: "1px dashed rgba(148,163,184,0.35)",
                    background:
                      "linear-gradient(180deg, rgba(250,247,255,0.85) 0%, rgba(255,255,255,1) 100%)",
                  }}
                >
                  <Box
                    sx={{
                      width: 68,
                      height: 68,
                      mx: "auto",
                      mb: 1.6,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(124,58,237,0.08)",
                      color: "#6d28d9",
                    }}
                  >
                    <SchoolRoundedIcon sx={{ fontSize: 30 }} />
                  </Box>

                  <Typography fontWeight={900} sx={{ mb: 0.8 }}>
                    No courses yet
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb: 2.2, maxWidth: 560, mx: "auto" }}>
                    Create your first course to start building a professional teaching platform.
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => nav("/instructor/courses/new")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      px: 3,
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                    }}
                  >
                    Create your first course
                  </Button>
                </Paper>
              ) : (
                <Stack spacing={1.5}>
                  {dashboard.recentCourses.map((course, index) => (
                    <CourseRow key={course?.id || index} course={course} nav={nav} />
                  ))}
                </Stack>
              )}
            </SectionCard>
          </motion.div>

          {/* Recommended next steps - full width */}
          <motion.div variants={fadeUp}>
            <SectionCard
              title="Recommended next steps"
              subtitle="Small improvements that make your dashboard and course catalog feel more complete."
              sx={{
                width: "100%",
              }}
            >
              <Stack spacing={1.7}>
                {nextSteps.map((step, index) => (
                  <Box key={index}>
                    <Stack direction="row" spacing={1.2} alignItems="flex-start">
                      <Box
                        sx={{
                          mt: 0.2,
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 900,
                          fontSize: "0.83rem",
                          bgcolor: "rgba(124,58,237,0.10)",
                          color: "#6d28d9",
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </Box>

                      <Box>
                        <Typography fontWeight={800} sx={{ mb: 0.35 }}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {step.desc}
                        </Typography>
                      </Box>
                    </Stack>

                    {index !== nextSteps.length - 1 && <Divider sx={{ mt: 1.7 }} />}
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ my: 2.2 }} />

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => nav("/instructor/courses/new")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    fontWeight: 800,
                  }}
                >
                  New course
                </Button>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => nav("/instructor/courses")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    fontWeight: 800,
                    color: "#6d28d9",
                  }}
                >
                  Course manager
                </Button>
              </Stack>
            </SectionCard>
          </motion.div>

          {/* Catalog breakdown - full width */}
          <motion.div variants={fadeUp}>
            <SectionCard
              title="Catalog breakdown"
              sx={{
                width: "100%",
              }}
            >
              <Stack spacing={2} sx={{ width: "100%" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <CategoryRoundedIcon sx={{ color: "#6d28d9", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700}>
                      Course products
                    </Typography>
                  </Stack>
                  <Typography fontWeight={900}>{dashboard.fullCourses}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <OndemandVideoRoundedIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700}>
                      Live sessions
                    </Typography>
                  </Stack>
                  <Typography fontWeight={900}>{dashboard.liveSessions}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <BoltRoundedIcon sx={{ color: "#0891b2", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700}>
                      Free courses
                    </Typography>
                  </Stack>
                  <Typography fontWeight={900}>{dashboard.freeCourses}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <PaidRoundedIcon sx={{ color: "#16a34a", fontSize: 20 }} />
                    <Typography variant="body2" fontWeight={700}>
                      Paid courses
                    </Typography>
                  </Stack>
                  <Typography fontWeight={900}>{dashboard.paidCourses}</Typography>
                </Stack>
              </Stack>
            </SectionCard>
          </motion.div>

          {/* Growth panel - full width */}
          <motion.div variants={fadeUp}>
            <SectionCard
              title="Growth panel"
              sx={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(245,243,255,0.98) 100%)",
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.2, lineHeight: 1.7 }}>
                Once you connect enrollments, assignments, quizzes, and student activity,
                this area can show live platform analytics.
              </Typography>

              <Stack spacing={1.35}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TrendingUpRoundedIcon sx={{ fontSize: 18, color: "#6d28d9" }} />
                    <Typography variant="body2" color="text.secondary">
                      Student analytics
                    </Typography>
                  </Stack>
                  <Chip
                    label="Coming soon"
                    size="small"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: "rgba(124,58,237,0.10)",
                      color: "#6d28d9",
                    }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TrendingUpRoundedIcon sx={{ fontSize: 18, color: "#2563eb" }} />
                    <Typography variant="body2" color="text.secondary">
                      Revenue insights
                    </Typography>
                  </Stack>
                  <Chip
                    label="Coming soon"
                    size="small"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: "rgba(124,58,237,0.10)",
                      color: "#6d28d9",
                    }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TrendingUpRoundedIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                    <Typography variant="body2" color="text.secondary">
                      Engagement trends
                    </Typography>
                  </Stack>
                  <Chip
                    label="Coming soon"
                    size="small"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: "rgba(124,58,237,0.10)",
                      color: "#6d28d9",
                    }}
                  />
                </Stack>
              </Stack>
            </SectionCard>
          </motion.div>
        </Stack>
      </Box>
    </Box>
  );
}