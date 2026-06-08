// frontend/src/pages/student/Courses.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../lib/api";
import { useRef } from "react";
import Footer from "../../components/Footer";
import {
  Container,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Stack,
  Paper,
  Avatar,
  Skeleton,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import StarIcon from "@mui/icons-material/Star";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import NewReleasesIcon from "@mui/icons-material/NewReleases";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SchoolIcon from "@mui/icons-material/School";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

import Swal from "sweetalert2";
import { useCart } from "../../context/CartContext.jsx";

/* ================= HELPERS ================= */

function isYouTubeUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")
    );
  } catch {
    return false;
  }
}

function extractYouTubeId(url) {
  const regExp =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/;
  const match = url?.match(regExp);
  return match ? match[1] : null;
}

function getYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

function stripHtml(html) {
  if (!html) return "";

  const div = document.createElement("div");
  div.innerHTML = html;

  return (div.textContent || div.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPrice(value) {
  const price = Number(value || 0);
  return `$${price.toFixed(2)}`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/* ================= LOADING CARD ================= */

function CourseCardSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: "28px",
        overflow: "hidden",
        border: "1px solid rgba(124,58,237,0.08)",
        boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Skeleton variant="rectangular" height={210} />
      <CardContent sx={{ p: 2.2 }}>
        <Skeleton variant="text" height={34} width="85%" />
        <Skeleton variant="text" height={24} width="35%" />
        <Skeleton variant="text" height={22} width="95%" />
        <Skeleton variant="text" height={22} width="78%" />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
          <Skeleton variant="rounded" width={80} height={28} />
          <Skeleton variant="rounded" width={70} height={24} />
        </Stack>
      </CardContent>
      <Box sx={{ p: 2, pt: 0 }}>
        <Skeleton variant="rounded" height={48} />
      </Box>
    </Card>
  );
}

/* ================= MAIN ================= */

export default function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [derivedThumbs, setDerivedThumbs] = useState({});
  const [tab, setTab] = useState("popular");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  const latestRequest = useRef(0);

  const load = async (query = "") => {
    const requestId = ++latestRequest.current;

    try {
      setLoading(true);

      const params = query ? { params: { search: query } } : {};
      const { data } = await API.get("/api/courses/", params);

      if (requestId === latestRequest.current) {
        setCourses(Array.isArray(data) ? data : []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      if (requestId === latestRequest.current) {
        setLoading(false);
      }
    }
  };



  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    load(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    courses.forEach((course) => {
      const hasThumb = course.thumbnail_url || course.thumbnail;
      if (hasThumb || derivedThumbs[course.id]) return;

      const videoUrl =
        course.video_url || course.preview_video_url || course.intro_video || "";

      if (!videoUrl) return;

      if (isYouTubeUrl(videoUrl)) {
        const yt = getYouTubeThumbnail(videoUrl);
        if (yt) {
          setDerivedThumbs((prev) => ({ ...prev, [course.id]: yt }));
        }
      }
    });
  }, [courses, derivedThumbs]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const filteredCourses = useMemo(() => {
    const list = [...courses];

    if (tab === "popular") {
      return list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    }

    if (tab === "new") {
      return list.sort((a, b) => {
        const da = new Date(a.created_at || a.updated_at || 0).getTime();
        const db = new Date(b.created_at || b.updated_at || 0).getTime();
        return db - da;
      });
    }

    if (tab === "trending") {
      return list.sort((a, b) => {
        const scoreA =
          Number(a.students_count || a.enrollments_count || a.students || 0) +
          Number(a.rating || 0) * 10;
        const scoreB =
          Number(b.students_count || b.enrollments_count || b.students || 0) +
          Number(b.rating || 0) * 10;
        return scoreB - scoreA;
      });
    }

    return list;
  }, [courses, tab]);

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const avgRating =
      totalCourses > 0
        ? (
          courses.reduce((sum, c) => sum + Number(c.rating || 0), 0) /
          totalCourses
        ).toFixed(1)
        : "0.0";

    const totalStudents = courses.reduce(
      (sum, c) =>
        sum + Number(c.students_count || c.enrollments_count || c.students || 0),
      0
    );

    return {
      totalCourses,
      avgRating,
      totalStudents,
    };
  }, [courses]);

  const handleAddToCart = async (e, courseId) => {
    e.stopPropagation();
    e.preventDefault();

    const token = localStorage.getItem("access");

    if (!token) {
      Swal.fire({
        title: "Login required",
        text: "Please log in to add items to your cart.",
        icon: "info",
      }).then(() => navigate("/login"));
      return;
    }

    try {
      await API.post(`/api/cart/add/${courseId}/`);
      refreshCartCount();

      Swal.fire({
        title: "Added to cart",
        icon: "success",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Could not add to cart", "error");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",          // ✅ ADD THIS LINE
        flexDirection: "column",  // ✅ ADD THIS LINE
        position: "relative",
        overflow: "hidden",
        background: `
          radial-gradient(circle at top left, rgba(124,58,237,0.14), transparent 28%),
          radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 28%),
          linear-gradient(180deg, #f8f5ff 0%, #f6f8ff 38%, #ffffff 100%)
        `,
        pt: { xs: 3.5, md: 5 },   // only top padding
        pb: 0                     // remove bottom padding
      }}
    >
      {/* decorative blur blobs */}
      <Box
        sx={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "rgba(124,58,237,0.14)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 120,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.12)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <Box sx={{ flex: 1 }}>
        <Container
          maxWidth="xl"
          sx={{
            position: "relative",
            zIndex: 1,
            mb: 6   // ✅ ADD THIS
          }}
        >
          {/* HERO */}
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              overflow: "hidden",
              p: { xs: 2.5, md: 4 },
              mb: 3.5,
              borderRadius: "32px",
              border: "1px solid rgba(124,58,237,0.10)",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(250,245,255,0.96) 45%, rgba(243,246,255,0.96) 100%)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 24px 80px rgba(15,23,42,0.08)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(120deg, rgba(124,58,237,0.06), rgba(99,102,241,0.04), transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <Stack
              direction={{ xs: "column", lg: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", lg: "center" }}
              spacing={3}
            >
              <Box sx={{ maxWidth: 760 }}>
                <Chip
                  label="Premium Learning Experience"
                  sx={{
                    mb: 2,
                    height: 34,
                    px: 1,
                    borderRadius: 999,
                    fontWeight: 800,
                    color: "#6d28d9",
                    background: "rgba(124,58,237,0.10)",
                    border: "1px solid rgba(124,58,237,0.14)",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: { xs: "2.1rem", sm: "2.6rem", md: "3.4rem" },
                    lineHeight: 1.05,
                    fontWeight: 900,
                    letterSpacing: "-0.06em",
                    color: "#0f172a",
                    maxWidth: 720,
                  }}
                >
                  Discover Courses That Actually
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      background:
                        "linear-gradient(135deg, #7c3aed 0%, #6366f1 55%, #2563eb 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Move Your Career Forward
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    mt: 2,
                    color: "text.secondary",
                    fontSize: { xs: "0.98rem", md: "1.05rem" },
                    maxWidth: 640,
                    lineHeight: 1.8,
                  }}
                >
                  Explore beautifully curated courses, learn from expert instructors,
                  and build real skills with a premium learning experience designed to
                  feel modern, elegant, and effortless.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 3 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: "20px",
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(15,23,42,0.06)",
                      minWidth: 140,
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: "1.15rem" }}>
                      {stats.totalCourses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Courses Available
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: "20px",
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(15,23,42,0.06)",
                      minWidth: 140,
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: "1.15rem" }}>
                      {stats.avgRating} ★
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Rating
                    </Typography>
                  </Paper>

                  <Paper
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderRadius: "20px",
                      background: "rgba(255,255,255,0.72)",
                      border: "1px solid rgba(15,23,42,0.06)",
                      minWidth: 140,
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: "1.15rem" }}>
                      {stats.totalStudents}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Learners
                    </Typography>
                  </Paper>
                </Stack>
              </Box>

              <Box
                sx={{
                  width: { xs: "100%", lg: 320 },
                  alignSelf: "stretch",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "28px",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(248,250,255,0.94) 100%)",
                    border: "1px solid rgba(124,58,237,0.10)",
                    boxShadow: "0 18px 50px rgba(99,102,241,0.12)",
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1.2}>
                      <Avatar
                        sx={{
                          bgcolor: "#ede9fe",
                          color: "#6d28d9",
                          width: 42,
                          height: 42,
                        }}
                      >
                        <SchoolIcon />
                      </Avatar>
                      <Box>
                        <Typography fontWeight={800}>
                          Handpicked Learning
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Better courses, cleaner experience
                        </Typography>
                      </Box>
                    </Stack>

                    <Box
                      sx={{
                        p: 1.7,
                        borderRadius: "22px",
                        background:
                          "linear-gradient(135deg, rgba(124,58,237,0.10), rgba(99,102,241,0.08))",
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                        Explore smarter
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Search fast, filter beautifully, and jump into the course
                        that fits your next goal.
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </Paper>

          {/* SEARCH + FILTER BAR */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, md: 2 },
              mb: 3,
              borderRadius: "28px",
              border: "1px solid rgba(124,58,237,0.10)",
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 20px 60px rgba(15,23,42,0.07)",
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              {/* 🔍 SEARCH */}
              <TextField
                fullWidth
                placeholder="Search for courses, instructors, or skills..."
                value={search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#7c3aed" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "999px",
                    background: "#fff",
                    height: 56,
                    fontSize: "0.95rem",
                    transition: "all 0.25s ease",
                    "& fieldset": {
                      border: "1px solid rgba(124,58,237,0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: "#7c3aed",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7c3aed",
                      boxShadow: "0 0 0 4px rgba(124,58,237,0.1)",
                    },
                  },
                }}
              />

              {/* 🔥 FILTER GROUP */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: "4px",
                  borderRadius: "999px",
                  background: "rgba(124,58,237,0.08)",
                  backdropFilter: "blur(10px)",
                  gap: 0.5,
                }}
              >
                {[
                  { key: "popular", label: "Popular", icon: <LocalFireDepartmentIcon /> },
                  { key: "new", label: "New", icon: <NewReleasesIcon /> },
                  { key: "trending", label: "Trending", icon: <TrendingUpIcon /> },
                ].map((item) => {
                  const active = tab === item.key;

                  return (
                    <Chip
                      key={item.key}
                      label={item.label}
                      icon={item.icon}
                      onClick={() => setTab(item.key)}
                      clickable
                      sx={{
                        height: 44,
                        px: 1.5,
                        borderRadius: "999px",
                        fontWeight: 800,
                        transition: "all 0.25s ease",

                        /* ACTIVE STYLE */
                        ...(active && {
                          background:
                            "linear-gradient(135deg,#7c3aed,#6366f1)",
                          color: "#fff",
                          boxShadow: "0 6px 18px rgba(99,102,241,0.4)",
                        }),

                        /* INACTIVE STYLE */
                        ...(!active && {
                          background: "transparent",
                          color: "#4338ca",
                          "&:hover": {
                            background: "rgba(124,58,237,0.12)",
                          },
                        }),

                        "& .MuiChip-icon": {
                          color: active ? "#fff" : "#6366f1",
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Stack>
          </Paper>

          {/* SECTION HEADER */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "1.35rem", md: "1.6rem" },
                  fontWeight: 900,
                  color: "#0f172a",
                  letterSpacing: "-0.03em",
                }}
              >
                {tab === "popular" && "Most Popular Courses"}
                {tab === "new" && "Freshly Added Courses"}
                {tab === "trending" && "Trending Right Now"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                {loading
                  ? "Loading courses..."
                  : `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""
                  } found`}
              </Typography>
            </Box>
          </Stack>

          {/* GRID */}
          {loading ? (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2,1fr)",
                  md: "repeat(3,1fr)",
                  lg: "repeat(4,1fr)",
                },
              }}
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <CourseCardSkeleton key={idx} />
              ))}
            </Box>
          ) : filteredCourses.length === 0 ? (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                textAlign: "center",
                borderRadius: "30px",
                border: "1px solid rgba(124,58,237,0.10)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,255,0.96) 100%)",
                boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
              }}
            >
              <Avatar
                sx={{
                  width: 68,
                  height: 68,
                  mx: "auto",
                  mb: 2,
                  bgcolor: "#ede9fe",
                  color: "#6d28d9",
                }}
              >
                <SearchIcon />
              </Avatar>

              <Typography sx={{ fontWeight: 900, fontSize: "1.35rem", mb: 1 }}>
                No courses found
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 520, mx: "auto" }}>
                We couldn’t find any courses matching your search. Try a different
                keyword or switch to another filter.
              </Typography>

              <Button
                onClick={() => {
                  setSearch("");
                  setTab("popular");
                }}
                sx={{
                  mt: 3,
                  px: 3,
                  height: 46,
                  borderRadius: 999,
                  fontWeight: 800,
                  textTransform: "none",
                  color: "#fff",
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                  boxShadow: "0 10px 24px rgba(99,102,241,0.28)",
                  "&:hover": {
                    opacity: 0.95,
                  },
                }}
              >
                Reset filters
              </Button>
            </Paper>
          ) : (
            <Box
              sx={{
                display: "grid",
                gap: 3,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2,1fr)",
                  md: "repeat(3,1fr)",
                  lg: "repeat(4,1fr)",
                },
              }}
            >
              {filteredCourses.map((course, index) => {
                const isEnrolled = course.is_enrolled;
                const thumb =
                  course.thumbnail_url ||
                  course.thumbnail ||
                  derivedThumbs[course.id] ||
                  null;

                const rating = Number(course.rating || 0);
                const price = Number(course.price || 0);
                const description = stripHtml(course.description);
                const studentsCount = Number(
                  course.students_count || course.enrollments_count || course.students || 0
                );

                const isBestSeller = rating >= 4.5;
                const isNew = index < 4 && tab === "new";
                const isTrending = index < 4 && tab === "trending";

                return (
                  <Card
                    key={course.id}
                    sx={{
                      position: "relative",
                      borderRadius: "28px",
                      overflow: "hidden",
                      border: "1px solid rgba(124,58,237,0.08)",
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(250,252,255,0.98) 100%)",
                      boxShadow: "0 16px 50px rgba(15,23,42,0.07)",
                      transition: "transform .35s ease, box-shadow .35s ease, border-color .35s ease",
                      "&:hover": {
                        transform: "translateY(-10px)",
                        boxShadow: "0 28px 70px rgba(99,102,241,0.16)",
                        borderColor: "rgba(124,58,237,0.18)",
                      },
                      "&:hover .course-image": {
                        transform: "scale(1.06)",
                      },
                      "&:hover .course-arrow": {
                        transform: "translate(3px,-3px)",
                      },
                    }}
                  >
                    {/* ✅ CLICKABLE AREA ONLY */}
                    <CardActionArea
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                      sx={{ alignItems: "stretch" }}
                    >
                      <Box sx={{ position: "relative", height: 210 }}>
                        {thumb ? (
                          <CardMedia
                            component="img"
                            image={thumb}
                            alt={course.title}
                            className="course-image"
                            sx={{
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform .5s ease",
                            }}
                          />
                        ) : (
                          /* 🔥 GRADIENT PLACEHOLDER */
                          <Box
                            className="course-image"
                            sx={{
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background:
                                "linear-gradient(135deg,#7c3aed 0%,#6366f1 50%,#3b82f6 100%)",
                              color: "#fff",
                              fontWeight: 900,
                              fontSize: "1.2rem",
                              textAlign: "center",
                              px: 2,
                            }}
                          >
                            {course.title}
                          </Box>
                        )}

                        {/* overlay stays same */}
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(180deg, rgba(15,23,42,0.02) 20%, rgba(15,23,42,0.55) 100%)",
                          }}
                        />
                      </Box>

                      <CardContent
                        sx={{
                          p: 2.2,
                          display: "flex",
                          flexDirection: "column",
                          height: "220px", // 🔥 FIX HEIGHT
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 900,
                            fontSize: "1.05rem",
                            lineHeight: 1.3,
                            mb: 0.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {course.title}
                        </Typography>

                        <Typography fontSize={13} color="text.secondary">
                          {course.teacher_name}
                        </Typography>

                        {/* 🔥 FIX DESCRIPTION */}
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: "text.secondary",
                            mt: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 3, // 🔥 LIMIT LINES
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: 60,
                          }}
                        >
                          {description}
                        </Typography>

                        {/* 🔥 PUSH PRICE TO BOTTOM */}
                        <Box sx={{ mt: "auto" }}>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography fontWeight={900}>
                              {formatPrice(price)}
                            </Typography>

                            <Stack direction="row" alignItems="center">
                              <StarIcon sx={{ color: "#f59e0b" }} />
                              {rating.toFixed(1)}
                            </Stack>
                          </Stack>
                        </Box>
                      </CardContent>
                    </CardActionArea>

                    {/* ✅ BUTTON OUTSIDE (FIXED) */}
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        fullWidth
                        disabled={isEnrolled}
                        onClick={(e) => handleAddToCart(e, course.id)}
                        startIcon={<ShoppingCartOutlinedIcon />}
                        sx={{
                          height: 48,
                          borderRadius: 999,
                          fontWeight: 800,
                          textTransform: "none",
                          background: isEnrolled
                            ? "#e5e7eb"
                            : "linear-gradient(135deg,#7c3aed,#6366f1)",
                          color: isEnrolled ? "#6b7280" : "#fff",
                        }}
                      >
                        {isEnrolled ? "Already Purchased" : "Add to cart"}
                      </Button>
                    </Box>
                  </Card>
                );
              })}
            </Box>
          )}
        </Container>
      </Box>
      <Footer />
    </Box>

  );
}