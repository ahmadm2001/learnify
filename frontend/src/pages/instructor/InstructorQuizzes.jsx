import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GradingRoundedIcon from "@mui/icons-material/GradingRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";

export default function InstructorQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;

        async function load() {
            setLoading(true);
            setError("");

            try {
                const res = await API.get("/api/instructor/quizzes/");
                if (!mounted) return;
                setQuizzes(res.data || []);
            } catch {
                if (!mounted) return;
                setError("Failed to load quizzes.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const total = useMemo(() => quizzes.length, [quizzes]);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "72vh",
                    display: "grid",
                    placeItems: "center",
                    px: 2,
                    background:
                        "radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 24%), radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 20%), linear-gradient(180deg, #fcfcff 0%, #f8fafc 100%)",
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress sx={{ color: "#6366f1" }} thickness={4} />
                    <Typography sx={{ color: "#64748b", fontWeight: 600 }}>
                        Loading quizzes...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 4, md: 5 },
                px: { xs: 2, md: 3 },
                background:
                    "radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 20%), radial-gradient(circle at top right, rgba(168,85,247,0.08), transparent 18%), radial-gradient(circle at bottom left, rgba(59,130,246,0.06), transparent 22%), linear-gradient(180deg, #fbfcff 0%, #f8fafc 100%)",
            }}
        >
            <Container maxWidth="xl">
                <Stack spacing={4}>
                    {/* HERO */}
                    <Paper
                        elevation={0}
                        sx={{
                            position: "relative",
                            overflow: "hidden",
                            p: { xs: 3, md: 4 },
                            borderRadius: "32px",
                            border: "1px solid rgba(255,255,255,0.72)",
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.64) 100%)",
                            backdropFilter: "blur(18px)",
                            boxShadow:
                                "0 24px 70px rgba(15, 23, 42, 0.06), 0 12px 32px rgba(99,102,241,0.10)",
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
                                    "radial-gradient(circle, rgba(99,102,241,0.18), rgba(99,102,241,0.00) 70%)",
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
                                    "radial-gradient(circle, rgba(168,85,247,0.12), rgba(168,85,247,0.00) 70%)",
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
                                    variant="rounded"
                                    sx={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: "22px",
                                        background:
                                            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                        boxShadow: "0 14px 32px rgba(99,102,241,0.28)",
                                    }}
                                >
                                    <QuizRoundedIcon sx={{ fontSize: 36 }} />
                                </Avatar>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: "1.8rem", md: "2.45rem" },
                                            lineHeight: 1.1,
                                            fontWeight: 900,
                                            color: "#0f172a",
                                        }}
                                    >
                                        Instructor Quizzes
                                    </Typography>

                                    <Typography
                                        sx={{
                                            mt: 1,
                                            color: "#64748b",
                                            fontSize: "1rem",
                                            maxWidth: 700,
                                            lineHeight: 1.8,
                                        }}
                                    >
                                        Manage quizzes, organize review workflows, and open student
                                        submissions from one clean premium workspace.
                                    </Typography>

                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1.2}
                                        useFlexGap
                                        flexWrap="wrap"
                                        sx={{ mt: 2.2 }}
                                    >
                                        <Chip
                                            icon={<AutoAwesomeRoundedIcon />}
                                            label="Instructor Workspace"
                                            sx={heroChipStyle}
                                        />
                                        <Chip
                                            icon={<ChecklistRoundedIcon />}
                                            label={`${total} Quizzes`}
                                            sx={heroChipStyle}
                                        />
                                        <Chip
                                            icon={<GradingRoundedIcon />}
                                            label="Review Submissions"
                                            sx={heroChipStyle}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    minWidth: { xs: "100%", sm: 220 },
                                    borderRadius: "24px",
                                    border: "1px solid rgba(99,102,241,0.12)",
                                    bgcolor: "rgba(99,102,241,0.06)",
                                }}
                            >
                                <Stack spacing={0.8}>
                                    <Typography
                                        sx={{
                                            color: "#6366f1",
                                            fontWeight: 800,
                                            fontSize: "0.9rem",
                                            letterSpacing: 0.3,
                                        }}
                                    >
                                        QUIZ OVERVIEW
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: "#0f172a",
                                            fontWeight: 900,
                                            fontSize: "2rem",
                                            lineHeight: 1,
                                        }}
                                    >
                                        {total}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: "#64748b",
                                            fontSize: "0.92rem",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        Total quizzes available in your instructor area.
                                    </Typography>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Paper>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                borderRadius: "18px",
                                fontWeight: 600,
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {!error && quizzes.length === 0 && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 4, md: 6 },
                                textAlign: "center",
                                borderRadius: "30px",
                                border: "1px solid rgba(255,255,255,0.72)",
                                background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%)",
                                backdropFilter: "blur(18px)",
                                boxShadow:
                                    "0 18px 50px rgba(15, 23, 42, 0.06), 0 10px 28px rgba(99, 102, 241, 0.06)",
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 78,
                                    height: 78,
                                    mx: "auto",
                                    mb: 2.5,
                                    background:
                                        "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.16))",
                                    color: "#6366f1",
                                }}
                            >
                                <QuizRoundedIcon sx={{ fontSize: 38 }} />
                            </Avatar>

                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    fontSize: "1.3rem",
                                    color: "#0f172a",
                                    mb: 1,
                                }}
                            >
                                No quizzes created
                            </Typography>

                            <Typography
                                sx={{
                                    color: "#64748b",
                                    maxWidth: 520,
                                    mx: "auto",
                                    lineHeight: 1.8,
                                }}
                            >
                                Create a quiz from your instructor tools and it will appear here
                                in this beautifully organized list.
                            </Typography>
                        </Paper>
                    )}

                    {!error && quizzes.length > 0 && (
                        <Stack spacing={2.4}>
                            {quizzes.map((q, index) => (
                                <Paper
                                    key={q.id}
                                    elevation={0}
                                    sx={{
                                        position: "relative",
                                        overflow: "hidden",
                                        p: { xs: 2.2, md: 3 },
                                        borderRadius: "28px",
                                        border: "1px solid rgba(255,255,255,0.72)",
                                        background:
                                            "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%)",
                                        backdropFilter: "blur(18px)",
                                        boxShadow:
                                            "0 18px 50px rgba(15, 23, 42, 0.06), 0 10px 28px rgba(99, 102, 241, 0.06)",
                                        transition: "all 0.28s ease",
                                        opacity: 0,
                                        transform: "translateY(20px)",
                                        animation: `fadeUp 0.55s ease ${index * 0.06}s forwards`,
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow:
                                                "0 26px 55px rgba(15, 23, 42, 0.08), 0 16px 35px rgba(99,102,241,0.10)",
                                        },
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
                                            background:
                                                "radial-gradient(circle, rgba(99,102,241,0.08), rgba(99,102,241,0.00) 70%)",
                                            pointerEvents: "none",
                                        }}
                                    />

                                    <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: "flex-start", md: "center" }}
                                        spacing={2.5}
                                        sx={{ position: "relative", zIndex: 1 }}
                                    >
                                        {/* LEFT */}
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            alignItems="flex-start"
                                            sx={{ flex: 1, minWidth: 0 }}
                                        >
                                            <Avatar
                                                variant="rounded"
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: "18px",
                                                    background:
                                                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                                    boxShadow: "0 12px 26px rgba(99,102,241,0.22)",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <QuizRoundedIcon />
                                            </Avatar>

                                            <Box sx={{ minWidth: 0, width: "100%" }}>
                                                <Stack
                                                    direction={{ xs: "column", sm: "row" }}
                                                    spacing={1}
                                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                                    justifyContent="space-between"
                                                    sx={{ mb: 0.5 }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 800,
                                                            fontSize: { xs: "1rem", md: "1.12rem" },
                                                            color: "#0f172a",
                                                        }}
                                                    >
                                                        Quiz #{String(index + 1).padStart(2, "0")}
                                                    </Typography>

                                                    <Chip
                                                        label={`Quiz ID: ${q.id}`}
                                                        size="small"
                                                        sx={idChipStyle}
                                                    />
                                                </Stack>

                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    useFlexGap
                                                    flexWrap="wrap"
                                                    sx={{ mt: 1.2 }}
                                                >
                                                    <Chip
                                                        icon={<SchoolRoundedIcon />}
                                                        label={q.course}
                                                        sx={metaChipStyle}
                                                    />

                                                    <Chip
                                                        icon={<MenuBookRoundedIcon />}
                                                        label={q.lecture}
                                                        sx={metaChipStyle}
                                                    />
                                                </Stack>

                                                <Divider
                                                    sx={{
                                                        my: 2,
                                                        borderColor: "rgba(148,163,184,0.14)",
                                                    }}
                                                />

                                                <Typography
                                                    sx={{
                                                        color: "#64748b",
                                                        fontSize: "0.95rem",
                                                        lineHeight: 1.8,
                                                    }}
                                                >
                                                    Review student attempts and manage quiz
                                                    submissions from this quiz workspace.
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {/* RIGHT */}
                                        <Button
                                            variant="contained"
                                            startIcon={<VisibilityRoundedIcon />}
                                            endIcon={<ArrowOutwardRoundedIcon />}
                                            onClick={() =>
                                                navigate(`/instructor/quizzes/${q.id}/submissions`)
                                            }
                                            sx={{
                                                textTransform: "none",
                                                fontWeight: 800,
                                                borderRadius: "16px",
                                                px: 2.6,
                                                py: 1.2,
                                                minWidth: { xs: "100%", md: "auto" },
                                                background:
                                                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                                boxShadow: "0 12px 24px rgba(99,102,241,0.22)",
                                                "&:hover": {
                                                    background:
                                                        "linear-gradient(135deg, #5558eb 0%, #7c3aed 100%)",
                                                    boxShadow: "0 16px 30px rgba(99,102,241,0.28)",
                                                },
                                            }}
                                        >
                                            View Submissions
                                        </Button>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Container>

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
        </Box>
    );
}

const heroChipStyle = {
    borderRadius: "999px",
    fontWeight: 700,
    color: "#374151",
    bgcolor: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(148,163,184,0.16)",
    "& .MuiChip-icon": {
        color: "#6366f1",
    },
};

const idChipStyle = {
    fontWeight: 700,
    color: "#475569",
    bgcolor: "rgba(148,163,184,0.10)",
    border: "1px solid rgba(148,163,184,0.14)",
    borderRadius: "999px",
};

const metaChipStyle = {
    fontWeight: 700,
    color: "#334155",
    bgcolor: "rgba(255,255,255,0.82)",
    border: "1px solid rgba(148,163,184,0.16)",
    "& .MuiChip-icon": {
        color: "#6366f1",
    },
};