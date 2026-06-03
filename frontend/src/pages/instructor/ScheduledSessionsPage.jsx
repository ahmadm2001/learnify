import { useEffect, useMemo, useState } from "react";
import API from "../../lib/api";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Card,
    Button,
    Stack,
    Chip,
    Tabs,
    Tab,
    CircularProgress,
    Divider,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from "@mui/material";

import ScheduleIcon from "@mui/icons-material/Schedule";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function ScheduledSessionsPage() {
    const [sessions, setSessions] = useState([]);
    const [tab, setTab] = useState(0);
    const [now, setNow] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [startingId, setStartingId] = useState(null);

    const [editOpen, setEditOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [timeFormat, setTimeFormat] = useState("12h");
    const [editForm, setEditForm] = useState({
        scheduled_time: "",
        end_time: "",
        duration_minutes: "",
    });
    const [successPopup, setSuccessPopup] = useState({
        open: false,
        message: "",
    });

    const [errorPopup, setErrorPopup] = useState({
        open: false,
        message: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        loadSessions();

        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const res = await API.get("/api/instructor/scheduled/");
            setSessions(res.data || []);
        } catch (err) {
            console.error("Failed to load scheduled sessions", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (session) => {
        const start = new Date(session.scheduled_time);
        const end = new Date(session.end_time);

        if (now < start) return "upcoming";
        if (now >= start && now <= end) return "ready";
        return "expired";
    };

    const getCountdown = (session) => {
        const start = new Date(session.scheduled_time);
        const diff = start - now;

        if (diff <= 0) return null;

        const totalSeconds = Math.floor(diff / 1000);

        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => String(num).padStart(2, "0");

        return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    const formatSessionTime = (value) => {
        const date = new Date(value);

        return date.toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const formatForInput = (value) => {
        if (!value) return "";

        const date = new Date(value);
        const pad = (n) => String(n).padStart(2, "0");

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const { upcoming, ready, expired } = useMemo(() => {
        const upcoming = [];
        const ready = [];
        const expired = [];

        sessions.forEach((s) => {
            const status = getStatus(s);

            if (status === "upcoming") upcoming.push(s);
            else if (status === "ready") ready.push(s);
            else expired.push(s);
        });

        return { upcoming, ready, expired };
    }, [sessions, now]);

    const currentList = tab === 0 ? upcoming : tab === 1 ? ready : expired;

    const handleStartSession = async (session) => {
        try {
            setStartingId(session.id);

            const res = await API.post(`/api/lectures/${session.id}/start-live/`);

            if (res.data?.start_url) {
                window.open(res.data.start_url, "_blank");
            }

            navigate(`/instructor/live-session/${session.id}`);
        } catch (err) {
            console.error("Failed to start session", err);
            setErrorPopup({
                open: true,
                message: "Failed to start session",
            });
        } finally {
            setStartingId(null);
        }
    };



    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setDeleteOpen(true);
    };

    const handleDeleteCancel = () => {
        setDeleteOpen(false);
        setDeleteId(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            await API.delete(`/api/lectures/${deleteId}/delete-session/`);
            await loadSessions();

            setDeleteOpen(false);
            setDeleteId(null);
        } catch (err) {
            console.error("Delete failed", err);
            setErrorPopup({
                open: true,
                message: "Failed to delete session",
            });
        }
    };

    const handleEdit = (session) => {
        setSelectedSession(session);
        setEditForm({
            scheduled_time: formatForInput(session.scheduled_time),
            end_time: formatForInput(session.end_time),
            duration_minutes: session.duration_minutes || "",
        });
        setEditOpen(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateSession = async () => {
        if (!selectedSession) return;

        try {
            const payload = {
                scheduled_time: editForm.scheduled_time,
                end_time: editForm.end_time,
            };

            await API.patch(
                `/api/lectures/${selectedSession.id}/update-session/`,
                payload
            );

            setEditOpen(false);
            setSelectedSession(null);
            await loadSessions();

            setSuccessPopup({
                open: true,
                message: "Session updated successfully",
            });
        } catch (err) {
            console.error("Update failed", err);
            setErrorPopup({
                open: true,
                message: err.response?.data?.detail || "Failed to update session",
            });
        }
    };

    const getStatusConfig = (status) => {
        const map = {
            upcoming: {
                label: "Upcoming",
                bg: "rgba(124,58,237,0.10)",
                color: "#7c3aed",
                border: "1px solid rgba(124,58,237,0.18)",
                accent: "linear-gradient(180deg, #8b5cf6 0%, #6366f1 100%)",
                softShadow: "0 16px 40px rgba(124,58,237,0.10)",
                icon: <ScheduleIcon sx={{ fontSize: 17 }} />,
            },
            ready: {
                label: "Ready",
                bg: "rgba(34,197,94,0.12)",
                color: "#16a34a",
                border: "1px solid rgba(34,197,94,0.18)",
                accent: "linear-gradient(180deg, #22c55e 0%, #16a34a 100%)",
                softShadow: "0 16px 40px rgba(34,197,94,0.10)",
                icon: <PlayCircleIcon sx={{ fontSize: 17 }} />,
            },
            expired: {
                label: "Expired",
                bg: "rgba(239,68,68,0.10)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.18)",
                accent: "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
                softShadow: "0 16px 40px rgba(239,68,68,0.08)",
                icon: <AccessTimeIcon sx={{ fontSize: 17 }} />,
            },
        };

        return map[status];
    };

    const renderStatusChip = (status) => {
        const cfg = getStatusConfig(status);

        return (
            <Chip
                icon={cfg.icon}
                label={cfg.label}
                sx={{
                    width: "fit-content",
                    borderRadius: "999px",
                    fontWeight: 800,
                    bgcolor: cfg.bg,
                    color: cfg.color,
                    border: cfg.border,
                    px: 0.5,
                    "& .MuiChip-icon": {
                        color: cfg.color,
                        ml: 0.7,
                    },
                }}
            />
        );
    };

    const renderStatsCard = (title, count, color, border, icon) => (
        <Card
            sx={{
                flex: 1,
                p: 2.2,
                borderRadius: "14px",
                border,
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(255,255,255,0.75))",
                backdropFilter: "blur(12px)",
                boxShadow: "0 14px 34px rgba(17,24,39,0.05)",
                transition: "all .22s ease",
                "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 18px 40px rgba(17,24,39,0.08)",
                },
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                    sx={{
                        bgcolor: color,
                        color: "#fff",
                        width: 46,
                        height: 46,
                        boxShadow: "0 10px 24px rgba(17,24,39,0.10)",
                    }}
                >
                    {icon}
                </Avatar>

                <Box>
                    <Typography fontSize={13} color="text.secondary" sx={{ mb: 0.2 }}>
                        {title}
                    </Typography>
                    <Typography fontWeight={900} fontSize={24} sx={{ lineHeight: 1 }}>
                        {count}
                    </Typography>
                </Box>
            </Stack>
        </Card>
    );

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    display: "grid",
                    placeItems: "center",
                    background:
                        "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 30%), linear-gradient(180deg, #ffffff 0%, #faf7ff 40%, #f3ecff 100%)",
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress />
                    <Typography color="text.secondary">
                        Loading scheduled sessions...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    const getDuration = (session) => {
        if (!session.scheduled_time || !session.end_time) return 0;

        const start = new Date(session.scheduled_time);
        const end = new Date(session.end_time);

        const diffMs = end - start;
        const minutes = Math.floor(diffMs / (1000 * 60));

        return minutes;
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 3, md: 5 },
                background:
                    "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 30%), radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 25%), linear-gradient(180deg, #ffffff 0%, #faf7ff 40%, #f3ecff 100%)",
            }}
        >
            <Container maxWidth="lg">
                {/* HERO */}
                <Card
                    sx={{
                        mb: 3,
                        p: { xs: 2.5, md: 3.5 },
                        borderRadius: "10px",
                        border: "1px solid rgba(124,58,237,0.12)",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(250,247,255,0.98) 100%)",
                        boxShadow: "0 24px 60px rgba(17,24,39,0.06)",
                        overflow: "hidden",
                        position: "relative",
                        backdropFilter: "blur(14px)",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            right: -40,
                            top: -40,
                            width: 190,
                            height: 190,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(124,58,237,0.18), rgba(124,58,237,0.02))",
                            filter: "blur(8px)",
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            left: -60,
                            bottom: -60,
                            width: 200,
                            height: 200,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(99,102,241,0.12), rgba(99,102,241,0.02))",
                            filter: "blur(10px)",
                        }}
                    />

                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        sx={{ position: "relative", zIndex: 1 }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: "rgba(124,58,237,0.12)",
                                    color: "#7c3aed",
                                    boxShadow: "0 12px 28px rgba(124,58,237,0.14)",
                                }}
                            >
                                <VideocamRoundedIcon />
                            </Avatar>

                            <Box>
                                <Typography
                                    variant="h4"
                                    fontWeight={900}
                                    sx={{ letterSpacing: -0.6 }}
                                >
                                    Scheduled Sessions
                                </Typography>

                                <Typography color="text.secondary" sx={{ mt: 0.8 }}>
                                    Manage, track, and start your scheduled live sessions from one
                                    polished dashboard.
                                </Typography>
                            </Box>
                        </Stack>

                        <Button
                            variant="outlined"
                            onClick={() => navigate("/instructor/courses")}
                            sx={{
                                textTransform: "none",
                                fontWeight: 800,
                                borderRadius: "999px",
                                px: 2.6,
                                py: 1.1,
                                borderColor: "rgba(124,58,237,0.20)",
                                color: "#5b21b6",
                                background: "rgba(255,255,255,0.72)",
                                "&:hover": {
                                    borderColor: "rgba(124,58,237,0.30)",
                                    background: "rgba(124,58,237,0.05)",
                                },
                            }}
                        >
                            Back to courses
                        </Button>
                    </Stack>
                </Card>

                {/* STATS */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    {renderStatsCard(
                        "Upcoming",
                        upcoming.length,
                        "#8b5cf6",
                        "1px solid rgba(124,58,237,0.12)",
                        <EventAvailableRoundedIcon />
                    )}
                    {renderStatsCard(
                        "Ready",
                        ready.length,
                        "#22c55e",
                        "1px solid rgba(34,197,94,0.12)",
                        <CheckCircleRoundedIcon />
                    )}
                    {renderStatsCard(
                        "Expired",
                        expired.length,
                        "#ef4444",
                        "1px solid rgba(239,68,68,0.12)",
                        <HistoryRoundedIcon />
                    )}
                </Stack>

                {/* TABS */}
                <Card
                    sx={{
                        p: 1,
                        mb: 3,
                        borderRadius: "12px",
                        border: "1px solid rgba(124,58,237,0.10)",
                        background: "rgba(255,255,255,0.78)",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 10px 30px rgba(17,24,39,0.04)",
                    }}
                >
                    <Tabs
                        value={tab}
                        onChange={(e, v) => setTab(v)}
                        sx={{
                            "& .MuiTabs-indicator": { display: "none" },
                            minHeight: "unset",
                        }}
                    >
                        <Tab
                            icon={<ScheduleIcon />}
                            iconPosition="start"
                            label={`Upcoming (${upcoming.length})`}
                            sx={{
                                borderRadius: "999px",
                                textTransform: "none",
                                fontWeight: 800,
                                minHeight: 48,
                                mr: 1,
                                px: 2,
                                "&.Mui-selected": {
                                    bgcolor: "rgba(124,58,237,0.12)",
                                    color: "#7c3aed",
                                },
                            }}
                        />
                        <Tab
                            icon={<PlayCircleIcon />}
                            iconPosition="start"
                            label={`Ready (${ready.length})`}
                            sx={{
                                borderRadius: "999px",
                                textTransform: "none",
                                fontWeight: 800,
                                minHeight: 48,
                                mr: 1,
                                px: 2,
                                "&.Mui-selected": {
                                    bgcolor: "rgba(34,197,94,0.12)",
                                    color: "#16a34a",
                                },
                            }}
                        />
                        <Tab
                            icon={<AccessTimeIcon />}
                            iconPosition="start"
                            label={`Expired (${expired.length})`}
                            sx={{
                                borderRadius: "999px",
                                textTransform: "none",
                                fontWeight: 800,
                                minHeight: 48,
                                px: 2,
                                "&.Mui-selected": {
                                    bgcolor: "rgba(239,68,68,0.12)",
                                    color: "#ef4444",
                                },
                            }}
                        />
                    </Tabs>
                </Card>

                {/* EMPTY STATE */}
                {currentList.length === 0 && (
                    <Card
                        sx={{
                            p: 4,
                            borderRadius: "12px",
                            textAlign: "center",
                            border: "1px dashed rgba(124,58,237,0.18)",
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(250,247,255,0.97))",
                        }}
                    >
                        <Typography fontWeight={900} sx={{ mb: 1 }}>
                            No sessions here
                        </Typography>
                        <Typography color="text.secondary">
                            There are no sessions in this tab right now.
                        </Typography>
                    </Card>
                )}


                {/* LIST */}
                <Stack spacing={2.4}>
                    {currentList.map((s) => {
                        const status = getStatus(s);
                        const countdown = getCountdown(s);
                        const cfg = getStatusConfig(status);

                        return (
                            <Card
                                key={s.id}
                                sx={{
                                    p: { xs: 2.5, md: 3 },
                                    borderRadius: "30px",
                                    position: "relative",
                                    overflow: "hidden",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(124,58,237,0.15)",
                                    boxShadow: cfg.softShadow,
                                    transition: "all 0.25s ease",
                                    "&:hover": {
                                        transform: "translateY(-5px)",
                                        boxShadow:
                                            status === "ready"
                                                ? "0 24px 60px rgba(34,197,94,0.16)"
                                                : status === "upcoming"
                                                    ? "0 24px 60px rgba(124,58,237,0.16)"
                                                    : "0 24px 60px rgba(239,68,68,0.12)",
                                    },
                                    "&::before": {
                                        content: '""',
                                        position: "absolute",
                                        left: 0,
                                        top: 24,
                                        bottom: 24,
                                        width: 5,
                                        borderRadius: "0 12px 12px 0",
                                        background: cfg.accent,
                                    },
                                }}
                            >
                                <Stack spacing={2.5}>
                                    {/* HEADER */}
                                    <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "flex-start", md: "center" }}
                                        spacing={1.5}
                                    >
                                        <Box sx={{ pl: { xs: 1.2, md: 1.5 } }}>
                                            <Typography
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: "1.35rem",
                                                    letterSpacing: "-0.5px",
                                                    mb: 0.4,
                                                    color: "#111827",
                                                }}
                                            >
                                                {s.title || "Course"}
                                            </Typography>

                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <FiberManualRecordRoundedIcon
                                                    sx={{ fontSize: 10, color: cfg.color }}
                                                />
                                                <Typography fontSize={13} color="text.secondary">
                                                    Live session
                                                </Typography>
                                            </Stack>

                                            <Typography mt={0.5} color="text.secondary">
                                                {formatSessionTime(s.scheduled_time)}
                                            </Typography>
                                        </Box>

                                        {renderStatusChip(status)}
                                    </Stack>

                                    <Divider />

                                    {/* MAIN CONTENT */}
                                    <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        spacing={2}
                                    >
                                        {/* LEFT SIDE */}
                                        <Box sx={{ pl: { xs: 1.2, md: 1.5 } }}>
                                            <Typography
                                                fontSize={13}
                                                color="text.secondary"
                                                fontWeight={700}
                                                mb={0.4}
                                            >
                                                Session duration
                                            </Typography>

                                            <Typography fontWeight={900} fontSize="1.1rem">
                                                {getDuration(s)} minutes
                                            </Typography>

                                            {status === "ready" && (
                                                <Typography mt={0.5} fontSize={13} color="#16a34a" fontWeight={700}>
                                                    This session is ready to start now.
                                                </Typography>
                                            )}

                                            {status === "expired" && (
                                                <Typography mt={0.5} fontSize={13} color="#ef4444" fontWeight={700}>
                                                    This session time window has ended.
                                                </Typography>
                                            )}
                                        </Box>

                                        {/* RIGHT SIDE */}
                                        <Stack alignItems="flex-end" spacing={1.5} sx={{ minWidth: 170 }}>
                                            {/* COUNTDOWN */}
                                            {status === "upcoming" && countdown && (
                                                <Box
                                                    sx={{
                                                        px: 2,
                                                        py: 1.2,
                                                        borderRadius: "14px",
                                                        background: "#f3f4f6",
                                                        border: "1px solid #e5e7eb",
                                                        width: "100%",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    <Typography fontSize={12} color="text.secondary">
                                                        Starts in
                                                    </Typography>

                                                    <Typography fontWeight={900} fontSize={16}>
                                                        {countdown}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* DIVIDER */}
                                            {status === "upcoming" && (
                                                <Box
                                                    sx={{
                                                        width: "100%",
                                                        height: "1px",
                                                        background:
                                                            "linear-gradient(to right, transparent, #e5e7eb, transparent)",
                                                    }}
                                                />
                                            )}

                                            {/* ACTION BUTTONS */}
                                            {(status === "upcoming" || status === "expired") && (
                                                <Stack direction="row" spacing={1}>

                                                    {/* EDIT only for upcoming */}
                                                    {status === "upcoming" && (
                                                        <Button
                                                            startIcon={<EditOutlinedIcon sx={{ fontSize: 18 }} />}
                                                            onClick={() => handleEdit(s)}
                                                            sx={{
                                                                borderRadius: "999px",
                                                                textTransform: "none",
                                                                fontWeight: 700,
                                                                px: 2.5,
                                                                py: 1,
                                                                color: "#6b7280",
                                                                border: "1px solid #e5e7eb",
                                                                "&:hover": {
                                                                    borderColor: "#7c3aed",
                                                                    color: "#7c3aed",
                                                                    background: "rgba(124,58,237,0.05)",
                                                                },
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                    )}

                                                    {/* DELETE for BOTH upcoming + expired */}
                                                    <Button
                                                        startIcon={<DeleteOutlineIcon sx={{ fontSize: 18 }} />}
                                                        onClick={() => handleDeleteClick(s.id)}
                                                        sx={{
                                                            borderRadius: "999px",
                                                            textTransform: "none",
                                                            fontWeight: 700,
                                                            px: 2.5,
                                                            py: 1,
                                                            color: "#ef4444",
                                                            border: "1px solid #fecaca",
                                                            "&:hover": {
                                                                borderColor: "#ef4444",
                                                                background: "rgba(239,68,68,0.05)",
                                                            },
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </Stack>
                                            )}

                                            {/* READY BUTTON */}
                                            {status === "ready" && (
                                                <Button
                                                    disabled={startingId === s.id}
                                                    onClick={() => handleStartSession(s)}
                                                    sx={{
                                                        borderRadius: "999px",
                                                        fontWeight: 800,
                                                        px: 3,
                                                        py: 1.2,
                                                        color: "#fff",
                                                        background: "#16a34a",
                                                        "&:hover": {
                                                            background: "#15803d",
                                                        },
                                                    }}
                                                >
                                                    {startingId === s.id ? "Starting..." : "Start Session"}
                                                </Button>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>
            </Container>
            <Dialog
                open={deleteOpen}
                onClose={handleDeleteCancel}
                PaperProps={{
                    sx: {
                        borderRadius: "22px",
                        p: 0,
                        width: 400,
                        overflow: "hidden",
                        boxShadow: "0 30px 80px rgba(0,0,0,0.15)",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: "blur(6px)",
                        backgroundColor: "rgba(0,0,0,0.3)",
                    },
                }}
            >
                {/* HEADER */}
                <Box sx={{ p: 3, pb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "12px",
                                background: "rgba(239,68,68,0.1)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {/* warning icon */}
                            <Typography sx={{ color: "#ef4444", fontWeight: 900 }}>
                                !
                            </Typography>
                        </Box>

                        <Typography fontWeight={900} fontSize={18}>
                            Delete Session
                        </Typography>
                    </Stack>
                </Box>

                {/* CONTENT */}
                <DialogContent sx={{ px: 3, pt: 1 }}>
                    <Typography color="text.secondary" fontSize={14}>
                        This action cannot be undone. This will permanently delete your Scheduled Session.
                    </Typography>
                </DialogContent>

                {/* ACTIONS */}
                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                    }}
                >
                    {/* CANCEL */}
                    <Button
                        onClick={handleDeleteCancel}
                        sx={{
                            borderRadius: "999px",
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#6b7280",
                            px: 2.5,
                        }}
                    >
                        Cancel
                    </Button>

                    {/* DELETE */}
                    <Button
                        onClick={handleDeleteConfirm}
                        sx={{
                            borderRadius: "999px",
                            textTransform: "none",
                            fontWeight: 800,
                            px: 2.8,
                            py: 1.1,
                            color: "#fff",
                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                            boxShadow: "0 8px 20px rgba(239,68,68,0.25)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                            },
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "22px",
                        p: 2,
                        width: 400,
                    },
                }}
            >
                <DialogTitle>Edit Session</DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>

                        <TextField
                            label="Start Time"
                            type="datetime-local"
                            name="scheduled_time"
                            value={editForm.scheduled_time}
                            onChange={handleEditChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="End Time"
                            type="datetime-local"
                            name="end_time"
                            value={editForm.end_time}
                            onChange={handleEditChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handleUpdateSession}
                        variant="contained"
                    >
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={successPopup.open}
                onClose={() => setSuccessPopup({ open: false, message: "" })}
                PaperProps={{
                    sx: {
                        borderRadius: "20px",
                        p: 2,
                        width: 380,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, color: "#16a34a" }}>
                    Success
                </DialogTitle>

                <DialogContent>
                    <Typography color="text.secondary">
                        {successPopup.message}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setSuccessPopup({ open: false, message: "" })}
                        sx={{
                            borderRadius: "999px",
                            fontWeight: 700,
                            textTransform: "none",
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={errorPopup.open}
                onClose={() => setErrorPopup({ open: false, message: "" })}
                PaperProps={{
                    sx: {
                        borderRadius: "20px",
                        p: 2,
                        width: 380,
                    },
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, color: "#ef4444" }}>
                    Error
                </DialogTitle>

                <DialogContent>
                    <Typography color="text.secondary">
                        {errorPopup.message}
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setErrorPopup({ open: false, message: "" })}
                        sx={{
                            borderRadius: "999px",
                            fontWeight: 700,
                            textTransform: "none",
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}