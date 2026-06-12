import { useEffect, useMemo, useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import API from "../../lib/api";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import CourseChatbot from "../../components/CourseChatbot";
import { Snackbar, Alert } from "@mui/material";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  Tabs,
  Tab,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Skeleton,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import YouTube from "react-youtube";

import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";



// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function isYouTubeUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /youtu\.be\/|youtube\.com\/(watch\?v=|embed\/|shorts\/)/i.test(url);
}

function extractYouTubeId(url) {
  if (!url || typeof url !== "string") return null;

  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  const watchMatch = url.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  const otherMatch = url.match(/\/(embed|shorts)\/([A-Za-z0-9_-]{11})/);
  if (otherMatch) return otherMatch[2];

  return null;
}

function getYouTubeThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

function getSafeVideoPoster(course) {
  const thumb =
    course?.thumbnail_url ||
    course?.thumbnail ||
    (course?.video_url && isYouTubeUrl(course.video_url)
      ? getYouTubeThumbnail(course.video_url)
      : null);

  return thumb || "/default-thumb.jpg";
}

function getLectureDurationMinutes(lecture) {
  if (lecture?.duration) return lecture.duration;

  if (lecture?.scheduled_time && lecture?.end_time) {
    const start = new Date(lecture.scheduled_time);
    const end = new Date(lecture.end_time);
    return Math.max(Math.floor((end - start) / (1000 * 60)), 0);
  }

  return null;
}

// -------------------------------------------------------------
// Component
// -------------------------------------------------------------
export default function StudentCourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [courseResources, setCourseResources] = useState([]);
  const [curriculum, setCurriculum] = useState([]);

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [isActuallyPlaying, setIsActuallyPlaying] = useState(false);
  const [livePopup, setLivePopup] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [scheduledLecture, setScheduledLecture] = useState(null);

  const [activeLecture, setActiveLecture] = useState(null); // { sectionId, lecture }
  const [playing, setPlaying] = useState(false);
  const [lectureQuizzes, setLectureQuizzes] = useState({});


  const [reviews, setReviews] = useState([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [myReview, setMyReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  const isEnrolled = Boolean(course?.is_enrolled);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const firstPlayableLecture = useMemo(() => {
    for (const section of curriculum || []) {
      for (const lec of section.lectures || []) {
        const locked = lec.locked;
        if (!locked) {
          return { sectionId: section.id, sectionTitle: section.title, lecture: lec };
        }
      }
    }
    return null;
  }, [curriculum, isEnrolled]);

  const totalLectures = useMemo(
    () => curriculum.reduce((acc, s) => acc + (s.lectures?.length || 0), 0),
    [curriculum]
  );

  const totalResources = useMemo(
    () => (courseResources?.length || 0),
    [courseResources]
  );

  const pulseKeyframes = `
    @keyframes equalizerPulse {
      0% { transform: scaleY(0.75); opacity: 0.6; }
      50% { transform: scaleY(1.2); opacity: 1; }
      100% { transform: scaleY(0.75); opacity: 0.6; }
    }
    @keyframes glowFloat {
      0% { transform: translateY(0px); opacity: 0.45; }
      50% { transform: translateY(-10px); opacity: 0.75; }
      100% { transform: translateY(0px); opacity: 0.45; }
    }
  `;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const { data } = await API.get(`/api/courses/${id}/`);
        setCourse(data);

        const cur = await API.get(`/api/courses/${id}/curriculum/`);
        setCurriculum(cur.data || []);

        await loadReviews();

        if (data.is_enrolled) {
          const res = await API.get(`/api/courses/${id}/resources/`);
          setCourseResources(res.data || []);
        } else {
          setCourseResources([]);
        }
      } catch (err) {
        console.error("Failed to load course", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (course?.is_enrolled) {
      loadMyReview();
    }
  }, [course?.is_enrolled, id]);

  useEffect(() => {
    if (!activeLecture?.lecture?.scheduled_time) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(activeLecture.lecture.scheduled_time);
      const diff = start - now;

      if (diff <= 0) {
        setCountdown({ ready: true });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setCountdown({
        days,
        hours,
        minutes,
        seconds,
        ready: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeLecture?.lecture?.scheduled_time]);

  const lectureResources = useMemo(() => {
    const out = [];

    (curriculum || []).forEach((section) => {
      (section.lectures || []).forEach((lec) => {
        (lec.files || []).forEach((f) => {
          out.push({
            id: `lecfile-${f.id}`,
            title: f.original_name || `${lec.title} PDF`,
            file_url: f.file_url,
          });
        });
      });
    });

    return out;
  }, [curriculum]);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const resources = useMemo(() => {
    return [...lectureResources, ...courseResources];
  }, [lectureResources, courseResources]);

  useEffect(() => {
    if (!loading && !activeLecture && firstPlayableLecture) {
      setActiveLecture(firstPlayableLecture);
      setPlaying(false);
      fetchLectureStatus(firstPlayableLecture.lecture.id);
    }
  }, [loading, firstPlayableLecture]);

  useEffect(() => {
    const loadQuizzes = async () => {
      const map = {};

      for (const section of curriculum) {
        for (const lec of section.lectures || []) {
          try {
            const res = await API.get(`/api/lectures/${lec.id}/assessments/`);
            if (res.data.length > 0) {
              map[lec.id] = res.data[0];
            }
          } catch { }
        }
      }

      setLectureQuizzes(map);
    };

    if (curriculum.length > 0) loadQuizzes();
  }, [curriculum]);

  useEffect(() => {
    if (!curriculum || curriculum.length === 0) return;

    const allLectures = curriculum.flatMap((sec) =>
      (sec.lectures || []).map((l) => ({
        ...l,
        sectionId: sec.id,
        sectionTitle: sec.title,
      }))
    );

    const found = allLectures.find((l) => l.scheduled_time);

    if (found) {
      setScheduledLecture(found);

      setActiveLecture({
        sectionId: found.sectionId,
        sectionTitle: found.sectionTitle,
        lecture: found,
      });
    }
  }, [curriculum]);

  const fetchLectureStatus = async (lectureId) => {
    try {
      const res = await API.get(`/api/lectures/${lectureId}/`);
      const updatedLecture = res.data;

      setActiveLecture((prev) => ({
        ...prev,
        lecture: updatedLecture,
      }));
    } catch (err) {
      console.error("Failed to fetch lecture", err);
    }
  };

  const canPlayLecture = (lec) => !lec.locked;

  const playLecture = async (section, lec) => {
    if (!canPlayLecture(lec)) return;

    setActiveLecture({
      sectionId: section.id,
      sectionTitle: section.title,
      lecture: lec,
    });
    setPlaying(true);
    fetchLectureStatus(lec.id);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const coursePoster = getSafeVideoPoster(course);

  const loadReviews = async () => {
    try {
      const res = await API.get(`/api/courses/${id}/reviews/`);
      setReviews(res.data.reviews || []);
      setReviewsCount(res.data.reviews_count || 0);
      setAverageRating(res.data.average_rating || 0);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  const loadMyReview = async () => {
    if (!isEnrolled) return;

    try {
      const res = await API.get(`/api/courses/${id}/my-review/`);

      if (res.data?.review === null) {
        setMyReview(null);
        return;
      }

      setMyReview(res.data);

      // IMPORTANT:
      // do NOT fill textbox here
      // textbox should stay empty unless user clicks Edit
    } catch (err) {
      console.error("Failed to load my review", err);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewRating) {
      setSnackbar({
        open: true,
        message: "Please select a rating",
        severity: "warning",
      });
      return;
    }

    try {
      setReviewLoading(true);

      await API.post(`/api/courses/${id}/review/`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      const refreshed = await API.get(`/api/courses/${id}/reviews/`);
      setReviews(refreshed.data.reviews || []);
      setReviewsCount(refreshed.data.reviews_count || 0);
      setAverageRating(refreshed.data.average_rating || 0);

      setCourse((prev) =>
        prev
          ? {
            ...prev,
            rating: refreshed.data.average_rating || 0,
            reviews_count: refreshed.data.reviews_count || 0,
          }
          : prev
      );

      // reload saved review
      await loadMyReview();

      // clear form after submit
      setReviewRating(0);
      setReviewComment("");
      setIsEditingReview(false);

      setSnackbar({
        open: true,
        message: "Review submitted successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to submit review", err);
      setSnackbar({
        open: true,
        message: "Failed to submit review",
        severity: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };
  const handleOpenReviewMenu = (event, review) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleCloseReviewMenu = () => {
    setMenuAnchorEl(null);
    setSelectedReview(null);
  };

  const handleEditReview = () => {
    if (!selectedReview) return;

    setMyReview(selectedReview);
    setReviewRating(selectedReview.rating || 0);
    setReviewComment(selectedReview.comment || "");
    setIsEditingReview(true);
    setTab(2);

    handleCloseReviewMenu();
  };

  const handleDeleteReview = async () => {
    if (!selectedReview) return;

    try {
      await API.delete(`/api/courses/${id}/review/delete/`);

      const refreshed = await API.get(`/api/courses/${id}/reviews/`);
      setReviews(refreshed.data.reviews || []);
      setReviewsCount(refreshed.data.reviews_count || 0);
      setAverageRating(refreshed.data.average_rating || 0);

      setCourse((prev) =>
        prev
          ? {
            ...prev,
            rating: refreshed.data.average_rating || 0,
            reviews_count: refreshed.data.reviews_count || 0,
          }
          : prev
      );

      setMyReview(null);
      setReviewRating(0);
      setReviewComment("");
      setIsEditingReview(false);

      setSnackbar({
        open: true,
        message: "Review deleted successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Failed to delete review", err);
      setSnackbar({
        open: true,
        message: "Failed to delete review",
        severity: "error",
      });
    } finally {
      handleCloseReviewMenu();
    }
  };

  const handleAddToCart = async () => {
    try {
      await API.post(`/api/cart/add/${course.id}/`);

      setSnackbar({
        open: true,
        message: "Added to cart",
        severity: "success",
      });

    } catch {
      setSnackbar({
        open: true,
        message: "Error adding to cart ❌",
        severity: "error",
      });
    }
  };

  const sectionCardStyle = {
    borderRadius: "24px",
    border: `1px solid ${alpha("#1e1b4b", 0.08)}`,
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
    boxShadow: "0 10px 40px rgba(15, 23, 42, 0.06)",
    backdropFilter: "blur(10px)",
  };

  const renderStars = (value, clickable = false, onChange = null, size = 22) => {
    return (
      <Stack direction="row" spacing={0.3} alignItems="center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= value;

          const Icon = filled ? StarRoundedIcon : StarBorderRoundedIcon;

          return (
            <Box
              key={star}
              onClick={clickable ? () => onChange?.(star) : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: clickable ? "pointer" : "default",
                color: filled ? "#f59e0b" : "#cbd5e1",
                transition: "all .18s ease",
                "&:hover": clickable
                  ? {
                    transform: "scale(1.08)",
                    color: "#f59e0b",
                  }
                  : {},
              }}
            >
              <Icon sx={{ fontSize: size }} />
            </Box>
          );
        })}
      </Stack>
    );
  };

  const renderPlayer = () => {
    const videoLink = activeLecture?.lecture?.video_link || course.video_url || null;
    const yt = Boolean(videoLink && isYouTubeUrl(videoLink));
    const ytId = yt ? extractYouTubeId(videoLink) : null;
    const previewImage = yt ? getYouTubeThumbnail(videoLink) : coursePoster;

    if (activeLecture?.lecture && !canPlayLecture(activeLecture.lecture)) {
      return (
        <Card
          sx={{
            ...sectionCardStyle,
            overflow: "hidden",
            position: "relative",
            minHeight: { xs: 260, md: 440 },
            width: "100%",
            margin: "0 auto",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${previewImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(26px) brightness(0.38)",
              transform: "scale(1.08)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(24,24,27,0.55), rgba(88,28,135,0.42), rgba(15,23,42,0.6))",
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              minHeight: { xs: 260, md: 440 },
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#fff",
              px: 3,
            }}
          >
            <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: "24px",
                display: "grid",
                placeItems: "center",
                mb: 2,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(10px)",
              }}
            >
              <LockIcon sx={{ fontSize: 34 }} />
            </Box>
            <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
              Locked lecture
            </Typography>
            <Typography sx={{ maxWidth: 440, opacity: 0.9 }}>
              This lesson is part of the full course access. Enroll to unlock the complete learning experience.
            </Typography>
          </Box>
        </Card>
      );
    }

    if (!videoLink) {
      return (
        <Card
          sx={{
            ...sectionCardStyle,
            minHeight: { xs: 260, md: 440 },
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            p: 3,
          }}
        >
          <Box>
            <Box
              sx={{
                width: 74,
                height: 74,
                borderRadius: "22px",
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2,
                background: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(99,102,241,0.12))",
                border: "1px solid rgba(124,58,237,0.18)",
              }}
            >
              <OndemandVideoIcon sx={{ fontSize: 34, color: "#6d28d9" }} />
            </Box>
            <Typography variant="h6" fontWeight={900}>
              No video available
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              This lecture does not have a playable video yet.
            </Typography>
          </Box>
        </Card>
      );
    }

    return (
      <Card
        sx={{
          ...sectionCardStyle,
          overflow: "hidden",
          position: "relative",
          minHeight: { xs: 260, md: 440 },
        }}
      >
        {playing && yt && ytId ? (
          <Box sx={{ lineHeight: 0 }}>
            <YouTube
              videoId={ytId}
              opts={{
                width: "100%",
                height: "440",
                playerVars: { autoplay: 1 },
              }}
              onPlay={() => setIsActuallyPlaying(true)}
              onPause={() => setIsActuallyPlaying(false)}
              onEnd={() => setIsActuallyPlaying(false)}
            />
          </Box>
        ) : playing && !yt ? (
          <video
            controls
            autoPlay
            onPlay={() => setIsActuallyPlaying(true)}
            onPause={() => setIsActuallyPlaying(false)}
            onEnded={() => setIsActuallyPlaying(false)}
            style={{
              width: "100%",
              height: "440px",
              objectFit: "cover",
              display: "block",
              background: "#000",
            }}
            src={videoLink}
          />
        ) : (
          <>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${previewImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(26px) brightness(0.42)",
                transform: "scale(1.08)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 26%), linear-gradient(135deg, rgba(91,33,182,0.38), rgba(99,102,241,0.2), rgba(15,23,42,0.56))",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                filter: "blur(30px)",
                animation: "glowFloat 6s ease-in-out infinite",
              }}
            />
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                minHeight: { xs: 260, md: 440 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                p: { xs: 2, md: 3 },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                {activeLecture?.lecture && (
                  <Chip
                    icon={<OndemandVideoIcon sx={{ color: "#fff !important" }} />}
                    label={activeLecture.lecture.title}
                    sx={{
                      maxWidth: "100%",
                      height: 38,
                      color: "#fff",
                      fontWeight: 800,
                      borderRadius: "999px",
                      background: "rgba(17,24,39,0.34)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      backdropFilter: "blur(10px)",
                      "& .MuiChip-label": {
                        px: 1.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                )}
                {activeLecture?.lecture?.is_preview && (
                  <Chip
                    label="Preview"
                    sx={{
                      height: 34,
                      color: "#fff",
                      fontWeight: 800,
                      borderRadius: "999px",
                      background: "rgba(16,185,129,0.2)",
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  />
                )}
              </Box>

              <Box sx={{ maxWidth: 560 }}>
                <Typography
                  sx={{
                    maxWidth: 520,
                    color: "#fff",
                    fontWeight: 950,
                    lineHeight: 0.95,
                    letterSpacing: -2,
                    fontSize: { xs: "2.4rem", sm: "3.1rem", md: "4.6rem" },
                    textShadow: "0 10px 40px rgba(0,0,0,0.28)",
                    wordBreak: "break-word",
                  }}
                >
                  {activeLecture?.lecture?.title || course?.title}
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.86)",
                    mt: 1.5,
                    fontSize: { xs: 13, sm: 15 },
                    maxWidth: 460,
                  }}
                >
                  {activeLecture?.sectionTitle || "Start learning with this beautifully organized course experience."}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                flexWrap="wrap"
                sx={{ mt: 2 }}
              >
                <Button
                  startIcon={<PlayArrowIcon />}
                  variant="contained"
                  onClick={() => setPlaying(true)}
                  sx={{
                    borderRadius: "999px",
                    px: 3,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 900,
                    fontSize: "0.95rem",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    boxShadow: "0 16px 35px rgba(99,102,241,0.38)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                      boxShadow: "0 18px 40px rgba(99,102,241,0.45)",
                    },
                  }}
                >
                  Play lesson
                </Button>

                {activeLecture?.lecture && (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.4,
                      py: 0.95,
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 16 }} />
                    <Typography fontWeight={800} fontSize={13}>
                      {getLectureDurationMinutes(activeLecture.lecture)
                        ? `${getLectureDurationMinutes(activeLecture.lecture)} min`
                        : "Lecture"}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <>
        <Box
          sx={{
            minHeight: "100vh",
            py: { xs: 3, md: 5 },
            background:
              "linear-gradient(180deg, #f8fafc 0%, #f6f3ff 45%, #f8fafc 100%)",
          }}
        >
          <Container maxWidth="lg" sx={{ mx: "auto" }}>
            <Skeleton variant="text" width={220} height={42} />
            <Skeleton variant="text" width={420} height={52} sx={{ mt: 1 }} />
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid
                item
                xs={12}
                lg={7.5}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Skeleton variant="rounded" height={440} sx={{ borderRadius: 6 }} />
                <Skeleton variant="rounded" height={260} sx={{ mt: 2, borderRadius: 6 }} />
              </Grid>
              <Grid
                item
                xs={12}
                lg={4.5}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Skeleton variant="rounded" height={620} sx={{ borderRadius: 6 }} />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </>
    );
  }

  if (!course) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography>Course not found.</Typography>
      </Container>
    );
  }

  return (
    <>
      <style>{pulseKeyframes}</style>

      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 3, md: 5 },
          background:
            "radial-gradient(circle at top left, rgba(124,58,237,0.08), transparent 26%), radial-gradient(circle at top right, rgba(99,102,241,0.06), transparent 22%), linear-gradient(180deg, #f8fafc 0%, #f7f4ff 42%, #f8fafc 100%)",
        }}
      >
        <Container maxWidth="lg" sx={{ mx: "auto" }}>
          <Button
            component={RouterLink}
            to="/courses"
            startIcon={<ArrowBackIcon />}
            sx={{
              mb: 2.5,
              textTransform: "none",
              fontWeight: 800,
              color: "#5b21b6",
              borderRadius: "999px",
              px: 1.5,
              "&:hover": {
                bgcolor: alpha("#7c3aed", 0.06),
              },
            }}
          >
            Back to courses
          </Button>

          <Grid
            container
            spacing={{ xs: 3, md: 4 }}
            justifyContent="center"
            alignItems="stretch"
          >
            <Grid
              item
              xs={12}
              lg={7.5}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ width: "100%", maxWidth: 820 }}>
                {/* EVERYTHING inside LEFT goes here */}
                <Box sx={{ mb: 2.5 }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          maxWidth: "700px",
                          fontWeight: 950,
                          lineHeight: 1.08,
                          letterSpacing: -1.6,
                          fontSize: { xs: "2rem", md: "2.9rem" },
                          color: "#0f172a",
                          wordBreak: "break-word",
                        }}
                      >
                        {course.title}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        sx={{ mt: 1.4 }}
                      >
                        <Typography
                          sx={{
                            color: "text.secondary",
                            fontWeight: 600,
                          }}
                        >
                          By {course.teacher_name}
                        </Typography>

                        {isEnrolled ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Enrolled"
                            size="small"
                            sx={{
                              fontWeight: 900,
                              borderRadius: "999px",
                              color: "#065f46",
                              bgcolor: "rgba(16,185,129,0.12)",
                              border: "1px solid rgba(16,185,129,0.22)",
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<LockIcon />}
                            label="Not enrolled"
                            size="small"
                            sx={{
                              fontWeight: 900,
                              borderRadius: "999px",
                              color: "#991b1b",
                              bgcolor: "rgba(239,68,68,0.10)",
                              border: "1px solid rgba(239,68,68,0.18)",
                            }}
                          />
                        )}
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1.25} flexWrap="wrap">
                      <Box
                        sx={{
                          px: 1.6,
                          py: 1.1,
                          borderRadius: "18px",
                          minWidth: 106,
                          background: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(15,23,42,0.06)",
                          boxShadow: "0 8px 25px rgba(15,23,42,0.04)",
                        }}
                      >
                        <Typography fontSize={11} color="text.secondary" fontWeight={700}>
                          Lectures
                        </Typography>
                        <Typography fontWeight={900} fontSize={18}>
                          {totalLectures}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          px: 1.6,
                          py: 1.1,
                          borderRadius: "18px",
                          minWidth: 106,
                          background: "rgba(255,255,255,0.7)",
                          border: "1px solid rgba(15,23,42,0.06)",
                          boxShadow: "0 8px 25px rgba(15,23,42,0.04)",
                        }}
                      >
                        <Typography fontSize={11} color="text.secondary" fontWeight={700}>
                          Resources
                        </Typography>
                        <Typography fontWeight={900} fontSize={18}>
                          {resources.length}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>

                {renderPlayer()}

                {!isEnrolled && (
                  <Card
                    sx={{
                      ...sectionCardStyle,
                      mt: 2.5,
                      p: { xs: 2.5, md: 3.2 },
                      borderRadius: "26px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(99,102,241,0.02), rgba(255,255,255,0.5))",
                      }}
                    />
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                      sx={{ position: "relative", zIndex: 2 }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          sx={{
                            width: 62,
                            height: 62,
                            borderRadius: "20px",
                            display: "grid",
                            placeItems: "center",
                            background:
                              "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.1))",
                            border: "1px solid rgba(124,58,237,0.16)",
                          }}
                        >
                          <AutoAwesomeRoundedIcon sx={{ color: "#6d28d9", fontSize: 30 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={950}>
                            Unlock the full course
                          </Typography>
                          <Typography color="text.secondary" sx={{ mt: 0.4, maxWidth: 520 }}>
                            Get access to every lecture, downloadable resources, and the complete guided learning flow.
                          </Typography>
                        </Box>
                      </Stack>

                      <Button
                        variant="contained"
                        onClick={handleAddToCart}
                        sx={{
                          borderRadius: "999px",
                          textTransform: "none",
                          fontWeight: 900,
                          px: 3.2,
                          py: 1.2,
                          whiteSpace: "nowrap",
                          background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                          boxShadow: "0 18px 35px rgba(99,102,241,0.28)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                          },
                        }}
                      >
                        Add to cart
                      </Button>
                    </Stack>
                  </Card>
                )}

                <Card
                  sx={{
                    ...sectionCardStyle,
                    mt: 2.5,
                    overflow: "hidden",
                    p: { xs: 1.2, md: 1.4 },
                  }}
                >
                  <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      px: { xs: 0.5, md: 1 },
                      minHeight: 58,
                      "& .MuiTabs-indicator": {
                        height: 3,
                        borderRadius: 999,
                        background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
                      },
                      "& .MuiTab-root": {
                        minHeight: 58,
                        textTransform: "none",
                        fontWeight: 800,
                        color: "#64748b",
                        fontSize: "0.96rem",
                        borderRadius: "14px",
                      },
                      "& .Mui-selected": {
                        color: "#4f46e5 !important",
                      },
                    }}
                  >
                    <Tab label="Overview" />
                    <Tab label="Requirements" />
                    <Tab label="Reviews" />
                    <Tab label="Course Content" />
                  </Tabs>
                </Card>

                {tab === 0 && (
                  <Card
                    sx={{
                      ...sectionCardStyle,
                      mt: 2,
                      p: { xs: 2.4, md: 3 },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: "1.1rem",
                        mb: 2,
                        color: "#0f172a",
                      }}
                    >
                      Course overview
                    </Typography>

                    <Box
                      sx={{
                        color: "#334155",
                        lineHeight: 1.9,
                        fontSize: "0.98rem",
                        "& p": { mb: 1.8, mt: 0 },
                        "& ul, & ol": { pl: 3, mb: 2 },
                        "& li": { mb: 0.8 },
                        "& strong": { fontWeight: 800, color: "#0f172a" },
                        "& a": { color: "#4f46e5", textDecoration: "none", fontWeight: 700 },
                        "& a:hover": { textDecoration: "underline" },
                      }}
                      dangerouslySetInnerHTML={{ __html: course.description }}
                    />
                  </Card>
                )}

                {tab === 1 && (
                  <Card
                    sx={{
                      ...sectionCardStyle,
                      mt: 2,
                      p: { xs: 2.4, md: 3 },
                    }}
                  >
                    <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", mb: 2 }}>
                      Requirements
                    </Typography>

                    <Box
                      sx={{
                        borderRadius: "18px",
                        border: "1px dashed rgba(15,23,42,0.12)",
                        p: 2,
                        background: "rgba(248,250,252,0.7)",
                      }}
                    >
                      <Typography color="text.secondary" fontWeight={600}>
                        No requirements.
                      </Typography>
                    </Box>
                  </Card>
                )}

                {tab === 2 && (
                  <Card
                    sx={{
                      ...sectionCardStyle,
                      mt: 2,
                      p: { xs: 2.4, md: 3 },
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      sx={{ mb: 2.5 }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 900, fontSize: "1.1rem", mb: 1, color: "#0f172a" }}>
                          Reviews
                        </Typography>

                        <Stack direction="row" spacing={1.2} alignItems="center" flexWrap="wrap">
                          {renderStars(Math.round(Number(averageRating || 0)), false, null, 20)}
                          <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                            {Number(averageRating || 0).toFixed(1)}
                          </Typography>
                          <Typography color="text.secondary" fontWeight={600}>
                            ({reviewsCount} review{reviewsCount === 1 ? "" : "s"})
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>

                    {isEnrolled && (
                      <Box
                        sx={{
                          mb: 3,
                          p: 2,
                          borderRadius: "20px",
                          border: "1px solid rgba(15,23,42,0.08)",
                          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))",
                        }}
                      >
                        <Typography sx={{ fontWeight: 900, mb: 1.2, color: "#0f172a" }}>
                          {isEditingReview ? "Update your review" : "Write a review"}
                        </Typography>

                        <Box sx={{ mb: 1.5 }}>
                          {renderStars(reviewRating, true, setReviewRating, 28)}
                        </Box>

                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          placeholder="Share your experience about this course..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          sx={{
                            mb: 1.5,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "16px",
                              background: "#fff",
                            },
                          }}
                        />

                        <Button
                          variant="contained"
                          onClick={handleSubmitReview}
                          disabled={reviewLoading}
                          sx={{
                            borderRadius: "999px",
                            px: 2.6,
                            py: 1.1,
                            textTransform: "none",
                            fontWeight: 900,
                            background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                            boxShadow: "0 14px 28px rgba(99,102,241,0.22)",
                            "&:hover": {
                              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                            },
                          }}
                        >
                          {reviewLoading
                            ? "Submitting..."
                            : isEditingReview
                              ? "Update Review"
                              : "Submit Review"}
                        </Button>
                      </Box>
                    )}

                    {reviews.length > 0 ? (
                      <Stack spacing={1.5}>
                        {reviews.map((review) => (
                          <Box
                            key={review.id}
                            sx={{
                              borderRadius: "18px",
                              border: "1px solid rgba(15,23,42,0.08)",
                              p: 2,
                              background: "#fff",
                              boxShadow: "0 8px 22px rgba(15,23,42,0.04)",
                            }}
                          >
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                              justifyContent="space-between"
                              alignItems={{ xs: "flex-start", sm: "center" }}
                              sx={{ mb: 1 }}
                            >
                              <Box>
                                <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                                  {review.student_name}
                                </Typography>
                                <Typography fontSize={12} color="text.secondary" fontWeight={600}>
                                  {new Date(review.created_at).toLocaleDateString()}
                                </Typography>
                              </Box>

                              <Stack direction="row" spacing={0.5} alignItems="center">
                                {renderStars(review.rating, false, null, 18)}

                                {myReview && review.id === myReview.id && (
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleOpenReviewMenu(e, review)}
                                    sx={{ ml: 0.5 }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                )}
                              </Stack>
                            </Stack>

                            <Typography
                              sx={{
                                color: "#475569",
                                lineHeight: 1.8,
                                fontSize: "0.95rem",
                              }}
                            >
                              {review.comment?.trim() || "No written comment."}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          borderRadius: "18px",
                          border: "1px dashed rgba(15,23,42,0.12)",
                          p: 2,
                          background: "rgba(248,250,252,0.7)",
                        }}
                      >
                        <Typography color="text.secondary" fontWeight={600}>
                          No reviews yet.
                        </Typography>
                      </Box>
                    )}
                  </Card>
                )}

                {tab === 3 && (
                  <Card
                    sx={{
                      ...sectionCardStyle,
                      mt: 2,
                      p: { xs: 2.2, md: 3 },
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={1.5}
                      sx={{ mb: 2.2 }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 950,
                            fontSize: "1.15rem",
                            color: "#0f172a",
                          }}
                        >
                          Course content
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                          Browse sections, play lessons, and access downloadable materials.
                        </Typography>
                      </Box>

                      <Chip
                        label={`${totalLectures} lectures`}
                        size="small"
                        sx={{
                          height: 34,
                          fontWeight: 900,
                          borderRadius: "999px",
                          color: "#4f46e5",
                          bgcolor: "rgba(99,102,241,0.1)",
                          border: "1px solid rgba(99,102,241,0.18)",
                        }}
                      />
                    </Stack>

                    {curriculum.length === 0 ? (
                      <Typography color="text.secondary">No curriculum yet.</Typography>
                    ) : (
                      <Box>
                        {curriculum.map((section, idx) => (
                          <Accordion
                            key={section.id}
                            defaultExpanded={idx === 0}
                            disableGutters
                            sx={{
                              mb: 1.5,
                              borderRadius: "20px !important",
                              overflow: "hidden",
                              border: "1px solid rgba(15,23,42,0.08)",
                              background: "#fff",
                              boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
                              "&:before": { display: "none" },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{
                                px: 2,
                                py: 0.5,
                                "& .MuiAccordionSummary-content": {
                                  my: 1.2,
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{ width: "100%", gap: 2 }}
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography fontWeight={900} sx={{ color: "#0f172a" }}>
                                    Section {idx + 1}: {section.title}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={`${section.lectures?.length || 0} lectures`}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    bgcolor: "rgba(15,23,42,0.05)",
                                    border: "1px solid rgba(15,23,42,0.06)",
                                  }}
                                />
                              </Stack>
                            </AccordionSummary>

                            <AccordionDetails sx={{ pt: 0, px: 1.5, pb: 1.5 }}>
                              <List dense sx={{ py: 0 }}>
                                {(section.lectures || []).map((lec, lIndex) => {
                                  const locked = lec.locked;
                                  const selected = activeLecture?.lecture?.id === lec.id;
                                  const duration = getLectureDurationMinutes(lec);

                                  return (
                                    <ListItemButton
                                      key={lec.id}
                                      onClick={() => playLecture(section, lec)}
                                      disabled={locked}
                                      selected={selected}
                                      sx={{
                                        borderRadius: "18px",
                                        px: 1.4,
                                        py: 1.2,
                                        mb: 1,
                                        alignItems: "center",
                                        border: selected
                                          ? "1px solid rgba(99,102,241,0.24)"
                                          : "1px solid rgba(15,23,42,0.06)",
                                        background: selected
                                          ? "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))"
                                          : "#fff",
                                        boxShadow: selected
                                          ? "0 10px 22px rgba(99,102,241,0.12)"
                                          : "none",
                                        "&.Mui-selected": {
                                          background:
                                            "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))",
                                        },
                                      }}
                                    >
                                      <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Box
                                          sx={{
                                            width: 30,
                                            height: 30,
                                            borderRadius: "10px",
                                            display: "grid",
                                            placeItems: "center",
                                            background: locked
                                              ? "rgba(15,23,42,0.06)"
                                              : "rgba(99,102,241,0.1)",
                                            color: locked ? "#94a3b8" : "#4f46e5",
                                          }}
                                        >
                                          {locked ? (
                                            <LockIcon sx={{ fontSize: 16 }} />
                                          ) : (
                                            <PlayArrowIcon sx={{ fontSize: 18 }} />
                                          )}
                                        </Box>
                                      </ListItemIcon>

                                      <ListItemText
                                        primary={
                                          <Stack spacing={0.9}>
                                            <Stack
                                              direction="row"
                                              spacing={1}
                                              alignItems="center"
                                              flexWrap="wrap"
                                            >
                                              <Typography
                                                fontWeight={850}
                                                sx={{ fontSize: 14 }}
                                                color={locked ? "text.disabled" : "text.primary"}
                                              >
                                                {lIndex + 1}. {lec.title}
                                              </Typography>

                                              {lec.is_preview && (
                                                <Chip
                                                  label="Preview"
                                                  size="small"
                                                  sx={{
                                                    height: 22,
                                                    fontSize: 11,
                                                    fontWeight: 900,
                                                    borderRadius: "999px",
                                                    color: "#047857",
                                                    bgcolor: "rgba(16,185,129,0.12)",
                                                    border: "1px solid rgba(16,185,129,0.22)",
                                                  }}
                                                />
                                              )}

                                              {duration ? (
                                                <Chip
                                                  label={`${duration} min`}
                                                  size="small"
                                                  sx={{
                                                    height: 22,
                                                    fontSize: 11,
                                                    fontWeight: 800,
                                                    borderRadius: "999px",
                                                    bgcolor: "rgba(15,23,42,0.05)",
                                                    border: "1px solid rgba(15,23,42,0.06)",
                                                  }}
                                                />
                                              ) : null}
                                            </Stack>

                                            {locked ? (
                                              <Typography fontSize={12} color="text.disabled">
                                                Locked — enroll to watch
                                              </Typography>
                                            ) : null}
                                          </Stack>
                                        }
                                      />

                                      {lectureQuizzes[lec.id] && isEnrolled && (
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          component={RouterLink}
                                          to={`/student/quiz/${lectureQuizzes[lec.id].id}`}
                                          onClick={(e) => e.stopPropagation()}
                                          sx={{
                                            ml: 1,
                                            textTransform: "none",
                                            fontWeight: 900,
                                            borderRadius: "999px",
                                            px: 1.8,
                                            whiteSpace: "nowrap",
                                            borderColor: "rgba(99,102,241,0.28)",
                                            color: "#4f46e5",
                                            bgcolor: "rgba(99,102,241,0.04)",
                                            "&:hover": {
                                              borderColor: "#6366f1",
                                              bgcolor: "rgba(99,102,241,0.08)",
                                            },
                                          }}
                                        >
                                          Take Quiz
                                        </Button>
                                      )}
                                    </ListItemButton>
                                  );
                                })}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>
                    )}

                    <Divider sx={{ my: 3 }} />

                    <Box>
                      <Typography fontWeight={950} sx={{ mb: 0.8, color: "#0f172a" }}>
                        Downloadable resources
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        PDFs and extra materials attached to the course.
                      </Typography>

                      {!isEnrolled ? (
                        <Box
                          sx={{
                            borderRadius: "18px",
                            border: "1px dashed rgba(15,23,42,0.12)",
                            p: 2,
                            background: "rgba(248,250,252,0.7)",
                          }}
                        >
                          <Typography color="text.secondary">
                            Enroll to access PDFs and downloadable resources.
                          </Typography>
                        </Box>
                      ) : resources.length > 0 ? (
                        <Stack spacing={1.1}>
                          {resources.map((pdf) => (
                            <Box
                              key={pdf.id}
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1.2,
                                justifyContent: "space-between",
                                alignItems: "center",
                                border: "1px solid rgba(15,23,42,0.08)",
                                borderRadius: "18px",
                                px: 1.6,
                                py: 1.4,
                                bgcolor: "#fff",
                                boxShadow: "0 6px 18px rgba(15,23,42,0.03)",
                              }}
                            >
                              <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "12px",
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "rgba(239,68,68,0.08)",
                                  }}
                                >
                                  <PictureAsPdfIcon sx={{ color: "#ef4444" }} />
                                </Box>
                                <Typography
                                  fontWeight={800}
                                  fontSize={14}
                                  sx={{
                                    color: "#0f172a",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {pdf.title}
                                </Typography>
                              </Stack>

                              <Button
                                size="small"
                                href={pdf.file_url}
                                target="_blank"
                                sx={{
                                  textTransform: "none",
                                  fontWeight: 900,
                                  borderRadius: "999px",
                                  px: 1.8,
                                  color: "#4f46e5",
                                  bgcolor: "rgba(99,102,241,0.06)",
                                  "&:hover": {
                                    bgcolor: "rgba(99,102,241,0.1)",
                                  },
                                }}
                              >
                                Open
                              </Button>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box
                          sx={{
                            borderRadius: "18px",
                            border: "1px dashed rgba(15,23,42,0.12)",
                            p: 2,
                            background: "rgba(248,250,252,0.7)",
                          }}
                        >
                          <Typography color="text.secondary">No PDFs added yet.</Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                )}
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              lg={4.5}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-start",   // 🔥 ADD THIS
              }}
            >
              <Card
                sx={{
                  width: "100%",
                  maxWidth: 380,
                  borderRadius: "28px",
                  overflow: "hidden",
                  position: "sticky",
                  top: 92,
                  border: "1px solid rgba(15,23,42,0.08)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.97))",
                  boxShadow: "0 16px 50px rgba(15,23,42,0.08)",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    p: 2.5,
                    borderBottom: "1px solid rgba(15,23,42,0.06)",
                    background:
                      "linear-gradient(180deg, rgba(250,250,255,0.95), rgba(245,243,255,0.82))",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -22,
                      right: -22,
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      background: "rgba(139,92,246,0.12)",
                      filter: "blur(24px)",
                    }}
                  />

                  <Stack direction="row" alignItems="center" spacing={1.2} sx={{ position: "relative", zIndex: 1 }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "14px",
                        display: "grid",
                        placeItems: "center",
                        background: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(99,102,241,0.12))",
                        border: "1px solid rgba(124,58,237,0.15)",
                      }}
                    >
                      <MenuBookRoundedIcon sx={{ color: "#6d28d9" }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={950} fontSize={18} color="#0f172a">
                        Learning Panel
                      </Typography>
                      <Typography fontSize={12.5} color="text.secondary" fontWeight={600}>
                        Your active lesson and course roadmap
                      </Typography>
                    </Box>
                  </Stack>

                  {activeLecture?.lecture && (
                    <>
                      <Box
                        sx={{
                          mt: 2.2,
                          p: 1.6,
                          borderRadius: "22px",
                          background:
                            "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))",
                          border: "1px solid rgba(99,102,241,0.18)",
                          position: "relative",
                          zIndex: 1,
                        }}
                      >
                        <Typography fontSize={12} color="text.secondary" sx={{ mb: 1 }}>
                          Now Playing
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: "12px",
                              display: "grid",
                              placeItems: "center",
                              background: "rgba(255,255,255,0.7)",
                            }}
                          >
                            <GraphicEqIcon
                              sx={{
                                fontSize: 22,
                                color: "#6366f1",
                                animation: isActuallyPlaying
                                  ? "equalizerPulse 1.1s infinite ease-in-out"
                                  : "none",
                              }}
                            />
                          </Box>

                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              fontWeight={900}
                              fontSize={14}
                              sx={{
                                color: "#0f172a",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {activeLecture.lecture.title}
                            </Typography>

                            <Typography
                              fontSize={12}
                              color="text.secondary"
                              sx={{
                                mt: 0.4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {activeLecture.sectionTitle}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              px: 1,
                              py: 0.45,
                              fontSize: 11,
                              fontWeight: 900,
                              borderRadius: "999px",
                              background: "#6366f1",
                              color: "#fff",
                              flexShrink: 0,
                            }}
                          >
                            Playing
                          </Box>
                        </Box>
                      </Box>

                      {activeLecture?.lecture?.scheduled_time && !countdown?.ready && (
                        <Box
                          sx={{
                            mt: 1.5,
                            p: 1.6,
                            borderRadius: "20px",
                            background:
                              "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(99,102,241,0.12))",
                            border: "1px solid rgba(124,58,237,0.18)",
                            textAlign: "center",
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "0.78rem",
                              color: "#6b7280",
                              fontWeight: 800,
                              mb: 1.1,
                            }}
                          >
                            Session starts in
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            {[
                              { label: "D", value: countdown?.days },
                              { label: "H", value: countdown?.hours },
                              { label: "M", value: countdown?.minutes },
                              { label: "S", value: countdown?.seconds },
                            ].map((t, i) => (
                              <Box
                                key={i}
                                sx={{
                                  minWidth: 56,
                                  px: 1,
                                  py: 1,
                                  borderRadius: "14px",
                                  background: "rgba(255,255,255,0.9)",
                                  border: "1px solid rgba(99,102,241,0.18)",
                                  boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                }}
                              >
                                <Typography fontWeight={950} fontSize={15}>
                                  {String(t.value ?? 0).padStart(2, "0")}
                                </Typography>
                                <Typography fontSize={10} color="text.secondary" fontWeight={700}>
                                  {t.label}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}

                      {activeLecture?.lecture && (countdown?.ready || activeLecture?.lecture?.is_live) && (
                        <Button
                          fullWidth
                          disabled={
                            !activeLecture?.lecture?.is_live &&
                            !(activeLecture?.lecture?.scheduled_time && countdown?.ready)
                          }
                          sx={{
                            mt: 1.6,
                            borderRadius: "18px",
                            py: 1.3,
                            px: 2,
                            textTransform: "none",
                            fontWeight: 900,
                            fontSize: "0.96rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.1,
                            transition: "all 0.22s ease",
                            position: "relative",
                            zIndex: 1,

                            ...(activeLecture?.lecture?.is_live
                              ? {
                                color: "#b91c1c",
                                background:
                                  "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(254,242,242,0.98) 100%)",
                                border: "1px solid rgba(239,68,68,0.18)",
                                boxShadow: "0 12px 28px rgba(239,68,68,0.11)",
                              }
                              : {
                                color: "#6b7280",
                                background: "#f3f4f6",
                                border: "1px solid #E5E7EB",
                              }),
                          }}
                          onClick={async () => {
                            try {
                              const res = await API.post(
                                `/api/lectures/${activeLecture.lecture.id}/join-live/`
                              );

                              window.open(res.data.join_url, "_blank");
                            } catch (err) {
                              console.error("Join live failed", err);

                              if (err.response?.data?.detail === "Meeting not started") {
                                setLivePopup("not_started");
                              } else {
                                setLivePopup("expired");
                              }

                              fetchLectureStatus(activeLecture.lecture.id);
                            }
                          }}
                        >
                          <Box
                            sx={{
                              width: 11,
                              height: 11,
                              borderRadius: "50%",
                              bgcolor: activeLecture?.lecture?.is_live ? "#ef4444" : "#9ca3af",
                              boxShadow: activeLecture?.lecture?.is_live
                                ? "0 0 0 5px rgba(239,68,68,0.14)"
                                : "none",
                            }}
                          />
                          {activeLecture?.lecture?.is_live
                            ? "Join Live Session"
                            : "Live session not started"}
                        </Button>
                      )}
                    </>
                  )}
                </Box>

                <Box sx={{ p: 2.2, maxHeight: 470, overflowY: "auto" }}>
                  <Typography
                    fontSize={12}
                    fontWeight={950}
                    sx={{ mb: 1.4, letterSpacing: 0.7, color: "#64748b" }}
                  >
                    COURSE CONTENT
                  </Typography>

                  {curriculum.map((section, sIndex) => (
                    <Box key={section.id} sx={{ mb: 2 }}>
                      <Typography
                        fontWeight={900}
                        fontSize={13.5}
                        sx={{ mb: 0.9, color: "#0f172a" }}
                      >
                        Section {sIndex + 1}: {section.title}
                      </Typography>

                      {(section.lectures || []).map((lec, lIndex) => {
                        const locked = lec.locked;
                        const selected = activeLecture?.lecture?.id === lec.id;
                        const duration = getLectureDurationMinutes(lec);

                        return (
                          <Box
                            key={lec.id}
                            onClick={() => playLecture(section, lec)}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.1,
                              px: 1.1,
                              py: 1.05,
                              mb: 0.7,
                              borderRadius: "16px",
                              cursor: locked ? "not-allowed" : "pointer",
                              bgcolor: selected
                                ? "rgba(99,102,241,0.1)"
                                : "rgba(255,255,255,0.72)",
                              border: selected
                                ? "1px solid rgba(99,102,241,0.22)"
                                : "1px solid rgba(15,23,42,0.05)",
                              opacity: locked ? 0.52 : 1,
                              transition: "all .2s ease",
                              boxShadow: selected
                                ? "0 8px 18px rgba(99,102,241,0.1)"
                                : "none",
                              "&:hover": {
                                bgcolor: locked
                                  ? "rgba(255,255,255,0.72)"
                                  : "rgba(99,102,241,0.07)",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: "10px",
                                display: "grid",
                                placeItems: "center",
                                background: selected
                                  ? "rgba(99,102,241,0.14)"
                                  : "rgba(15,23,42,0.05)",
                                color: locked ? "#94a3b8" : "#4f46e5",
                                flexShrink: 0,
                              }}
                            >
                              {locked ? (
                                <LockIcon sx={{ fontSize: 16 }} />
                              ) : selected ? (
                                <RadioButtonCheckedRoundedIcon sx={{ fontSize: 16 }} />
                              ) : (
                                <PlayArrowIcon sx={{ fontSize: 18 }} />
                              )}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                fontSize={13}
                                fontWeight={800}
                                sx={{
                                  color: "#0f172a",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {lIndex + 1}. {lec.title}
                              </Typography>
                            </Box>

                            {duration && (
                              <Typography
                                fontSize={11}
                                color="text.secondary"
                                fontWeight={700}
                                sx={{ flexShrink: 0 }}
                              >
                                {duration} min
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  ))}
                </Box>

                <Divider />

                <Box sx={{ p: 2.2 }}>
                  <Typography
                    fontWeight={950}
                    fontSize={12}
                    sx={{ mb: 1.4, letterSpacing: 0.7, color: "#64748b" }}
                  >
                    RESOURCES
                  </Typography>

                  {!isEnrolled ? (
                    <Typography fontSize={12.5} color="text.secondary">
                      Enroll to access PDFs
                    </Typography>
                  ) : resources.length > 0 ? (
                    <Stack spacing={1}>
                      {resources.map((pdf) => (
                        <Button
                          key={pdf.id}
                          href={pdf.file_url}
                          target="_blank"
                          startIcon={<PictureAsPdfIcon />}
                          fullWidth
                          sx={{
                            justifyContent: "flex-start",
                            textTransform: "none",
                            fontWeight: 800,
                            borderRadius: "16px",
                            px: 1.4,
                            py: 1.1,
                            border: "1px solid rgba(15,23,42,0.07)",
                            color: "#0f172a",
                            bgcolor: "#fff",
                            boxShadow: "0 6px 16px rgba(15,23,42,0.03)",
                            "&:hover": {
                              bgcolor: "#f9fafb",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {pdf.title}
                          </Box>
                        </Button>
                      ))}
                    </Stack>
                  ) : (
                    <Typography fontSize={12.5} color="text.secondary">
                      No resources yet
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Dialog
            open={Boolean(livePopup)}
            onClose={() => setLivePopup(false)}
            PaperProps={{
              sx: {
                borderRadius: "26px",
                p: 1,
                textAlign: "center",
                background: "rgba(255, 255, 255, 0.82)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.42)",
                boxShadow: "0 24px 70px rgba(15,23,42,0.16)",
                minWidth: { xs: 300, sm: 400 },
              },
            }}
          >
            <DialogContent sx={{ pt: 3 }}>
              <Box sx={{ mb: 1.8 }}>
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: "20px",
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(239,68,68,0.05))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    boxShadow: "0 10px 24px rgba(239,68,68,0.18)",
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: "#ef4444",
                    }}
                  />
                </Box>
              </Box>

              <Typography
                fontWeight={950}
                sx={{ mb: 0.7, fontSize: "1.16rem", letterSpacing: -0.2, color: "#0f172a" }}
              >
                {livePopup === "not_started"
                  ? "Live Session Not Started"
                  : "Meeting Expired"}
              </Typography>

              <Typography
                color="text.secondary"
                fontSize={14}
                sx={{ maxWidth: 320, mx: "auto", lineHeight: 1.7 }}
              >
                {livePopup === "not_started"
                  ? "The instructor hasn’t started the session yet."
                  : "This meeting has ended and is no longer available."}
              </Typography>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
              <Button
                onClick={() => setLivePopup(false)}
                sx={{
                  borderRadius: "999px",
                  px: 3.8,
                  py: 1.1,
                  textTransform: "none",
                  fontWeight: 900,
                  color: "#fff",
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  boxShadow: "0 12px 28px rgba(99,102,241,0.34)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  },
                }}
              >
                Got it
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>

      {isEnrolled && (
        <CourseChatbot
          courseId={course?.id}
          lectureTitle={activeLecture?.lecture?.title}
        />
      )}

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseReviewMenu}
        PaperProps={{
          sx: {
            borderRadius: "14px",
            minWidth: 140,
            boxShadow: "0 14px 30px rgba(15,23,42,0.12)",
          },
        }}
      >
        <MenuItem onClick={handleEditReview} sx={{ fontWeight: 700 }}>
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDeleteReview}
          sx={{ fontWeight: 700, color: "#dc2626" }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ mb: 2, ml: 2 }}
      >
        <Alert
          onClose={handleSnackbarClose}
          variant="filled"
          severity={snackbar.severity}
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
    </>
  );
}