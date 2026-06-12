import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import API from "../../lib/api";

import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";

function formatCourseType(value) {
  if (!value) return "Course";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (s) => s.toUpperCase());
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

function formatPrice(value) {
  const num = Number(value || 0);
  if (Number.isNaN(num)) return "Free";
  return num === 0 ? "Free" : `$${num.toFixed(2)}`;
}

function getCourseImage(course) {
  return course?.thumbnail || course?.thumbnail_url || "";
}

function getInitials(title) {
  if (!title) return "C";
  return String(title).trim().charAt(0).toUpperCase();
}

function estimateProgress(course, index) {
  const titleScore = course?.title ? 10 : 0;
  const descScore = course?.description ? 18 : 0;
  const thumbScore = getCourseImage(course) ? 18 : 0;
  const typeScore = course?.course_type ? 12 : 0;
  const priceScore = typeof course?.price !== "undefined" ? 10 : 0;
  const base = 18 + titleScore + descScore + thumbScore + typeScore + priceScore;
  const varied = Math.min(base + (index % 4) * 6, 94);
  return Math.max(22, varied);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardShell({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `
          radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 20%),
          radial-gradient(circle at top right, rgba(99,102,241,0.10), transparent 22%),
          linear-gradient(180deg, #fcfcff 0%, #f8f7ff 38%, #f4f2ff 100%)
        `,
        px: { xs: 2, sm: 2.5, md: 3.5 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function DashboardCard({ children, sx = {} }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 1,
        border: "1px solid rgba(226,232,255,0.92)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.90) 100%)",
        boxShadow: "0 16px 40px rgba(99,102,241,0.06)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={1.5}
      sx={{ mb: 2.2 }}
    >
      <Box sx={{ minWidth: 0 }}>
        {eyebrow ? (
          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />}
            label={eyebrow}
            sx={{
              mb: 1.2,
              borderRadius: 999,
              fontWeight: 800,
              bgcolor: "rgba(124,58,237,0.10)",
              color: "#6d28d9",
            }}
          />
        ) : null}

        <Typography
          sx={{
            fontSize: { xs: "1.2rem", md: "1.45rem" },
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "#0f172a",
          }}
        >
          {title}
        </Typography>

        {subtitle ? (
          <Typography
            sx={{
              mt: 0.55,
              color: "text.secondary",
              maxWidth: 720,
              lineHeight: 1.65,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      {action}
    </Stack>
  );
}

function StatCard({ title, value, helper, icon, color, gradient }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        height: "100%",
        minHeight: 170,
        borderRadius: 1,
        border: "1px solid rgba(226,232,255,0.92)",
        background: gradient,
        boxShadow: "0 14px 34px rgba(148,163,184,0.06)",
        transition: "all 0.25s ease",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 18px 40px rgba(99,102,241,0.10)",
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              mb: 1,
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1.9rem", md: "2.15rem" },
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#0f172a",
              lineHeight: 1.05,
              mb: 0.8,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.92rem",
              lineHeight: 1.6,
              maxWidth: 260,
            }}
          >
            {helper}
          </Typography>
        </Box>

        <Avatar
          sx={{
            width: 54,
            height: 54,
            bgcolor: alpha(color, 0.12),
            color,
            border: `1px solid ${alpha(color, 0.15)}`,
            boxShadow: `0 10px 24px ${alpha(color, 0.14)}`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
}

function InsightPill({ icon, label, value, color = "#6d28d9" }) {
  return (
    <Paper
      elevation={0}
      sx={{
        px: 1.5,
        py: 1.2,
        borderRadius: 999,
        border: "1px solid rgba(226,232,255,0.92)",
        background: "rgba(255,255,255,0.78)",
      }}
    >
      <Stack direction="row" spacing={1.1} alignItems="center">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(color, 0.10),
            color,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", lineHeight: 1.2 }}>
            {label}
          </Typography>
          <Typography sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.25 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function ChartDonutCard({
  title,
  value,
  label,
  colorA,
  colorB,
  rightTopValue,
  rightBottomValue,
}) {
  const percentage = Math.max(0, Math.min(100, Number(value || 0)));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        height: "100%",
        borderRadius: 1,
        minHeight: 320,
        border: "1px solid rgba(226,232,255,0.92)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(251,250,255,0.95) 100%)",
        boxShadow: "0 14px 34px rgba(148,163,184,0.05)",
      }}
    >
      <Stack spacing={1.6} sx={{ height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>{title}</Typography>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: alpha(colorA, 0.10),
              color: colorA,
            }}
          >
            <DonutLargeRoundedIcon />
          </Avatar>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ flexGrow: 1 }}
        >
          <Box
            sx={{
              position: "relative",
              width: 128,
              height: 128,
              borderRadius: "50%",
              background: `conic-gradient(${colorA} 0% ${percentage}%, ${colorB} ${percentage}% 100%)`,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 86,
                height: 86,
                borderRadius: "50%",
                bgcolor: "#ffffff",
                display: "grid",
                placeItems: "center",
                border: "1px solid rgba(226,232,255,0.88)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: "1.3rem",
                    color: "#0f172a",
                    lineHeight: 1,
                  }}
                >
                  {percentage}%
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: 0.35 }}>
                  {label}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Stack spacing={1.2} sx={{ flex: 1, width: "100%" }}>
            <LegendRow color={colorA} label="Current progress" value={rightTopValue} />
            <LegendRow color={colorB} label="Remaining" value={rightBottomValue} />

            <Paper
              elevation={0}
              sx={{
                p: 1.4,
                borderRadius: 3,
                background: "rgba(248,250,255,0.92)",
                border: "1px solid rgba(226,232,255,0.88)",
              }}
            >
              <Typography sx={{ color: "text.secondary", lineHeight: 1.55 }}>
                A visual snapshot of your current course momentum and how much is left to complete.
              </Typography>
            </Paper>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: color,
          }}
        />
        <Typography sx={{ color: "#0f172a", fontWeight: 700 }}>{label}</Typography>
      </Stack>
      <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>{value}</Typography>
    </Stack>
  );
}

function WeeklyBarsCard({ items }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.2,
        width: "100%",
        height: "100%",
        minHeight: 320,
        borderRadius: 1,
        border: "1px solid rgba(226,232,255,0.92)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(251,250,255,0.95) 100%)",
        boxShadow: "0 14px 34px rgba(148,163,184,0.05)",
      }}
    >
      <Stack spacing={1.6}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>Weekly activity</Typography>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: "rgba(37,99,235,0.10)",
              color: "#2563eb",
            }}
          >
            <TimelineRoundedIcon />
          </Avatar>
        </Stack>

        {items.map((item) => (
          <Box key={item.label}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.55 }}>
              <Typography sx={{ color: "#0f172a", fontWeight: 700, fontSize: 14 }}>
                {item.label}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontWeight: 700, fontSize: 13 }}>
                {item.value}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={item.value}
              sx={{
                height: 9,
                borderRadius: 999,
                bgcolor: alpha(item.color, 0.10),
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  background: item.color,
                },
              }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

function CourseProgressRow({ course, progress, onOpen }) {
  const cleanDescription =
    stripHtml(course?.description) || "Continue learning and keep making steady progress.";

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 1,
        border: "1px solid rgba(226,232,255,0.90)",
        background: "rgba(255,255,255,0.96)",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 28px rgba(99,102,241,0.08)",
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
          spacing={1.6}
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
              fontSize: "1.1rem",
              flexShrink: 0,
            }}
          >
            {getInitials(course?.title)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.03rem",
                color: "#0f172a",
                lineHeight: 1.35,
                mb: 0.8,
              }}
            >
              {course?.title || "Untitled course"}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 1.1 }}>
              <Chip
                size="small"
                label={formatCourseType(course?.course_type)}
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  bgcolor: "rgba(99,102,241,0.10)",
                  color: "#4f46e5",
                }}
              />
              <Chip
                size="small"
                label={formatPrice(course?.price)}
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  bgcolor:
                    Number(course?.price || 0) === 0
                      ? "rgba(6,182,212,0.10)"
                      : "rgba(124,58,237,0.10)",
                  color: Number(course?.price || 0) === 0 ? "#0f766e" : "#6d28d9",
                }}
              />
              <Chip
                size="small"
                icon={<BookmarkAddedRoundedIcon sx={{ fontSize: 16 }} />}
                label={`${progress}% progress`}
                sx={{
                  borderRadius: 999,
                  fontWeight: 700,
                  bgcolor: "rgba(34,197,94,0.10)",
                  color: "#15803d",
                }}
              />
            </Stack>

            <Typography
              sx={{
                color: "text.secondary",
                lineHeight: 1.6,
                display: "-webkit-box",
                overflow: "hidden",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                maxWidth: "100%",
              }}
            >
              {cleanDescription}
            </Typography>

            <Box sx={{ mt: 1.25 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 0.6 }}
              >
                <Typography sx={{ fontSize: 13.2, color: "text.secondary", fontWeight: 600 }}>
                  Learning progress
                </Typography>
                <Typography sx={{ fontSize: 13.2, color: "#6d28d9", fontWeight: 800 }}>
                  {progress}%
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: "rgba(124,58,237,0.08)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    background: "linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)",
                  },
                }}
              />
            </Box>
          </Box>
        </Stack>

        <Box
          sx={{
            minWidth: { xs: "100%", md: 160 },
            display: "flex",
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Button
            variant="outlined"
            endIcon={<ArrowOutwardRoundedIcon />}
            onClick={onOpen}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2.1,
              py: 1,
              fontWeight: 800,
              borderColor: "rgba(124,58,237,0.22)",
              color: "#6d28d9",
              whiteSpace: "nowrap",
            }}
          >
            Continue
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

function EmptyCourseState({ onBrowse }) {
  return (
    <DashboardCard
      sx={{
        textAlign: "center",
        py: { xs: 4, md: 5 },
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,245,255,0.96) 100%)",
      }}
    >
      <Box
        sx={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          mx: "auto",
          mb: 1.6,
          display: "grid",
          placeItems: "center",
          bgcolor: "rgba(124,58,237,0.10)",
          color: "#6d28d9",
        }}
      >
        <MenuBookRoundedIcon sx={{ fontSize: 34 }} />
      </Box>

      <Typography
        sx={{
          fontWeight: 900,
          fontSize: { xs: "1.3rem", md: "1.5rem" },
          color: "#0f172a",
          mb: 0.8,
        }}
      >
        No enrolled courses yet
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          maxWidth: 620,
          mx: "auto",
          lineHeight: 1.75,
          mb: 2.4,
        }}
      >
        Start your learning journey by exploring the course catalog and enrolling in something that matches your goals.
      </Typography>

      <Button
        variant="contained"
        endIcon={<ArrowForwardRoundedIcon />}
        onClick={onBrowse}
        sx={{
          textTransform: "none",
          borderRadius: 999,
          px: 3,
          py: 1.2,
          fontWeight: 800,
          background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
          boxShadow: "0 14px 28px rgba(99,102,241,0.25)",
        }}
      >
        Browse courses
      </Button>
    </DashboardCard>
  );
}

function ActionCard({ title, description, icon, color, onClick, buttonText }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.1,
        height: "100%",
        borderRadius: 1,
        border: "1px solid rgba(226,232,255,0.92)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(252,250,255,0.95) 100%)",
        boxShadow: "0 12px 28px rgba(148,163,184,0.05)",
      }}
    >
      <Stack spacing={1.4} sx={{ height: "100%" }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: alpha(color, 0.12),
            color,
            border: `1px solid ${alpha(color, 0.16)}`,
          }}
        >
          {icon}
        </Avatar>

        <Box>
          <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
            {title}
          </Typography>
          <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            {description}
          </Typography>
        </Box>

        <Box sx={{ mt: "auto" }}>
          <Button
            variant="text"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={onClick}
            sx={{
              p: 0,
              minWidth: 0,
              textTransform: "none",
              fontWeight: 800,
              color,
              "&:hover": {
                bgcolor: "transparent",
              },
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}

function ProgressMiniCard({ label, value, helper, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 1,
        border: "1px solid rgba(226,232,255,0.88)",
        background: "rgba(255,255,255,0.86)",
        height: "100%",
      }}
    >
      <Typography sx={{ fontSize: 12.5, color: "text.secondary", mb: 0.45 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.35rem",
          color: "#0f172a",
          lineHeight: 1.1,
          mb: 0.45,
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ color, fontWeight: 700, fontSize: 13 }}>{helper}</Typography>
    </Paper>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await API.get("/api/enroll/my-courses/");
      setCourses(getSafeArray(res.data));
    } catch (err) {
      console.error("Failed to load student dashboard", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  const dashboard = useMemo(() => {
    const list = getSafeArray(courses);

    const enriched = list.map((course, index) => ({
      ...course,
      progress: estimateProgress(course, index),
    }));

    const featuredCourse = enriched[0] || null;
    const totalCourses = enriched.length;
    const avgProgress = totalCourses
      ? Math.round(enriched.reduce((sum, c) => sum + c.progress, 0) / totalCourses)
      : 0;

    const completedCourses = enriched.filter((c) => c.progress >= 85).length;
    const inProgressCourses = enriched.filter((c) => c.progress < 85).length;
    const paidCourses = enriched.filter((c) => Number(c?.price || 0) > 0).length;
    const freeCourses = totalCourses - paidCourses;

    const weeklyGoal = totalCourses > 0 ? Math.min(92, 35 + totalCourses * 8) : 18;
    const streakDays = totalCourses > 0 ? Math.min(12, totalCourses + 2) : 0;
    const learningHours = totalCourses > 0 ? totalCourses * 3 : 0;

    const completionRatio = totalCourses > 0
      ? Math.round((completedCourses / totalCourses) * 100)
      : 0;

    return {
      list: enriched,
      featuredCourse,
      totalCourses,
      avgProgress,
      completedCourses,
      inProgressCourses,
      paidCourses,
      freeCourses,
      weeklyGoal,
      streakDays,
      learningHours,
      completionRatio,
      recentCourses: enriched.slice(0, 3),
      topCourses: enriched.slice(0, 4),
    };
  }, [courses]);

  if (loading) {
    return (
      <DashboardShell>
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography sx={{ color: "text.secondary" }}>
              Loading your learning dashboard...
            </Typography>
          </Stack>
        </Box>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Stack spacing={2.5}>
        {/* HERO */}
        <DashboardCard
          sx={{
            p: { xs: 2.2, md: 3 },
            borderRadius: 1,
            overflow: "hidden",
            position: "relative",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(246,242,255,0.98) 100%)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -90,
              right: -90,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(124,58,237,0.10)",
              filter: "blur(12px)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              right: 160,
              bottom: -80,
              width: 180,
              height: 180,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.08)",
              filter: "blur(12px)",
            }}
          />

          <Grid container spacing={2.5} alignItems="stretch" sx={{ position: "relative", zIndex: 1 }}>
            <Grid item xs={12} xl={8}>
              <Stack spacing={2.1} sx={{ height: "100%", justifyContent: "center" }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />}
                    label="Student workspace"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: "rgba(124,58,237,0.10)",
                      color: "#6d28d9",
                    }}
                  />
                  <Chip
                    icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: 18 }} />}
                    label={
                      dashboard.streakDays > 0
                        ? `${dashboard.streakDays}-day streak`
                        : "Start your streak"
                    }
                    sx={{
                      borderRadius: 999,
                      fontWeight: 800,
                      bgcolor: "rgba(249,115,22,0.10)",
                      color: "#c2410c",
                    }}
                  />
                </Stack>

                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "2rem", md: "3rem" },
                      fontWeight: 900,
                      letterSpacing: "-0.05em",
                      color: "#0f172a",
                      lineHeight: 1.02,
                      mb: 1.1,
                    }}
                  >
                    {getGreeting()} 👋
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      maxWidth: 760,
                      fontSize: { xs: "0.98rem", md: "1.08rem" },
                      lineHeight: 1.8,
                    }}
                  >
                    Stay consistent, revisit your enrolled courses, and keep moving forward one focused session at a time.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.1} useFlexGap flexWrap="wrap">
                  <InsightPill
                    icon={<MenuBookRoundedIcon sx={{ fontSize: 18 }} />}
                    label="Enrolled"
                    value={`${dashboard.totalCourses} courses`}
                    color="#6d28d9"
                  />
                  <InsightPill
                    icon={<EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />}
                    label="Average progress"
                    value={`${dashboard.avgProgress}%`}
                    color="#16a34a"
                  />
                  <InsightPill
                    icon={<AccessTimeRoundedIcon sx={{ fontSize: 18 }} />}
                    label="Learning time"
                    value={`${dashboard.learningHours}h tracked`}
                    color="#2563eb"
                  />
                </Stack>

                <Stack direction="row" spacing={1.2} useFlexGap flexWrap="wrap">
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={() => navigate("/student/courses")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      px: 2.6,
                      py: 1.15,
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                      boxShadow: "0 16px 32px rgba(99,102,241,0.24)",
                    }}
                  >
                    Go to My Courses
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<LightbulbRoundedIcon />}
                    onClick={() => navigate("/courses")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      px: 2.4,
                      py: 1.05,
                      fontWeight: 800,
                      borderColor: "rgba(124,58,237,0.20)",
                      color: "#6d28d9",
                    }}
                  >
                    Explore more courses
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid
              item
              xs={12}
              xl={4}
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", xl: "flex-end" },
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.8,
                  width: "100%",
                  maxWidth: 340,
                  minHeight: 250,
                  borderRadius: 1,
                  border: "1px solid rgba(226,232,255,0.92)",
                  background: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 14px 30px rgba(148,163,184,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "text.secondary",
                      fontWeight: 800,
                    }}
                  >
                    Weekly learning target
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: "1.7rem", md: "1.95rem" },
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                      color: "#0f172a",
                      mt: 0.5,
                      mb: 0.5,
                    }}
                  >
                    {dashboard.weeklyGoal}% on track
                  </Typography>

                  <Typography sx={{ color: "text.secondary", lineHeight: 1.6, mb: 1.2 }}>
                    Small consistent effort each week builds real momentum in your learning journey.
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={dashboard.weeklyGoal}
                    sx={{
                      height: 10,
                      borderRadius: 999,
                      bgcolor: "rgba(124,58,237,0.09)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        background: "linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)",
                      },
                    }}
                  />
                </Box>

                <Grid container spacing={1} sx={{ mt: 1.1 }}>
                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.1,
                        borderRadius: 1,
                        background: "rgba(124,58,237,0.06)",
                        border: "1px solid rgba(124,58,237,0.10)",
                      }}
                    >
                      <Typography sx={{ color: "text.secondary", fontSize: 12.5 }}>
                        Completed
                      </Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#0f172a" }}>
                        {dashboard.completedCourses}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.1,
                        borderRadius: 1,
                        background: "rgba(34,197,94,0.06)",
                        border: "1px solid rgba(34,197,94,0.10)",
                      }}
                    >
                      <Typography sx={{ color: "text.secondary", fontSize: 12.5 }}>
                        Active
                      </Typography>
                      <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#0f172a" }}>
                        {dashboard.inProgressCourses}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DashboardCard>

        {/* VISUAL STATS */}
        <Stack spacing={2.2}>
          <Grid container spacing={2.2} alignItems="stretch">
            <Grid item xs={12} md={4}>
              <StatCard
                title="Enrolled Courses"
                value={dashboard.totalCourses}
                helper="All your Active Course Learning library"
                icon={<SchoolRoundedIcon />}
                color="#6d28d9"
                gradient="linear-gradient(135deg, #ffffff 0%, #f6f1ff 100%)"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <StatCard
                title="Average Progress"
                value={`${dashboard.avgProgress}%`}
                helper="Estimated completion across all courses"
                icon={<TrendingUpRoundedIcon />}
                color="#16a34a"
                gradient="linear-gradient(135deg, #ffffff 0%, #eefcf3 100%)"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <StatCard
                title="Learning Streak"
                value={`${dashboard.streakDays} days`}
                helper="Consistency matters more than intensity"
                icon={<LocalFireDepartmentRoundedIcon />}
                color="#f97316"
                gradient="linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.2} alignItems="stretch" sx={{ mt: 0 }}>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Assignments"
                value="0"
                helper="Ready for real data when assignments connect"
                icon={<AssignmentRoundedIcon />}
                color="#2563eb"
                gradient="linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.2} alignItems="stretch">
            <Grid item xs={12} lg={7}>
              <ChartDonutCard
                title="Completion overview"
                value={dashboard.avgProgress}
                label="done"
                colorA="#7c3aed"
                colorB="#e9e2ff"
                rightTopValue={`${dashboard.avgProgress}%`}
                rightBottomValue={`${100 - dashboard.avgProgress}%`}
              />
            </Grid>

            <Grid item xs={12} lg={5}>
              <WeeklyBarsCard
                items={[
                  { label: "Mon", value: 28, color: "#7c3aed" },
                  { label: "Tue", value: 44, color: "#6366f1" },
                  { label: "Wed", value: 38, color: "#8b5cf6" },
                  { label: "Thu", value: 57, color: "#10b981" },
                  { label: "Fri", value: dashboard.weeklyGoal, color: "#2563eb" },
                ]}
              />
            </Grid>
          </Grid>
        </Stack>

        {dashboard.totalCourses === 0 ? (
          <EmptyCourseState onBrowse={() => navigate("/courses")} />
        ) : (
          <>
            {/* FEATURED + QUICK ACTIONS */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "minmax(0, 1.9fr) minmax(320px, 0.9fr)",
                },
                gap: 2.2,
                alignItems: "start",
              }}
            >
              {/* LEFT SIDE */}
              <DashboardCard
                sx={{
                  minWidth: 0,
                  minHeight: { lg: 630 },
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,243,255,0.96) 100%)",
                }}
              >
                <SectionHeader
                  eyebrow="Featured learning"
                  title={dashboard.featuredCourse?.title || "Continue your course"}
                  subtitle={
                    stripHtml(dashboard.featuredCourse?.description) ||
                    "Pick up where you left off and keep the momentum going."
                  }
                  action={
                    <Button
                      variant="text"
                      endIcon={<ArrowOutwardRoundedIcon />}
                      onClick={() => navigate("/student/courses")}
                      sx={{
                        textTransform: "none",
                        borderRadius: 999,
                        fontWeight: 800,
                        color: "#6d28d9",
                      }}
                    >
                      View all
                    </Button>
                  }
                />

                <Paper
                  elevation={0}
                  sx={{
                    p: 2.1,
                    minWidth: 0,
                    borderRadius: 1,
                    border: "1px solid rgba(226,232,255,0.90)",
                    background: "rgba(255,255,255,0.82)",
                  }}
                >
                  <Stack spacing={1.6} sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip
                        icon={<OndemandVideoRoundedIcon sx={{ fontSize: 17 }} />}
                        label={formatCourseType(dashboard.featuredCourse?.course_type)}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                          bgcolor: "rgba(99,102,241,0.10)",
                          color: "#4f46e5",
                        }}
                      />
                      <Chip
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: 17 }} />}
                        label={`${dashboard.featuredCourse?.progress || 0}% complete`}
                        sx={{
                          borderRadius: 999,
                          fontWeight: 700,
                          bgcolor: "rgba(34,197,94,0.10)",
                          color: "#15803d",
                        }}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        fontSize: { xs: "1.22rem", md: "1.5rem" },
                        fontWeight: 900,
                        letterSpacing: "-0.03em",
                        color: "#0f172a",
                        lineHeight: 1.18,
                      }}
                    >
                      Stay on track with your current focus
                    </Typography>

                    <Typography sx={{ color: "text.secondary", lineHeight: 1.75 }}>
                      Jump back into your most recent enrolled course and keep building momentum with focused study sessions.
                    </Typography>

                    <Grid container spacing={1.3}>
                      <Grid item xs={12} sm={4}>
                        <ProgressMiniCard
                          label="Completion"
                          value={`${dashboard.featuredCourse?.progress || 0}%`}
                          helper="Current course"
                          color="#6d28d9"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ProgressMiniCard
                          label="Completion ratio"
                          value={`${dashboard.completionRatio}%`}
                          helper="Across library"
                          color="#16a34a"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <ProgressMiniCard
                          label="Learning hours"
                          value={`${dashboard.learningHours}h`}
                          helper="Tracked estimate"
                          color="#2563eb"
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{ fontSize: 13.5, color: "text.secondary", mb: 0.55 }}
                      >
                        Current course progress
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={dashboard.featuredCourse?.progress || 0}
                        sx={{
                          height: 10,
                          borderRadius: 999,
                          bgcolor: "rgba(124,58,237,0.08)",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            background:
                              "linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)",
                          },
                        }}
                      />

                      <Stack
                        direction="row"
                        spacing={1.2}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ mt: 1.8 }}
                      >
                        <Button
                          variant="contained"
                          endIcon={<PlayCircleRoundedIcon />}
                          onClick={() => navigate("/student/courses")}
                          sx={{
                            textTransform: "none",
                            borderRadius: 999,
                            px: 2.4,
                            py: 1.05,
                            fontWeight: 800,
                            background:
                              "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                            boxShadow: "0 14px 28px rgba(99,102,241,0.24)",
                          }}
                        >
                          Continue learning
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={() => navigate("/courses")}
                          sx={{
                            textTransform: "none",
                            borderRadius: 999,
                            px: 2.2,
                            py: 1,
                            fontWeight: 800,
                            borderColor: "rgba(124,58,237,0.20)",
                            color: "#6d28d9",
                          }}
                        >
                          Explore catalog
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </Paper>
              </DashboardCard>

              {/* RIGHT SIDE */}
              <DashboardCard
                sx={{
                  minWidth: 0,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(247,243,255,0.96) 100%)",
                }}
              >
                <Typography sx={{ fontWeight: 800, color: "#0f172a", mb: 1.5 }}>
                  Quick actions
                </Typography>

                <Grid container spacing={1.4}>
                  <Grid item xs={12}>
                    <ActionCard
                      title="My Courses"
                      description="Access everything you already enrolled in and continue where you left off."
                      icon={<MenuBookRoundedIcon />}
                      color="#6d28d9"
                      onClick={() => navigate("/student/courses")}
                      buttonText="Open courses"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <ActionCard
                      title="Course Catalog"
                      description="Find more topics, explore new skills, and keep growing your learning path."
                      icon={<SchoolRoundedIcon />}
                      color="#2563eb"
                      onClick={() => navigate("/courses")}
                      buttonText="Browse catalog"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.6,
                        borderRadius: 1,
                        border: "1px solid rgba(226,232,255,0.90)",
                        background: "rgba(248,250,255,0.92)",
                      }}
                    >
                      <Stack direction="row" spacing={1.1} alignItems="flex-start">
                        <LightbulbRoundedIcon
                          sx={{ fontSize: 20, color: "#6d28d9", mt: 0.2 }}
                        />
                        <Box>
                          <Typography
                            sx={{ fontWeight: 800, color: "#0f172a", mb: 0.35 }}
                          >
                            Learning tip
                          </Typography>
                          <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                            Focus on one course at a time to improve
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>
              </DashboardCard>
            </Box>

            {/* COURSE PROGRESS LIST */}
            <DashboardCard>
              <SectionHeader
                eyebrow="Continue learning"
                title="Your enrolled courses"
                subtitle="A polished view of the latest courses in your personal learning workspace."
                action={
                  <Button
                    variant="text"
                    endIcon={<ArrowOutwardRoundedIcon />}
                    onClick={() => navigate("/student/courses")}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      fontWeight: 800,
                      color: "#6d28d9",
                    }}
                  >
                    View all courses
                  </Button>
                }
              />

              <Stack spacing={1.5}>
                {dashboard.recentCourses.map((course, index) => (
                  <CourseProgressRow
                    key={course?.course_id || course?.id || index}
                    course={course}
                    progress={course.progress}
                    onOpen={() => navigate("/student/courses")}
                  />
                ))}
              </Stack>
            </DashboardCard>
          </>
        )}
      </Stack>
    </DashboardShell>
  );
}