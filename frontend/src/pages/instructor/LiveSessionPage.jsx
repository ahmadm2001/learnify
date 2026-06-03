// src/pages/instructor/LiveSessionPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../lib/api";
import {
    Box,
    Container,
    Typography,
    Card,
    Button,
    Stack,
    Chip,
    CircularProgress,
    Avatar,
    Divider,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import StopCircleRoundedIcon from "@mui/icons-material/StopCircleRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";

export default function LiveSessionPage() {
    const { lectureId } = useParams();
    const navigate = useNavigate();

    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);
    const [ending, setEnding] = useState(false);

    const loadLecture = async () => {
        try {
            const res = await API.get(`/api/lectures/${lectureId}/`);
            setLecture(res.data);
        } catch (err) {
            console.error("Failed to load live session", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLecture();
    }, [lectureId]);

    const handleStartSession = async () => {
        try {
            setStarting(true);

            const res = await API.post(`/api/lectures/${lectureId}/start-live/`);
            await loadLecture();

            if (res.data?.start_url) {
                window.open(res.data.start_url, "_blank");
            }
        } catch (err) {
            console.error("Failed to start session", err);
        } finally {
            setStarting(false);
        }
    };

    const handleEndSession = async () => {
        try {
            setEnding(true);

            await API.post(`/api/lectures/${lectureId}/end-live/`);

            setTimeout(() => {
                navigate("/instructor/courses");
            }, 500);
        } catch (err) {
            console.error("Failed to end session", err);
        } finally {
            setEnding(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "#f3f4f6",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const pulseKeyframes = `
@keyframes livePulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
    box-shadow: 0 0 0 0 rgba(239,68,68,0.6);
  }
  70% {
    transform: scale(1.2);
    opacity: 1;
    box-shadow: 0 0 0 12px rgba(239,68,68,0);
  }
  100% {
    transform: scale(0.8);
    opacity: 0.6;
    box-shadow: 0 0 0 0 rgba(239,68,68,0);
  }
}
`;

    const blinkKeyframes = `
@keyframes liveBlink {
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
}
`;

    return (

        <>
            <style>{pulseKeyframes + blinkKeyframes}</style>
            <Box
                sx={{
                    minHeight: "100vh",
                    py: { xs: 3, md: 5 },
                    px: { xs: 1.5, md: 0 },
                    background:
                        "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 22%), linear-gradient(180deg, #ffffff 0%, #faf7ff 40%, #f3ecff 100%)",
                }}
            >
                <Container maxWidth="md">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate("/instructor/courses")}
                        sx={{
                            textTransform: "none",
                            mb: 2,
                            fontWeight: 700,
                            color: "#6366f1",
                        }}
                    >
                        Back
                    </Button>

                    <Card
                        sx={{
                            borderRadius: "30px",
                            p: { xs: 2.5, md: 4 },
                            border: "1px solid rgba(124,58,237,0.12)",
                            boxShadow: "0 24px 60px rgba(17,24,39,0.08)",
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(250,247,255,0.98) 100%)",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        {/* Decorative blur circles */}
                        <Box
                            sx={{
                                position: "absolute",
                                top: -50,
                                right: -40,
                                width: 170,
                                height: 170,
                                borderRadius: "50%",
                                bgcolor: "rgba(124,58,237,0.08)",
                                filter: "blur(10px)",
                            }}
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: -60,
                                left: -40,
                                width: 180,
                                height: 180,
                                borderRadius: "50%",
                                bgcolor: "rgba(99,102,241,0.06)",
                                filter: "blur(10px)",
                            }}
                        />

                        <Stack spacing={3.2} sx={{ position: "relative", zIndex: 1 }}>
                            {/* Header */}
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        width: 68,
                                        height: 68,
                                        bgcolor: "rgba(124,58,237,0.12)",
                                        color: "#7c3aed",
                                        boxShadow: "0 8px 24px rgba(124,58,237,0.12)",
                                    }}
                                >
                                    <VideocamRoundedIcon sx={{ fontSize: 34 }} />
                                </Avatar>

                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 900,
                                            color: "#111827",
                                            lineHeight: 1.15,
                                            letterSpacing: -0.4,
                                        }}
                                    >
                                        Live Session
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: "#6b7280",
                                            mt: 0.8,
                                            lineHeight: 1.7,
                                            maxWidth: 620,
                                        }}
                                    >
                                        Start, manage, and control your live teaching session from one
                                        premium workspace.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider />

                            {/* Status Section */}
                            <Box
                                sx={{
                                    p: 2.8,
                                    borderRadius: "22px",
                                    border: "1px solid rgba(124,58,237,0.12)",
                                    bgcolor: lecture?.is_live
                                        ? "rgba(239,68,68,0.05)"
                                        : "rgba(107,114,128,0.05)",
                                }}
                            >
                                <Stack spacing={1.4}>
                                    <Typography
                                        sx={{
                                            fontWeight: 900,
                                            color: "#111827",
                                            fontSize: "1.08rem",
                                        }}
                                    >
                                        Session Status
                                    </Typography>

                                    <Chip
                                        icon={
                                            lecture?.is_live ? (
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        bgcolor: "#ef4444",
                                                        animation: "livePulse 1.5s infinite",
                                                        mr: 0.5,
                                                    }}
                                                />
                                            ) : (
                                                <RadioButtonCheckedRoundedIcon
                                                    sx={{ color: "#9ca3af !important" }}
                                                />
                                            )
                                        }
                                        label={
                                            lecture?.is_live ? (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                    LIVE
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            animation: "liveBlink 1.2s infinite",
                                                            fontWeight: 900,
                                                        }}
                                                    >
                                                        NOW
                                                    </Box>
                                                </Box>
                                            ) : (
                                                "Session is Not Active"
                                            )
                                        }
                                        sx={{
                                            width: "fit-content",
                                            borderRadius: "999px",
                                            fontWeight: 800,
                                            bgcolor: lecture?.is_live
                                                ? "rgba(239,68,68,0.12)"
                                                : "rgba(107,114,128,0.12)",
                                            border: lecture?.is_live
                                                ? "1px solid rgba(239,68,68,0.20)"
                                                : "1px solid rgba(107,114,128,0.20)",
                                            color: lecture?.is_live ? "#b91c1c" : "#4b5563",
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            color: "#6b7280",
                                            lineHeight: 1.8,
                                        }}
                                    >
                                        {lecture?.is_live
                                            ? "Your live session is currently active. Students can join from their course page right now."
                                            : "No live session is active right now. Start a session whenever you are ready to begin teaching."}
                                    </Typography>
                                </Stack>
                            </Box>

                            {/* Main Live Controls */}
                            <Box
                                sx={{
                                    p: 2.8,
                                    borderRadius: "22px",
                                    border: "1px solid rgba(124,58,237,0.10)",
                                    bgcolor: "rgba(255,255,255,0.72)",
                                    boxShadow: "0 10px 30px rgba(17,24,39,0.03)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 900,
                                        color: "#111827",
                                        mb: 2,
                                        fontSize: "1.05rem",
                                    }}
                                >
                                    Live Controls
                                </Typography>

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={2}
                                    alignItems="stretch"
                                >
                                    <Button
                                        variant="contained"
                                        onClick={handleStartSession}
                                        disabled={starting || lecture?.is_live}
                                        startIcon={<VideocamRoundedIcon />}
                                        sx={{
                                            flex: 1,
                                            py: 1.45,
                                            borderRadius: "999px",
                                            textTransform: "none",
                                            fontWeight: 800,
                                            fontSize: "1rem",
                                            background:
                                                "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                                            boxShadow: "0 14px 30px rgba(124,58,237,0.28)",
                                            "&:hover": {
                                                background:
                                                    "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                                            },
                                            "&.Mui-disabled": {
                                                bgcolor: "rgba(124,58,237,0.18)",
                                                color: "rgba(255,255,255,0.8)",
                                            },
                                        }}
                                    >
                                        {starting ? "Starting Session..." : "Start Session"}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        onClick={handleEndSession}
                                        disabled={ending || !lecture?.is_live}
                                        startIcon={<StopCircleRoundedIcon />}
                                        sx={{
                                            flex: 1,
                                            py: 1.45,
                                            borderRadius: "999px",
                                            textTransform: "none",
                                            fontWeight: 800,
                                            fontSize: "1rem",
                                            color: "#dc2626",
                                            borderColor: "rgba(239,68,68,0.28)",
                                            bgcolor: "rgba(255,255,255,0.92)",
                                            "&:hover": {
                                                borderColor: "#ef4444",
                                                bgcolor: "rgba(254,242,242,0.8)",
                                            },
                                            "&.Mui-disabled": {
                                                borderColor: "rgba(107,114,128,0.18)",
                                                color: "rgba(107,114,128,0.5)",
                                            },
                                        }}
                                    >
                                        {ending ? "Ending Session..." : "End Session"}
                                    </Button>
                                </Stack>
                            </Box>

                            {/* Premium Separate Schedule Section */}
                            <Box
                                sx={{
                                    p: { xs: 2.6, md: 3 },
                                    borderRadius: "24px",
                                    background:
                                        "linear-gradient(135deg, rgba(99,102,241,0.07) 0%, rgba(124,58,237,0.05) 100%)",
                                    border: "1px solid rgba(99,102,241,0.18)",
                                    boxShadow: "0 18px 36px rgba(99,102,241,0.08)",
                                }}
                            >
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                bgcolor: "rgba(99,102,241,0.12)",
                                                color: "#6366f1",
                                            }}
                                        >
                                            <EventAvailableRoundedIcon />
                                        </Avatar>

                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 900,
                                                    color: "#111827",
                                                    fontSize: "1.08rem",
                                                }}
                                            >
                                                Schedule a Session
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: "#6b7280",
                                                    mt: 0.4,
                                                    lineHeight: 1.7,
                                                }}
                                            >
                                                Plan your next live class in advance with date and time
                                                scheduling.
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Typography
                                        sx={{
                                            color: "#6b7280",
                                            lineHeight: 1.8,
                                        }}
                                    >
                                        Use scheduling when you want to prepare your session before it
                                        starts. Students will only be able to join when the scheduled
                                        session becomes active.
                                    </Typography>

                                    <Box>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate(`/instructor/schedule/${lectureId}`)}
                                            disabled={lecture?.is_live}
                                            startIcon={<EventAvailableRoundedIcon />}
                                            sx={{
                                                py: 1.3,
                                                px: 2.6,
                                                borderRadius: "999px",
                                                textTransform: "none",
                                                fontWeight: 800,
                                                fontSize: "0.98rem",
                                                color: "#6366f1",
                                                borderColor: "rgba(99,102,241,0.30)",
                                                bgcolor: "rgba(255,255,255,0.82)",
                                                "&:hover": {
                                                    borderColor: "#6366f1",
                                                    bgcolor: "rgba(99,102,241,0.08)",
                                                },
                                                "&.Mui-disabled": {
                                                    borderColor: "rgba(107,114,128,0.18)",
                                                    color: "rgba(107,114,128,0.5)",
                                                },
                                            }}
                                        >
                                            Open Schedule Page
                                        </Button>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* How this works */}
                            <Box
                                sx={{
                                    p: 2.4,
                                    borderRadius: "18px",
                                    bgcolor: "rgba(99,102,241,0.06)",
                                    border: "1px solid rgba(99,102,241,0.12)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 900,
                                        color: "#111827",
                                        mb: 1,
                                    }}
                                >
                                    How this works
                                </Typography>

                                <Typography sx={{ color: "#6b7280", lineHeight: 1.8 }}>
                                    Click <strong>Start Session</strong> to create a live meeting and
                                    open it in Zoom. When you are done, return here and click{" "}
                                    <strong>End Session</strong>. This removes the saved meeting link
                                    from the backend and prevents students from joining again.
                                </Typography>
                            </Box>

                            {/* 🔥 NEW SECTION — VIEW SCHEDULED SESSIONS */}
                            <Box
                                sx={{
                                    mt: 1,
                                    p: { xs: 2.6, md: 3 },
                                    borderRadius: "22px",
                                    background:
                                        "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(99,102,241,0.08))",
                                    border: "1px solid rgba(124,58,237,0.18)",
                                    boxShadow: "0 16px 34px rgba(124,58,237,0.08)",
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    alignItems: { md: "center" },
                                    justifyContent: "space-between",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 900,
                                            color: "#111827",
                                            mb: 0.6,
                                            fontSize: "1.05rem",
                                        }}
                                    >
                                        Manage Scheduled Sessions
                                    </Typography>

                                    <Typography
                                        fontSize={14}
                                        color="text.secondary"
                                        sx={{ lineHeight: 1.7, maxWidth: 520 }}
                                    >
                                        View all your upcoming sessions, track countdown timers,
                                        and start meetings exactly when they become active.
                                    </Typography>
                                </Box>

                                <Button
                                    variant="outlined"
                                    onClick={() => navigate("/instructor/scheduled-sessions")}
                                    sx={{
                                        borderRadius: "999px",
                                        px: 3,
                                        py: 1.2,
                                        fontWeight: 800,
                                        textTransform: "none",
                                        borderColor: "#7c3aed",
                                        color: "#7c3aed",
                                        whiteSpace: "nowrap",
                                        "&:hover": {
                                            background: "rgba(124,58,237,0.08)",
                                            borderColor: "#6d28d9",
                                        },
                                    }}
                                >
                                    View Sessions
                                </Button>
                            </Box>

                            {/* Quick Tips */}
                            <Box
                                sx={{
                                    p: 2.4,
                                    borderRadius: "18px",
                                    bgcolor: "rgba(245,158,11,0.06)",
                                    border: "1px solid rgba(245,158,11,0.16)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 900,
                                        color: "#111827",
                                        mb: 1,
                                    }}
                                >
                                    Quick Tips
                                </Typography>

                                <Typography sx={{ color: "#6b7280", lineHeight: 1.85 }}>
                                    • Start a session only when you are ready to teach.
                                    <br />
                                    • End the session from this control page so the saved link is removed properly.
                                    <br />
                                    • Use scheduling when you want to plan a class for later instead of starting immediately.
                                </Typography>
                            </Box>

                        </Stack>
                    </Card>
                </Container>
            </Box>
        </>
    );
}