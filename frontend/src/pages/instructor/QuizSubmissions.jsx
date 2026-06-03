import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../lib/api";

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
    Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PendingRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GradingRoundedIcon from "@mui/icons-material/FactCheckRounded";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";

export default function QuizSubmissions() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [attempts, setAttempts] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSubmissions = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await API.get(`/api/assessments/${quizId}/submissions/`);
            const subs = res.data.submissions || [];

            subs.sort((a, b) => {
                if (a.status === b.status) {
                    return new Date(b.submitted_at || 0) - new Date(a.submitted_at || 0);
                }
                return a.status === "PENDING" ? -1 : 1;
            });

            setAttempts(subs);

            setPendingCount(
                res.data.pending_count ??
                subs.filter((x) => x.status === "PENDING").length
            );
        } catch {
            setError("Failed to load quiz submissions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubmissions();
    }, [quizId]);

    const gradedCount = useMemo(
        () => attempts.filter((a) => a.status === "GRADED").length,
        [attempts]
    );

    const statusChip = (status) => {
        const pending = status === "PENDING";

        return (
            <Chip
                icon={pending ? <PendingRoundedIcon /> : <CheckCircleRoundedIcon />}
                label={pending ? "Pending" : "Graded"}
                sx={{
                    fontWeight: 800,
                    bgcolor: pending
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(22,163,74,0.10)",
                    color: pending ? "#b45309" : "#15803d",
                    border: `1px solid ${pending ? "rgba(245,158,11,0.18)" : "rgba(22,163,74,0.18)"}`,
                }}
            />
        );
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "72vh",
                    display: "grid",
                    placeItems: "center",
                    background: "linear-gradient(180deg, #fcfcff, #f8fafc)",
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress sx={{ color: "#6366f1" }} />
                    <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
                        Loading submissions...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: 5,
                px: 2,
                background:
                    "radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 20%), radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 18%), linear-gradient(180deg, #fbfcff, #f8fafc)",
            }}
        >
            <Container maxWidth="xl">
                <Stack spacing={4}>

                    {/* HERO HEADER */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            borderRadius: "32px",
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.86), rgba(255,255,255,0.66))",
                            backdropFilter: "blur(16px)",
                            border: "1px solid rgba(255,255,255,0.7)",
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            spacing={3}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: "20px",
                                        background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                                    }}
                                >
                                    <QuizRoundedIcon sx={{ fontSize: 34 }} />
                                </Avatar>

                                <Box>
                                    <Typography fontWeight={900} fontSize={28}>
                                        Quiz Submissions
                                    </Typography>

                                    <Typography color="text.secondary">
                                        Quiz ID: {quizId}
                                    </Typography>

                                    <Stack direction="row" spacing={1} mt={1}>
                                        <Chip icon={<AutoAwesomeRoundedIcon />} label="Instructor View" />
                                        <Chip icon={<AssignmentTurnedInRoundedIcon />} label={`${attempts.length} Attempts`} />
                                    </Stack>
                                </Box>
                            </Stack>

                            <Button
                                startIcon={<ArrowBackRoundedIcon />}
                                onClick={() => navigate("/instructor/quizzes")}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderRadius: "14px",
                                    px: 2.5,
                                    bgcolor: "rgba(99,102,241,0.1)",
                                    color: "#6366f1",
                                }}
                            >
                                Back
                            </Button>
                        </Stack>
                    </Paper>

                    {/* STATS */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <StatCard label="Pending" value={pendingCount} color="#f59e0b" />
                        <StatCard label="Graded" value={gradedCount} color="#16a34a" />
                    </Stack>

                    {error && <Alert severity="error">{error}</Alert>}

                    {!error && attempts.length === 0 && (
                        <Paper sx={{ p: 5, textAlign: "center", borderRadius: "20px" }}>
                            <Typography>No submissions yet</Typography>
                        </Paper>
                    )}

                    {/* SUBMISSIONS */}
                    <Stack spacing={2.5}>
                        {attempts.map((a) => {
                            const isPending = a.status === "PENDING";

                            return (
                                <Paper
                                    key={a.attempt_id}
                                    sx={{
                                        p: 3,
                                        borderRadius: "24px",
                                        background:
                                            "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))",
                                        border: "1px solid rgba(255,255,255,0.7)",
                                        transition: "0.3s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                        },
                                    }}
                                >
                                    <Stack spacing={2}>
                                        <Stack
                                            direction={{ xs: "column", md: "row" }}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", md: "center" }}
                                        >
                                            <Box>
                                                <Typography fontWeight={800}>
                                                    {a.student}
                                                </Typography>

                                                <Typography color="text.secondary">
                                                    {a.submitted_at
                                                        ? new Date(a.submitted_at).toLocaleString()
                                                        : "N/A"}
                                                </Typography>

                                                {a.status === "GRADED" && (
                                                    <Typography mt={0.5}>
                                                        Score: <strong>{a.score}</strong>
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Stack direction="row" spacing={1.5}>
                                                {statusChip(a.status)}

                                                {isPending ? (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<GradingRoundedIcon />}
                                                        onClick={() =>
                                                            navigate(
                                                                `/instructor/quizzes/${quizId}/grade?attemptId=${a.attempt_id}`
                                                            )
                                                        }
                                                        sx={{
                                                            textTransform: "none",
                                                            borderRadius: "14px",
                                                            background:
                                                                "linear-gradient(135deg,#6366f1,#7c3aed)",
                                                        }}
                                                    >
                                                        Grade
                                                    </Button>
                                                ) : (
                                                    <Button disabled>Completed</Button>
                                                )}
                                            </Stack>
                                        </Stack>

                                        <Divider />

                                        <Typography variant="caption" color="text.secondary">
                                            Attempt ID: {a.attempt_id}
                                        </Typography>
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}

/* SMALL STAT CARD */
function StatCard({ label, value, color }) {
    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: "18px",
                flex: 1,
                border: "1px solid #e5e7eb",
            }}
        >
            <Typography color="text.secondary">{label}</Typography>
            <Typography fontSize={28} fontWeight={900} sx={{ color }}>
                {value}
            </Typography>
        </Paper>
    );
}