import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../lib/api";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CommentRoundedIcon from "@mui/icons-material/CommentRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

export default function StudentAssignmentDetail() {
    const { assignmentId } = useParams();

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [submittedFileUrl, setSubmittedFileUrl] = useState(null);
    const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
    const [openUnsubmitDialog, setOpenUnsubmitDialog] = useState(false);
    const [grade, setGrade] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const isGraded = grade !== null;
    const isExpired =
        assignment?.due_date && new Date(assignment.due_date) < new Date();

    useEffect(() => {
        API.get(`/api/student/assignments/${assignmentId}/`)
            .then((res) => {
                setAssignment(res.data);
                setSubmitted(res.data.submitted);
                setSubmittedFileUrl(res.data.submission_file);
                setGrade(res.data.grade);
                setFeedback(res.data.feedback || "");
            })
            .catch(() => alert("Failed to load assignment"))
            .finally(() => setLoading(false));
    }, [assignmentId]);

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            setSubmitting(true); // 🔥 START LOADING

            await API.post(`/api/assignments/${assignmentId}/submit/`, formData);

            const res = await API.get(`/api/student/assignments/${assignmentId}/`);
            setSubmitted(res.data.submitted);
            setSubmittedFileUrl(res.data.submission_file);
            setGrade(res.data.grade);
            setFeedback(res.data.feedback || "");
            setFile(null);
            setOpenSubmitDialog(false);

        } catch {
            alert("Submission failed");
        } finally {
            setSubmitting(false); // 🔥 STOP LOADING
        }
    };

    const handleUnsubmit = async () => {
        try {
            await API.delete(`/api/assignments/${assignmentId}/unsubmit/`);

            setSubmitted(false);
            setSubmittedFileUrl(null);
            setFile(null);
            setOpenUnsubmitDialog(false);
        } catch {
            alert("Failed to unsubmit");
        }
    };

    const formatDateTime = (date) => {
        if (!date) return "No due date";
        return new Date(date).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
    };

    const getFileName = (path) => {
        if (!path) return "File";
        return path.split("/").pop();
    };

    const getFileIcon = (fileNameOrType = "") => {
        const value = fileNameOrType.toLowerCase();
        if (value.includes("pdf")) {
            return (
                <PictureAsPdfRoundedIcon
                    sx={{ color: "#ef4444", fontSize: 30 }}
                />
            );
        }
        return (
            <InsertDriveFileRoundedIcon
                sx={{ color: "#6366f1", fontSize: 30 }}
            />
        );
    };

    const submissionStatus = useMemo(() => {
        if (submitted) {
            return {
                label: "Submitted",
                color: "#16a34a",
                bg: "rgba(22, 163, 74, 0.10)",
                border: "rgba(22, 163, 74, 0.20)",
                icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
            };
        }

        if (isExpired) {
            return {
                label: "Missing",
                color: "#dc2626",
                bg: "rgba(220, 38, 38, 0.10)",
                border: "rgba(220, 38, 38, 0.18)",
                icon: <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />
            };
        }

        return {
            label: "Assigned",
            color: "#475569",
            bg: "rgba(71, 85, 105, 0.10)",
            border: "rgba(71, 85, 105, 0.16)",
            icon: <AssignmentOutlinedIcon sx={{ fontSize: 18 }} />
        };
    }, [submitted, isExpired]);

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "70vh",
                    display: "grid",
                    placeItems: "center",
                    px: 2,
                    background:
                        "radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 28%), radial-gradient(circle at top right, rgba(236,72,153,0.08), transparent 24%), linear-gradient(180deg, #fcfcff 0%, #f8fafc 100%)"
                }}
            >
                <Stack spacing={2} alignItems="center">
                    <CircularProgress thickness={4} />
                    <Typography color="text.secondary" fontWeight={500}>
                        Loading assignment details...
                    </Typography>
                </Stack>
            </Box>
        );
    }

    if (!assignment) {
        return (
            <Box
                sx={{
                    maxWidth: 900,
                    mx: "auto",
                    mt: 6,
                    px: 2
                }}
            >
                <Paper
                    sx={{
                        p: 4,
                        borderRadius: "28px",
                        textAlign: "center",
                        border: "1px solid rgba(148,163,184,0.18)",
                        boxShadow: "0 20px 60px rgba(15, 23, 42, 0.06)"
                    }}
                >
                    <Typography variant="h5" fontWeight={700} mb={1}>
                        Assignment not found
                    </Typography>
                    <Typography color="text.secondary">
                        We couldn’t load this assignment. Please try again.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 3, md: 5 },
                background:
                    "radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 22%), radial-gradient(circle at top right, rgba(168,85,247,0.10), transparent 20%), radial-gradient(circle at bottom right, rgba(59,130,246,0.08), transparent 25%), linear-gradient(180deg, #fbfcff 0%, #f8fafc 100%)"
            }}
        >
            <Box sx={{ maxWidth: "1320px", mx: "auto" }}>
                <Stack spacing={4}>
                    {/* HERO SECTION */}
                    <Paper
                        elevation={0}
                        sx={{
                            position: "relative",
                            overflow: "hidden",
                            borderRadius: "32px",
                            p: { xs: 2.5, md: 4 },
                            border: "1px solid rgba(255,255,255,0.7)",
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.60) 100%)",
                            backdropFilter: "blur(20px)",
                            boxShadow:
                                "0 24px 80px rgba(99, 102, 241, 0.10), 0 8px 30px rgba(15, 23, 42, 0.06)"
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                width: 220,
                                height: 220,
                                borderRadius: "50%",
                                top: -80,
                                right: -70,
                                background:
                                    "radial-gradient(circle, rgba(99,102,241,0.18), rgba(99,102,241,0.00) 70%)"
                            }}
                        />
                        <Box
                            sx={{
                                position: "absolute",
                                width: 220,
                                height: 220,
                                borderRadius: "50%",
                                bottom: -90,
                                left: -60,
                                background:
                                    "radial-gradient(circle, rgba(236,72,153,0.12), rgba(236,72,153,0.00) 70%)"
                            }}
                        />

                        <Stack
                            direction={{ xs: "column", md: "row" }}
                            spacing={3}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            sx={{ position: "relative", zIndex: 1 }}
                        >
                            <Stack direction="row" spacing={2.2} alignItems="flex-start">
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        width: 68,
                                        height: 68,
                                        borderRadius: "22px",
                                        background:
                                            "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                        boxShadow: "0 12px 30px rgba(99,102,241,0.30)"
                                    }}
                                >
                                    <AssignmentOutlinedIcon sx={{ fontSize: 34 }} />
                                </Avatar>

                                <Box>
                                    <Typography
                                        variant="overline"
                                        sx={{
                                            letterSpacing: 1.2,
                                            color: "#6366f1",
                                            fontWeight: 800
                                        }}
                                    >
                                        Assignment Details
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: { xs: "1.65rem", md: "2.4rem" },
                                            lineHeight: 1.15,
                                            fontWeight: 800,
                                            color: "#0f172a",
                                            mb: 1
                                        }}
                                    >
                                        {assignment.title}
                                    </Typography>

                                    <Stack
                                        direction={{ xs: "column", sm: "row" }}
                                        spacing={1.2}
                                        useFlexGap
                                        flexWrap="wrap"
                                    >
                                        <Chip
                                            icon={<SchoolRoundedIcon />}
                                            label={assignment.course_title}
                                            sx={chipSoftStyle}
                                        />
                                        <Chip
                                            icon={<PersonRoundedIcon />}
                                            label={assignment.teacher_name}
                                            sx={chipSoftStyle}
                                        />
                                        <Chip
                                            icon={<WorkspacePremiumRoundedIcon />}
                                            label={`${assignment.points} points`}
                                            sx={chipSoftStyle}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>

                            <Paper
                                elevation={0}
                                sx={{
                                    minWidth: { xs: "100%", md: 260 },
                                    p: 2.2,
                                    borderRadius: "24px",
                                    border: `1px solid ${submissionStatus.border}`,
                                    background: submissionStatus.bg
                                }}
                            >
                                <Stack spacing={1.2}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        justifyContent="space-between"
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Box sx={{ color: submissionStatus.color, display: "flex" }}>
                                                {submissionStatus.icon}
                                            </Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    color: submissionStatus.color
                                                }}
                                            >
                                                {submissionStatus.label}
                                            </Typography>
                                        </Stack>

                                        {isGraded && (
                                            <Chip
                                                label={`${grade} / ${assignment.points}`}
                                                sx={{
                                                    height: 28,
                                                    fontWeight: 800,
                                                    color: "#1e293b",
                                                    bgcolor: "rgba(255,255,255,0.72)",
                                                    border: "1px solid rgba(148,163,184,0.20)"
                                                }}
                                            />
                                        )}
                                    </Stack>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <AccessTimeRoundedIcon
                                            sx={{ fontSize: 18, color: "#64748b" }}
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#475569", fontWeight: 600 }}
                                        >
                                            Due {formatDateTime(assignment.due_date)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Stack>
                    </Paper>

                    {/* MAIN CONTENT */}
                    <Stack
                        direction={{ xs: "column", lg: "row" }}
                        spacing={3}
                        alignItems="flex-start"
                    >
                        {/* LEFT COLUMN */}
                        <Box flex={1.6} width="100%">
                            <Stack spacing={3}>
                                <Paper sx={glassCardStyle}>
                                    <Stack spacing={2.2}>
                                        <Typography sx={sectionTitleStyle}>
                                            Instructions
                                        </Typography>
                                        <Divider />
                                        <Typography
                                            sx={{
                                                color: "#475569",
                                                lineHeight: 1.85,
                                                fontSize: "0.98rem",
                                                whiteSpace: "pre-line"
                                            }}
                                        >
                                            {assignment.instructions ||
                                                "No instructions provided."}
                                        </Typography>
                                    </Stack>
                                </Paper>

                                {assignment.attachment && (
                                    <Paper sx={glassCardStyle}>
                                        <Stack spacing={2.2}>
                                            <Typography sx={sectionTitleStyle}>
                                                Assignment Files
                                            </Typography>
                                            <Divider />
                                            <Paper sx={fileItemStyle}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1.8}
                                                    alignItems="center"
                                                >
                                                    <Avatar
                                                        variant="rounded"
                                                        sx={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: "16px",
                                                            bgcolor: "rgba(99,102,241,0.10)"
                                                        }}
                                                    >
                                                        {getFileIcon(assignment.attachment)}
                                                    </Avatar>

                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            fontWeight={700}
                                                            sx={{
                                                                color: "#0f172a",
                                                                wordBreak: "break-word"
                                                            }}
                                                        >
                                                            {getFileName(assignment.attachment)}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: "#64748b" }}
                                                        >
                                                            Instructor attachment
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <Button
                                                    href={assignment.attachment}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    variant="contained"
                                                    sx={primaryButtonMiniStyle}
                                                >
                                                    View File
                                                </Button>
                                            </Paper>
                                        </Stack>
                                    </Paper>
                                )}

                                <Paper sx={glassCardStyle}>
                                    <Stack spacing={2.2}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            <CommentRoundedIcon sx={{ color: "#6366f1" }} />
                                            <Typography sx={sectionTitleStyle}>
                                                Class Comments
                                            </Typography>
                                        </Stack>

                                        <Divider />

                                        <TextField
                                            placeholder="Write a comment for the class..."
                                            fullWidth
                                            multiline
                                            rows={4}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: "18px",
                                                    bgcolor: "rgba(255,255,255,0.75)"
                                                }
                                            }}
                                        />

                                        <Stack direction="row" justifyContent="flex-end">
                                            <Button
                                                variant="contained"
                                                sx={primaryButtonMiniStyle}
                                            >
                                                Post Comment
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Box>

                        {/* RIGHT COLUMN */}
                        <Box flex={1} width="100%">
                            <Stack spacing={3}>
                                <Paper sx={glassCardStyle}>
                                    <Stack spacing={2.4}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Typography sx={sectionTitleStyle}>
                                                Your Work
                                            </Typography>

                                            <Chip
                                                label={submissionStatus.label}
                                                sx={{
                                                    fontWeight: 700,
                                                    color: submissionStatus.color,
                                                    bgcolor: submissionStatus.bg,
                                                    border: `1px solid ${submissionStatus.border}`
                                                }}
                                            />
                                        </Stack>

                                        <Divider />

                                        {submitted ? (
                                            <Alert
                                                icon={<CheckCircleRoundedIcon fontSize="inherit" />}
                                                severity="success"
                                                sx={{
                                                    borderRadius: "18px",
                                                    fontWeight: 600
                                                }}
                                            >
                                                Your assignment has been submitted successfully.
                                            </Alert>
                                        ) : isExpired ? (
                                            <Alert
                                                icon={<WarningAmberRoundedIcon fontSize="inherit" />}
                                                severity="error"
                                                sx={{
                                                    borderRadius: "18px",
                                                    fontWeight: 600
                                                }}
                                            >
                                                This assignment is past the due date.
                                            </Alert>
                                        ) : (
                                            <Alert
                                                severity="info"
                                                sx={{
                                                    borderRadius: "18px",
                                                    fontWeight: 600
                                                }}
                                            >
                                                Upload your file and submit before the deadline.
                                            </Alert>
                                        )}

                                        {!submitted && !isExpired && (
                                            <Button
                                                variant="outlined"
                                                component="label"
                                                startIcon={<CloudUploadRoundedIcon />}
                                                fullWidth
                                                sx={{
                                                    borderRadius: "18px",
                                                    py: 1.5,
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                    borderColor: "rgba(99,102,241,0.28)",
                                                    color: "#4f46e5",
                                                    bgcolor: "rgba(99,102,241,0.03)",
                                                    "&:hover": {
                                                        borderColor: "#6366f1",
                                                        bgcolor: "rgba(99,102,241,0.07)"
                                                    }
                                                }}
                                            >
                                                Add or Create
                                                <input
                                                    hidden
                                                    type="file"
                                                    onChange={(e) =>
                                                        setFile(e.target.files?.[0] || null)
                                                    }
                                                />
                                            </Button>
                                        )}

                                        {submitted && submittedFileUrl && (
                                            <Paper sx={fileItemStyle}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1.8}
                                                    alignItems="center"
                                                >
                                                    <Avatar
                                                        variant="rounded"
                                                        sx={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: "16px",
                                                            bgcolor: "rgba(239,68,68,0.10)"
                                                        }}
                                                    >
                                                        <PictureAsPdfRoundedIcon
                                                            sx={{
                                                                color: "#ef4444",
                                                                fontSize: 28
                                                            }}
                                                        />
                                                    </Avatar>

                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            fontWeight={700}
                                                            sx={{
                                                                color: "#0f172a",
                                                                wordBreak: "break-word"
                                                            }}
                                                        >
                                                            Submitted file
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: "#64748b" }}
                                                        >
                                                            Open your uploaded submission
                                                        </Typography>
                                                    </Box>
                                                </Stack>

                                                <Button
                                                    href={
                                                        submittedFileUrl?.startsWith("http")
                                                            ? submittedFileUrl
                                                            : `${window.location.origin}${submittedFileUrl}`
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    variant="contained"
                                                    sx={primaryButtonMiniStyle}
                                                >
                                                    View
                                                </Button>
                                            </Paper>
                                        )}

                                        {!submitted && file && (
                                            <Paper sx={fileItemStyle}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1.8}
                                                    alignItems="center"
                                                >
                                                    <Avatar
                                                        variant="rounded"
                                                        sx={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: "16px",
                                                            bgcolor: "rgba(99,102,241,0.10)"
                                                        }}
                                                    >
                                                        {file.type?.includes("pdf") ? (
                                                            <PictureAsPdfRoundedIcon
                                                                sx={{
                                                                    color: "#ef4444",
                                                                    fontSize: 28
                                                                }}
                                                            />
                                                        ) : (
                                                            <InsertDriveFileRoundedIcon
                                                                sx={{
                                                                    color: "#6366f1",
                                                                    fontSize: 28
                                                                }}
                                                            />
                                                        )}
                                                    </Avatar>

                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography
                                                            fontWeight={700}
                                                            sx={{
                                                                color: "#0f172a",
                                                                wordBreak: "break-word"
                                                            }}
                                                        >
                                                            {file.name}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: "#64748b" }}
                                                        >
                                                            {file.type?.includes("pdf")
                                                                ? "PDF file selected"
                                                                : "File selected"}
                                                        </Typography>
                                                    </Box>

                                                    <CloseRoundedIcon
                                                        onClick={() => setFile(null)}
                                                        sx={{
                                                            cursor: "pointer",
                                                            color: "#64748b",
                                                            transition: "0.2s ease",
                                                            "&:hover": {
                                                                color: "#0f172a",
                                                                transform: "scale(1.08)"
                                                            }
                                                        }}
                                                    />
                                                </Stack>
                                            </Paper>
                                        )}

                                        <Button
                                            variant="contained"
                                            size="large"
                                            disabled={
                                                (!submitted && isExpired) ||
                                                (submitted && isGraded)
                                            }
                                            onClick={() => {
                                                if (submitted) {
                                                    if (isGraded) return;
                                                    setOpenUnsubmitDialog(true);
                                                } else {
                                                    if (!file) {
                                                        alert("Please select a file first");
                                                        return;
                                                    }
                                                    setOpenSubmitDialog(true);
                                                }
                                            }}
                                            sx={{
                                                mt: 0.5,
                                                borderRadius: "20px",
                                                py: 1.5,
                                                fontSize: "0.98rem",
                                                fontWeight: 800,
                                                textTransform: "none",
                                                boxShadow: submitted
                                                    ? "none"
                                                    : "0 14px 34px rgba(99,102,241,0.28)",
                                                background: submitted
                                                    ? isGraded
                                                        ? "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)"
                                                        : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                                                    : isExpired
                                                        ? "#e5e7eb"
                                                        : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                                color: submitted
                                                    ? "#334155"
                                                    : isExpired
                                                        ? "#94a3b8"
                                                        : "white",
                                                "&:hover": {
                                                    background: submitted
                                                        ? isGraded
                                                            ? "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)"
                                                            : "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)"
                                                        : isExpired
                                                            ? "#e5e7eb"
                                                            : "linear-gradient(135deg, #5558eb 0%, #7c3aed 100%)",
                                                    boxShadow: submitted
                                                        ? "none"
                                                        : "0 18px 40px rgba(99,102,241,0.32)"
                                                }
                                            }}
                                        >
                                            {submitted
                                                ? isGraded
                                                    ? "Graded"
                                                    : "Unsubmit"
                                                : "Hand In"}
                                        </Button>
                                    </Stack>
                                </Paper>

                                <Paper sx={glassCardStyle}>
                                    <Stack spacing={2}>
                                        <Typography sx={sectionTitleStyle}>
                                            Evaluation
                                        </Typography>
                                        <Divider />

                                        {isGraded ? (
                                            <>
                                                <Paper
                                                    sx={{
                                                        p: 2.2,
                                                        borderRadius: "22px",
                                                        border: "1px solid rgba(99,102,241,0.14)",
                                                        background:
                                                            "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)"
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="space-between"
                                                        alignItems="center"
                                                    >
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: "#64748b",
                                                                    mb: 0.5,
                                                                    fontWeight: 600
                                                                }}
                                                            >
                                                                Grade
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    fontSize: "2rem",
                                                                    fontWeight: 900,
                                                                    color: "#0f172a"
                                                                }}
                                                            >
                                                                {grade}
                                                                <Typography
                                                                    component="span"
                                                                    sx={{
                                                                        color: "#64748b",
                                                                        ml: 0.5,
                                                                        fontSize: "1rem",
                                                                        fontWeight: 700
                                                                    }}
                                                                >
                                                                    / {assignment.points}
                                                                </Typography>
                                                            </Typography>
                                                        </Box>

                                                        <Avatar
                                                            sx={{
                                                                width: 58,
                                                                height: 58,
                                                                background:
                                                                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                                                boxShadow:
                                                                    "0 12px 26px rgba(99,102,241,0.24)"
                                                            }}
                                                        >
                                                            <WorkspacePremiumRoundedIcon />
                                                        </Avatar>
                                                    </Stack>
                                                </Paper>

                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "#64748b",
                                                            mb: 1,
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        Instructor Feedback
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            color: "#475569",
                                                            lineHeight: 1.8,
                                                            whiteSpace: "pre-line"
                                                        }}
                                                    >
                                                        {feedback || "No feedback provided yet."}
                                                    </Typography>
                                                </Box>
                                            </>
                                        ) : (
                                            <Typography
                                                sx={{
                                                    color: "#64748b",
                                                    lineHeight: 1.8
                                                }}
                                            >
                                                {submitted
                                                    ? "Your work has been submitted. Grade and feedback will appear here once the instructor reviews it."
                                                    : "Submit your work to receive a grade and feedback."}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Box>
                    </Stack>
                </Stack>
            </Box>

            {/* SUBMIT DIALOG */}
            <Dialog
                open={openSubmitDialog}
                onClose={() => setOpenSubmitDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "28px",
                        p: 1,
                        minWidth: { xs: "auto", sm: 520 },
                        background:
                            "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: "1.25rem" }}>
                    Hand in your work?
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ color: "#64748b", mb: 2 }}>
                        Your selected attachment will be submitted for this assignment.
                    </Typography>

                    {file && (
                        <Paper sx={fileItemStyle}>
                            <Stack direction="row" spacing={1.8} alignItems="center">
                                <Avatar
                                    variant="rounded"
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: "16px",
                                        bgcolor: "rgba(99,102,241,0.10)"
                                    }}
                                >
                                    {file.type?.includes("pdf") ? (
                                        <PictureAsPdfRoundedIcon
                                            sx={{ color: "#ef4444" }}
                                        />
                                    ) : (
                                        <InsertDriveFileRoundedIcon
                                            sx={{ color: "#6366f1" }}
                                        />
                                    )}
                                </Avatar>

                                <Box>
                                    <Typography fontWeight={700} sx={{ color: "#0f172a" }}>
                                        {file.name}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                                        Ready to submit
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setOpenSubmitDialog(false)}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#475569"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitting}
                        sx={{
                            ...primaryButtonMiniStyle,
                            color: "#fff",
                            "&.Mui-disabled": {
                                color: "#fff",
                                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                opacity: 1,
                            },
                        }}
                    >
                        {submitting ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress size={18} sx={{ color: "#fff" }} />
                                <span style={{ color: "#fff" }}>Submitting...</span>
                            </Stack>
                        ) : (
                            "Hand In"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* UNSUBMIT DIALOG */}
            <Dialog
                open={openUnsubmitDialog}
                onClose={() => setOpenUnsubmitDialog(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "28px",
                        p: 1,
                        minWidth: { xs: "auto", sm: 520 },
                        background:
                            "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)"
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontSize: "1.25rem" }}>
                    Unsubmit assignment?
                </DialogTitle>

                <DialogContent>
                    <Typography sx={{ color: "#64748b", lineHeight: 1.8 }}>
                        You can unsubmit to replace or update your file. Make sure to
                        submit it again before the deadline.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setOpenUnsubmitDialog(false)}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            color: "#475569"
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUnsubmit}
                        variant="contained"
                        sx={{
                            ...primaryButtonMiniStyle,
                            background:
                                "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
                            boxShadow: "0 12px 24px rgba(15,23,42,0.18)",
                            "&:hover": {
                                background:
                                    "linear-gradient(135deg, #020617 0%, #1e293b 100%)"
                            }
                        }}
                    >
                        Unsubmit
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

const glassCardStyle = {
    p: { xs: 2.2, md: 2.8 },
    borderRadius: "28px",
    border: "1px solid rgba(255,255,255,0.72)",
    background:
        "linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.62) 100%)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.06)"
};

const chipSoftStyle = {
    borderRadius: "999px",
    fontWeight: 700,
    color: "#334155",
    bgcolor: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(148,163,184,0.15)",
    "& .MuiChip-icon": {
        color: "#6366f1"
    }
};

const sectionTitleStyle = {
    fontSize: "1.05rem",
    fontWeight: 800,
    color: "#0f172a"
};

const fileItemStyle = {
    p: 1.8,
    borderRadius: "22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    border: "1px solid rgba(148,163,184,0.16)",
    background: "rgba(255,255,255,0.75)"
};

const primaryButtonMiniStyle = {
    textTransform: "none",
    fontWeight: 800,
    borderRadius: "14px",
    px: 2,
    py: 1,
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    boxShadow: "0 12px 24px rgba(99,102,241,0.22)",
    "&:hover": {
        background: "linear-gradient(135deg, #5558eb 0%, #7c3aed 100%)"
    }
};