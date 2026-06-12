import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../lib/api";

import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";


function stripHtml(html) {
  if (!html) return "";

  return String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function StudentEnrolledCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const { data } = await API.get("/api/enroll/my-courses/");
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to load enrolled courses", err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const uniqueTeachers = new Set(
      courses.map((course) => course.teacher_name).filter(Boolean)
    ).size;

    return {
      totalCourses,
      uniqueTeachers,
    };
  }, [courses]);

  const getInitials = (title = "") => {
    if (!title) return "C";
    return title.trim().charAt(0).toUpperCase();
  };

  const getGradientByIndex = (index) => {
    const gradients = [
      "linear-gradient(135deg, #6d61d2 0%, #8b7cf6 100%)",
      "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
      "linear-gradient(135deg, #5b5bd6 0%, #6d61d2 100%)",
      "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    ];
    return gradients[index % gradients.length];
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "72vh",
          display: "grid",
          placeItems: "center",
          px: 2,
          background:
            "radial-gradient(circle at top left, rgba(109,97,210,0.10), transparent 24%), linear-gradient(180deg, #fcfcff 0%, #f8fafc 100%)",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress sx={{ color: "#6d61d2" }} thickness={4} />
          <Typography color="text.secondary" fontWeight={500}>
            Loading your courses...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (courses.length === 0) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          py: 6,
          px: 2,
          background:
            "radial-gradient(circle at top left, rgba(109,97,210,0.08), transparent 24%), radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 22%), linear-gradient(180deg, #fbfbff 0%, #f8fafc 100%)",
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              textAlign: "center",
              borderRadius: "32px",
              px: { xs: 3, md: 6 },
              py: { xs: 5, md: 7 },
              border: "1px solid rgba(255,255,255,0.7)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.64) 100%)",
              backdropFilter: "blur(18px)",
              boxShadow:
                "0 20px 60px rgba(15, 23, 42, 0.06), 0 10px 30px rgba(109,97,210,0.08)",
            }}
          >
            <Avatar
              sx={{
                width: 74,
                height: 74,
                mx: "auto",
                mb: 2.5,
                background: "linear-gradient(135deg, #6d61d2 0%, #8b7cf6 100%)",
                boxShadow: "0 14px 34px rgba(109,97,210,0.28)",
              }}
            >
              <MenuBookRoundedIcon sx={{ fontSize: 34 }} />
            </Avatar>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color: "#111827",
                mb: 1.2,
                fontSize: { xs: "1.8rem", md: "2.2rem" },
              }}
            >
              No Courses Enrolled Yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                maxWidth: 520,
                mx: "auto",
                lineHeight: 1.8,
                fontSize: "1rem",
              }}
            >
              You have not joined any courses yet. Explore available classes and
              start building your skills today.
            </Typography>

            <Button
              variant="contained"
              sx={{
                mt: 4,
                background: "linear-gradient(135deg, #6d61d2 0%, #8b7cf6 100%)",
                borderRadius: "16px",
                px: 4,
                py: 1.4,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 14px 30px rgba(109,97,210,0.25)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a55c7 0%, #7a68f3 100%)",
                  boxShadow: "0 16px 34px rgba(109,97,210,0.32)",
                },
              }}
              onClick={() => navigate("/courses")}
            >
              Browse Courses
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        px: 2,
        background:
          "radial-gradient(circle at top left, rgba(109,97,210,0.10), transparent 20%), radial-gradient(circle at top right, rgba(168,85,247,0.08), transparent 18%), linear-gradient(180deg, #fbfbff 0%, #f8fafc 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={4}>
          {/* HERO HEADER */}
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "34px",
              p: { xs: 3, md: 4.5 },
              border: "1px solid rgba(255,255,255,0.72)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.64) 100%)",
              backdropFilter: "blur(18px)",
              boxShadow:
                "0 24px 70px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(109,97,210,0.10)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -90,
                right: -70,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(109,97,210,0.18), rgba(109,97,210,0.00) 70%)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -90,
                left: -80,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.10), rgba(168,85,247,0.00) 70%)",
              }}
            />

            <Stack
              direction={{ xs: "column", lg: "row" }}
              spacing={3}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", lg: "center" }}
              sx={{ position: "relative", zIndex: 1 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "22px",
                    background: "linear-gradient(135deg, #6d61d2 0%, #8b7cf6 100%)",
                    boxShadow: "0 12px 30px rgba(109,97,210,0.28)",
                  }}
                >
                  <MenuBookRoundedIcon sx={{ fontSize: 34 }} />
                </Avatar>

                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "1.9rem", md: "2.5rem" },
                      fontWeight: 800,
                      lineHeight: 1.12,
                      color: "#111827",
                    }}
                  >
                    My Enrolled Courses
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      color: "#6b7280",
                      fontSize: "1rem",
                      lineHeight: 1.8,
                      maxWidth: 700,
                    }}
                  >
                    Track all the courses you have joined and continue your
                    learning journey from one beautiful place.
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.2}
                useFlexGap
                flexWrap="wrap"
              >
                <Chip
                  icon={<AutoStoriesRoundedIcon />}
                  label={`${stats.totalCourses} Enrolled`}
                  sx={heroChipStyle}
                />
                <Chip
                  icon={<PersonRoundedIcon />}
                  label={`${stats.uniqueTeachers} Instructors`}
                  sx={heroChipStyle}
                />
                <Chip
                  icon={<SchoolRoundedIcon />}
                  label="Keep Learning"
                  sx={heroChipStyle}
                />
              </Stack>
            </Stack>
          </Paper>

          {/* COURSE LIST */}
          <Stack spacing={2.5}>
            {courses.map((course, index) => (
              <Paper
                key={course.course_id}
                onClick={() => navigate(`/student/courses/${course.course_id}`)}
                elevation={0}
                sx={{
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "28px",
                  border: "1px solid rgba(255,255,255,0.72)",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%)",
                  backdropFilter: "blur(18px)",
                  boxShadow:
                    "0 14px 40px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(109,97,210,0.08)",
                  transition: "all 0.32s ease",
                  opacity: 0,
                  transform: "translateY(20px)",
                  animation: `fadeUp 0.55s ease ${index * 0.08}s forwards`,
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow:
                      "0 22px 48px rgba(15, 23, 42, 0.10), 0 14px 30px rgba(109,97,210,0.14)",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    right: -40,
                    top: -40,
                    width: 170,
                    height: 170,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(109,97,210,0.10), rgba(109,97,210,0.00) 70%)",
                    pointerEvents: "none",
                  }}
                />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2.5}
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                  sx={{
                    px: { xs: 2.2, md: 3.2 },
                    py: { xs: 2.2, md: 2.8 },
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2.2}
                    alignItems="center"
                    sx={{ minWidth: 0, flex: 1 }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 62, md: 68 },
                        height: { xs: 62, md: 68 },
                        fontSize: "1.45rem",
                        fontWeight: 800,
                        flexShrink: 0,
                        color: "white",
                        background: getGradientByIndex(index),
                        boxShadow: "0 12px 24px rgba(109,97,210,0.24)",
                      }}
                    >
                      {getInitials(course.title)}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontSize: { xs: "1.08rem", md: "1.28rem" },
                          fontWeight: 800,
                          color: "#111827",
                          lineHeight: 1.3,
                          mb: 0.6,
                          wordBreak: "break-word",
                        }}
                      >
                        {course.title}
                      </Typography>

                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                      >
                        <Chip
                          size="small"
                          icon={<PersonRoundedIcon sx={{ fontSize: "16px !important" }} />}
                          label={course.teacher_name || "Instructor"}
                          sx={courseMetaChipStyle}
                        />

                        {course.description && (
                          <Typography
                            sx={{
                              color: "#6b7280",
                              fontSize: "0.92rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              maxWidth: { xs: "100%", md: 520 },
                            }}
                          >
                            {stripHtml(course.description)}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    endIcon={<ArrowOutwardRoundedIcon />}
                    sx={{
                      flexShrink: 0,
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "16px",
                      px: 2.2,
                      py: 1.1,
                      background: "linear-gradient(135deg, #6d61d2 0%, #8b7cf6 100%)",
                      boxShadow: "0 12px 24px rgba(109,97,210,0.22)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #5a55c7 0%, #7a68f3 100%)",
                        boxShadow: "0 14px 28px rgba(109,97,210,0.28)",
                      },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/student/courses/${course.course_id}`);
                    }}
                  >
                    Open Course
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>

        <style>
          {`
            @keyframes fadeUp {
              0% {
                opacity: 0;
                transform: translateY(20px);
              }
              100% {
                opacity: 1;
                transform: translateY(0px);
              }
            }
          `}
        </style>
      </Container>
    </Box>
  );
}

const heroChipStyle = {
  height: 38,
  borderRadius: "999px",
  fontWeight: 700,
  color: "#374151",
  bgcolor: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(148,163,184,0.16)",
  "& .MuiChip-icon": {
    color: "#6d61d2",
  },
};

const courseMetaChipStyle = {
  borderRadius: "999px",
  fontWeight: 600,
  color: "#4b5563",
  bgcolor: "rgba(109,97,210,0.08)",
  border: "1px solid rgba(109,97,210,0.12)",
  "& .MuiChip-icon": {
    color: "#6d61d2",
  },
};