import { useEffect, useMemo, useState } from "react";
import API from "../../lib/api";
import Swal from "sweetalert2";
import {
    Avatar,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    alpha,
    CircularProgress,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import GradingRoundedIcon from "@mui/icons-material/GradingRounded";
import FolderOpenRoundedIcon from "@mui/icons-material/FolderOpenRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import InsertDriveFileRoundedIcon from "@mui/icons-material/InsertDriveFileRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import ModeEditOutlineRoundedIcon from "@mui/icons-material/ModeEditOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";

function GlassCard({ children, sx = {}, ...props }) {
    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: "28px",
                border: "1px solid rgba(255,255,255,0.72)",
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.68) 100%)",
                backdropFilter: "blur(18px)",
                boxShadow:
                    "0 18px 50px rgba(15, 23, 42, 0.06), 0 10px 28px rgba(99, 102, 241, 0.06)",
                ...sx
            }}
            {...props}
        >
            {children}
        </Paper>
    );
}

function SectionLabel({ icon, title, subtitle }) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
                variant="rounded"
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    boxShadow: "0 10px 24px rgba(99,102,241,0.26)"
                }}
            >
                {icon}
            </Avatar>

            <Box>
                <Typography
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.1rem", md: "1.2rem" },
                        color: "#0f172a"
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        sx={{
                            color: "#64748b",
                            fontSize: "0.95rem",
                            mt: 0.3
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

function StatMiniCard({ icon, label, value, color = "#6366f1", soft = "rgba(99,102,241,0.10)" }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: "20px",
                border: "1px solid rgba(148,163,184,0.14)",
                background: "rgba(255,255,255,0.74)"
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                    sx={{
                        width: 44,
                        height: 44,
                        bgcolor: soft,
                        color
                    }}
                >
                    {icon}
                </Avatar>
                <Box>
                    <Typography sx={{ color: "#64748b", fontSize: "0.82rem", fontWeight: 700 }}>
                        {label}
                    </Typography>
                    <Typography sx={{ color: "#0f172a", fontSize: "1.1rem", fontWeight: 800 }}>
                        {value}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}

export default function AssignmentsList() {
    const [tab, setTab] = useState(0);
    const [assignments, setAssignments] = useState([]);
    const [editing, setEditing] = useState(null);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [grading, setGrading] = useState(null);
    const [noFileOpen, setNoFileOpen] = useState(false);
    const [gradingLoading, setGradingLoading] = useState(false);
    const selectedAssignmentObj = assignments.find((a) => a.id === selectedAssignment);
    const maxPoints = selectedAssignmentObj?.points || 0;

    const loadAssignments = () => {
        API.get("/api/instructor/assignments/")
            .then((res) => setAssignments(res.data))
            .catch(() => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to load assignments",
                });
            });
    };

    const loadSubmissions = async (assignmentId) => {
        try {
            const res = await API.get(`/api/assignments/${assignmentId}/submissions/`);
            setSubmissions(res.data);
            setSelectedAssignment(assignmentId);
        } catch {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load submissions",
            });
        }
    };

    const handleGrade = async (submissionId, grade, feedback) => {
        await API.patch(`/api/submissions/${submissionId}/grade/`, {
            grade,
            feedback
        });
        Swal.fire({
            icon: "success",
            title: "Graded successfully",
            toast: true,
            position: "top-end",
            timer: 1500,
            showConfirmButton: false,
        });
        loadSubmissions(selectedAssignment);
    };

    const handleGradeSave = async () => {
        try {
            setGradingLoading(true);

            await API.patch(`/api/submissions/${grading.id}/grade/`, {
                grade: grading.grade,
                feedback: grading.feedback
            });

            setGrading(null);
            loadSubmissions(selectedAssignment);
        } catch {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to save grade",
            });
        } finally {
            setGradingLoading(false);
        }
    };

    useEffect(() => {
        loadAssignments();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This assignment will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6366f1",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {
            await API.delete(`/api/assignments/${id}/delete/`);

            await Swal.fire({
                title: "Deleted!",
                text: "Assignment has been deleted successfully.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            loadAssignments();

        } catch (err) {
            console.error(err);

            Swal.fire({
                title: "Error",
                text: "Failed to delete assignment",
                icon: "error",
                confirmButtonColor: "#ef4444",
            });
        }
    };

    const getTimeLeft = (dueDate) => {
        const total = new Date(dueDate) - new Date();

        if (total <= 0) return "Expired";

        const days = Math.floor(total / (1000 * 60 * 60 * 24));
        const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((total / (1000 * 60)) % 60);

        return `${days}d ${hours}h ${minutes}m left`;
    };

    const getFileTypeLabel = (fileUrl) => {
        if (!fileUrl) return "File";
        const ext = fileUrl.split(".").pop().toLowerCase();

        if (["doc", "docx"].includes(ext)) return "Microsoft Word";
        if (["pdf"].includes(ext)) return "PDF Document";
        if (["ppt", "pptx"].includes(ext)) return "PowerPoint";
        if (["xls", "xlsx"].includes(ext)) return "Excel Spreadsheet";
        if (["zip", "rar"].includes(ext)) return "Compressed File";

        return ext.toUpperCase() + " File";
    };

    const getFileIcon = (fileUrl) => {
        if (!fileUrl) return "📄";
        const ext = fileUrl.split(".").pop().toLowerCase();

        if (["doc", "docx"].includes(ext)) return "📘";
        if (["pdf"].includes(ext)) return "📕";
        if (["ppt", "pptx"].includes(ext)) return "📙";
        if (["xls", "xlsx"].includes(ext)) return "📗";
        if (["zip", "rar"].includes(ext)) return "🗜️";

        return "📄";
    };

    const handleSave = async () => {
        await API.patch(`/api/assignments/${editing.id}/edit/`, editing);
        setEditing(null);
        loadAssignments();
    };

    const assignmentStats = useMemo(() => {
        const total = assignments.length;
        const active = assignments.filter((a) => a.due_date && new Date(a.due_date) > new Date()).length;
        const expired = assignments.filter((a) => a.due_date && new Date(a.due_date) <= new Date()).length;
        const totalPoints = assignments.reduce((sum, a) => sum + Number(a.points || 0), 0);

        return { total, active, expired, totalPoints };
    }, [assignments]);

    const submissionStats = useMemo(() => {
        return {
            total: submissions.length,
            graded: submissions.filter((s) => s.grade !== null && s.grade !== "" && s.grade !== undefined).length,
            waiting: submissions.filter((s) => s.grade === null || s.grade === "" || s.grade === undefined).length
        };
    }, [submissions]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 3, md: 5 },
                px: { xs: 2, md: 3 },
                background:
                    "radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 22%), radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 18%), radial-gradient(circle at bottom left, rgba(59,130,246,0.06), transparent 24%), linear-gradient(180deg, #fbfcff 0%, #f8fafc 100%)"
            }}
        >
            <Container maxWidth="xl">
                <Stack spacing={4}>
                    {/* HERO */}
                    <GlassCard
                        sx={{
                            p: { xs: 3, md: 4 },
                            position: "relative",
                            overflow: "hidden"
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                width: 240,
                                height: 240,
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
                                width: 240,
                                height: 240,
                                borderRadius: "50%",
                                bottom: -100,
                                left: -60,
                                background:
                                    "radial-gradient(circle, rgba(168,85,247,0.12), rgba(168,85,247,0.00) 70%)"
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
                                        borderRadius: "24px",
                                        background: "linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)",
                                        boxShadow: "0 14px 32px rgba(99,102,241,0.28)"
                                    }}
                                >
                                    <AssignmentOutlinedIcon sx={{ fontSize: 38 }} />
                                </Avatar>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: { xs: "1.7rem", md: "2.45rem" },
                                            lineHeight: 1.1,
                                            fontWeight: 900,
                                            color: "#0f172a"
                                        }}
                                    >
                                        Assignments Center
                                    </Typography>
                                    <Typography
                                        sx={{
                                            mt: 1,
                                            color: "#64748b",
                                            fontSize: "1rem",
                                            maxWidth: 680,
                                            lineHeight: 1.8
                                        }}
                                    >
                                        Create, manage, review, and grade student work in one polished space.
                                        Everything stays exactly as your current flow works — just redesigned to feel premium.
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
                                            icon={<AssignmentTurnedInRoundedIcon />}
                                            label={`${assignmentStats.total} Assignments`}
                                            sx={heroChipStyle}
                                        />
                                        <Chip
                                            icon={<GradingRoundedIcon />}
                                            label="Review & Grade"
                                            sx={heroChipStyle}
                                        />
                                    </Stack>
                                </Box>
                            </Stack>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1.5}
                                sx={{ width: { xs: "100%", lg: "auto" } }}
                            >
                                <StatMiniCard
                                    icon={<AssignmentOutlinedIcon />}
                                    label="Total"
                                    value={assignmentStats.total}
                                />
                                <StatMiniCard
                                    icon={<ChecklistRoundedIcon />}
                                    label="Active"
                                    value={assignmentStats.active}
                                    color="#16a34a"
                                    soft="rgba(22,163,74,0.10)"
                                />
                                <StatMiniCard
                                    icon={<PendingActionsRoundedIcon />}
                                    label="Expired"
                                    value={assignmentStats.expired}
                                    color="#dc2626"
                                    soft="rgba(220,38,38,0.10)"
                                />
                            </Stack>
                        </Stack>
                    </GlassCard>

                    {/* TABS */}
                    <GlassCard sx={{ p: 1 }}>
                        <Tabs
                            value={tab}
                            onChange={(e, newVal) => setTab(newVal)}
                            variant="scrollable"
                            allowScrollButtonsMobile
                            sx={{
                                px: { xs: 1, md: 2 },
                                "& .MuiTabs-indicator": {
                                    height: 38,
                                    borderRadius: "999px",
                                    background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.16))"
                                }
                            }}
                        >
                            <Tab
                                disableRipple
                                label="All Assignments"
                                sx={tabStyle}
                            />
                            <Tab
                                disableRipple
                                label="Student Submissions"
                                sx={tabStyle}
                            />
                        </Tabs>
                    </GlassCard>

                    {/* TAB 1 */}
                    {tab === 0 && (
                        <Stack spacing={3}>
                            <GlassCard sx={{ p: { xs: 2.2, md: 3 } }}>
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    spacing={2}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", md: "center" }}
                                >
                                    <SectionLabel
                                        icon={<FolderOpenRoundedIcon />}
                                        title="All Assignments"
                                        subtitle="Review and edit the assignments you have created."
                                    />

                                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                        <Chip
                                            label={`${assignmentStats.totalPoints} Total Points`}
                                            sx={softIndigoChip}
                                        />
                                        <Chip
                                            label={`${assignmentStats.active} Currently Open`}
                                            sx={softGreenChip}
                                        />
                                    </Stack>
                                </Stack>
                            </GlassCard>

                            {assignments.length === 0 && (
                                <GlassCard
                                    sx={{
                                        p: { xs: 4, md: 7 },
                                        textAlign: "center"
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 74,
                                            height: 74,
                                            mx: "auto",
                                            mb: 2.5,
                                            background: "linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)",
                                            color: "#6366f1"
                                        }}
                                    >
                                        <AssignmentOutlinedIcon sx={{ fontSize: 38 }} />
                                    </Avatar>

                                    <Typography
                                        sx={{
                                            fontSize: "1.35rem",
                                            fontWeight: 800,
                                            color: "#0f172a",
                                            mb: 1
                                        }}
                                    >
                                        No assignments yet
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color: "#64748b",
                                            maxWidth: 520,
                                            mx: "auto",
                                            lineHeight: 1.8
                                        }}
                                    >
                                        Create assignments from your lectures and they will appear here in this beautifully organized center.
                                    </Typography>
                                </GlassCard>
                            )}

                            <Stack spacing={2.5}>
                                {assignments.map((a, index) => {
                                    const due = a.due_date ? new Date(a.due_date) : null;
                                    const expired = due ? due <= new Date() : false;

                                    return (
                                        <GlassCard
                                            key={a.id}
                                            sx={{
                                                p: { xs: 2.2, md: 3 },
                                                transition: "all 0.26s ease",
                                                opacity: 0,
                                                transform: "translateY(20px)",
                                                animation: `fadeUp 0.55s ease ${index * 0.05}s forwards`,
                                                "&:hover": {
                                                    transform: "translateY(-4px)",
                                                    boxShadow:
                                                        "0 26px 55px rgba(15, 23, 42, 0.08), 0 16px 35px rgba(99,102,241,0.10)"
                                                }
                                            }}
                                        >
                                            <Stack spacing={2.5}>
                                                <Stack
                                                    direction={{ xs: "column", md: "row" }}
                                                    spacing={2}
                                                    justifyContent="space-between"
                                                    alignItems={{ xs: "flex-start", md: "center" }}
                                                >
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar
                                                            variant="rounded"
                                                            sx={{
                                                                width: 58,
                                                                height: 58,
                                                                borderRadius: "18px",
                                                                background: expired
                                                                    ? "linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)"
                                                                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                                                boxShadow: expired
                                                                    ? "0 12px 26px rgba(239,68,68,0.20)"
                                                                    : "0 12px 26px rgba(99,102,241,0.22)"
                                                            }}
                                                        >
                                                            <AssignmentIcon />
                                                        </Avatar>

                                                        <Box>
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 800,
                                                                    fontSize: { xs: "1rem", md: "1.15rem" },
                                                                    color: "#0f172a"
                                                                }}
                                                            >
                                                                {a.title}
                                                            </Typography>
                                                            <Typography
                                                                sx={{
                                                                    color: "#64748b",
                                                                    mt: 0.5,
                                                                    fontSize: "0.95rem"
                                                                }}
                                                            >
                                                                {a.course_title} • {a.lecture_title}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <IconButton
                                                            onClick={() => setEditing(a)}
                                                            sx={editButtonStyle}
                                                        >
                                                            <ModeEditOutlineRoundedIcon sx={{ color: "#4f46e5" }} />
                                                        </IconButton>

                                                        <IconButton
                                                            onClick={() => handleDelete(a.id)}
                                                            sx={deleteButtonStyle}
                                                        >
                                                            <DeleteOutlineRoundedIcon sx={{ color: "#dc2626" }} />
                                                        </IconButton>
                                                    </Stack>
                                                </Stack>

                                                <Stack
                                                    direction="row"
                                                    spacing={1.1}
                                                    useFlexGap
                                                    flexWrap="wrap"
                                                >
                                                    <Chip
                                                        label={`${a.points} Points`}
                                                        sx={softIndigoChip}
                                                    />

                                                    {a.created_at && (
                                                        <Chip
                                                            icon={<CalendarMonthRoundedIcon />}
                                                            label={`Created ${new Date(a.created_at).toLocaleString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}`}
                                                            sx={softSlateChip}
                                                        />
                                                    )}

                                                    {due && (
                                                        <Chip
                                                            icon={<CalendarMonthRoundedIcon />}
                                                            label={due.toLocaleDateString("en-GB", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric"
                                                            })}
                                                            sx={softBlueChip}
                                                        />
                                                    )}

                                                    {due && (
                                                        <Chip
                                                            icon={<AccessTimeRoundedIcon />}
                                                            label={due.toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                            sx={softAmberChip}
                                                        />
                                                    )}

                                                    {due && (
                                                        <Chip
                                                            icon={<PendingActionsRoundedIcon />}
                                                            label={getTimeLeft(a.due_date)}
                                                            sx={expired ? softRedChip : softGreenChip}
                                                        />
                                                    )}
                                                </Stack>

                                                {a.instructions && (
                                                    <>
                                                        <Divider sx={{ borderColor: "rgba(148,163,184,0.16)" }} />
                                                        <Typography
                                                            sx={{
                                                                color: "#475569",
                                                                lineHeight: 1.8,
                                                                fontSize: "0.96rem",
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: "hidden"
                                                            }}
                                                        >
                                                            {a.instructions}
                                                        </Typography>
                                                    </>
                                                )}
                                            </Stack>
                                        </GlassCard>
                                    );
                                })}
                            </Stack>
                        </Stack>
                    )}

                    {/* TAB 2 */}
                    {tab === 1 && (
                        <Stack spacing={3}>
                            {!selectedAssignment && (
                                <>
                                    <GlassCard sx={{ p: { xs: 2.2, md: 3 } }}>
                                        <Stack
                                            direction={{ xs: "column", md: "row" }}
                                            spacing={2}
                                            justifyContent="space-between"
                                            alignItems={{ xs: "flex-start", md: "center" }}
                                        >
                                            <SectionLabel
                                                icon={<GradingRoundedIcon />}
                                                title="Student Submissions"
                                                subtitle="Choose an assignment to review submitted work."
                                            />

                                            <Chip
                                                label={`${assignments.length} Assignments Ready`}
                                                sx={softIndigoChip}
                                            />
                                        </Stack>
                                    </GlassCard>

                                    <Stack spacing={2.2}>
                                        {assignments.map((a, index) => (
                                            <GlassCard
                                                key={a.id}
                                                onClick={() => loadSubmissions(a.id)}
                                                sx={{
                                                    p: { xs: 2.2, md: 3 },
                                                    cursor: "pointer",
                                                    transition: "all 0.26s ease",
                                                    opacity: 0,
                                                    transform: "translateY(20px)",
                                                    animation: `fadeUp 0.55s ease ${index * 0.05}s forwards`,
                                                    "&:hover": {
                                                        transform: "translateY(-4px)",
                                                        boxShadow:
                                                            "0 24px 52px rgba(15, 23, 42, 0.08), 0 14px 30px rgba(99,102,241,0.10)"
                                                    }
                                                }}
                                            >
                                                <Stack
                                                    direction={{ xs: "column", md: "row" }}
                                                    spacing={2}
                                                    justifyContent="space-between"
                                                    alignItems={{ xs: "flex-start", md: "center" }}
                                                >
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar
                                                            sx={{
                                                                width: 54,
                                                                height: 54,
                                                                background: "linear-gradient(135deg, #6b60d1 0%, #7c3aed 100%)",
                                                                boxShadow: "0 10px 24px rgba(109,93,252,0.22)"
                                                            }}
                                                        >
                                                            <AssignmentIcon sx={{ color: "white" }} />
                                                        </Avatar>

                                                        <Box>
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 800,
                                                                    fontSize: { xs: "1rem", md: "1.1rem" },
                                                                    color: "#0f172a"
                                                                }}
                                                            >
                                                                {a.title}
                                                            </Typography>

                                                            <Typography
                                                                sx={{
                                                                    color: "#64748b",
                                                                    mt: 0.4,
                                                                    fontSize: "0.94rem"
                                                                }}
                                                            >
                                                                {a.course_title}
                                                            </Typography>

                                                            {a.due_date && (
                                                                <Typography
                                                                    sx={{
                                                                        color: "#94a3b8",
                                                                        mt: 0.5,
                                                                        fontSize: "0.9rem"
                                                                    }}
                                                                >
                                                                    Due{" "}
                                                                    {new Date(a.due_date).toLocaleDateString("en-GB", {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric"
                                                                    })}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>

                                                    <Stack spacing={1} alignItems={{ xs: "flex-start", md: "flex-end" }}>
                                                        <Chip
                                                            label={`${a.points} Points`}
                                                            size="small"
                                                            sx={softIndigoChip}
                                                        />
                                                        <Typography sx={{ color: "#64748b", fontSize: "0.9rem", fontWeight: 600 }}>
                                                            Click to view submissions
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </GlassCard>
                                        ))}
                                    </Stack>
                                </>
                            )}

                            {selectedAssignment && (
                                <>
                                    <Button
                                        onClick={() => setSelectedAssignment(null)}
                                        startIcon={<ArrowBackRoundedIcon />}
                                        sx={{
                                            alignSelf: "flex-start",
                                            textTransform: "none",
                                            fontWeight: 700,
                                            borderRadius: "999px",
                                            px: 2,
                                            py: 1,
                                            color: "#4f46e5",
                                            bgcolor: "rgba(99,102,241,0.08)",
                                            "&:hover": {
                                                bgcolor: "rgba(99,102,241,0.14)"
                                            }
                                        }}
                                    >
                                        Back to Assignments
                                    </Button>

                                    <GlassCard sx={{ p: { xs: 2.5, md: 3.2 } }}>
                                        <Stack spacing={3}>
                                            <Stack
                                                direction={{ xs: "column", md: "row" }}
                                                spacing={2}
                                                justifyContent="space-between"
                                                alignItems={{ xs: "flex-start", md: "center" }}
                                            >
                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 900,
                                                            fontSize: { xs: "1.3rem", md: "1.7rem" },
                                                            color: "#0f172a"
                                                        }}
                                                    >
                                                        {selectedAssignmentObj?.title}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            color: "#64748b",
                                                            mt: 0.6
                                                        }}
                                                    >
                                                        {selectedAssignmentObj?.course_title}
                                                    </Typography>
                                                </Box>

                                                <Chip
                                                    label={`${maxPoints} Max Points`}
                                                    sx={softIndigoChip}
                                                />
                                            </Stack>

                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1.5}
                                            >
                                                <StatMiniCard
                                                    icon={<AssignmentTurnedInRoundedIcon />}
                                                    label="Turned In"
                                                    value={submissionStats.total}
                                                />
                                                <StatMiniCard
                                                    icon={<GradingRoundedIcon />}
                                                    label="Graded"
                                                    value={submissionStats.graded}
                                                    color="#16a34a"
                                                    soft="rgba(22,163,74,0.10)"
                                                />
                                                <StatMiniCard
                                                    icon={<PendingActionsRoundedIcon />}
                                                    label="Waiting"
                                                    value={submissionStats.waiting}
                                                    color="#f59e0b"
                                                    soft="rgba(245,158,11,0.12)"
                                                />
                                            </Stack>
                                        </Stack>
                                    </GlassCard>

                                    <Stack spacing={2.2}>
                                        {submissions.length === 0 && (
                                            <GlassCard sx={{ p: 5, textAlign: "center" }}>
                                                <Avatar
                                                    sx={{
                                                        width: 70,
                                                        height: 70,
                                                        mx: "auto",
                                                        mb: 2,
                                                        bgcolor: "rgba(99,102,241,0.10)",
                                                        color: "#6366f1"
                                                    }}
                                                >
                                                    <PendingActionsRoundedIcon sx={{ fontSize: 34 }} />
                                                </Avatar>
                                                <Typography sx={{ color: "#0f172a", fontSize: "1.1rem", fontWeight: 800, mb: 1 }}>
                                                    No students submitted yet
                                                </Typography>
                                                <Typography sx={{ color: "#64748b" }}>
                                                    Submitted work will appear here once students turn in their assignments.
                                                </Typography>
                                            </GlassCard>
                                        )}

                                        {submissions.map((sub, index) => {
                                            const hasGrade =
                                                sub.grade !== null &&
                                                sub.grade !== "" &&
                                                sub.grade !== undefined;

                                            return (
                                                <GlassCard
                                                    key={sub.id}
                                                    sx={{
                                                        p: { xs: 2.2, md: 2.6 },
                                                        transition: "all 0.24s ease",
                                                        opacity: 0,
                                                        transform: "translateY(20px)",
                                                        animation: `fadeUp 0.55s ease ${index * 0.05}s forwards`,
                                                        "&:hover": {
                                                            transform: "translateY(-2px)"
                                                        }
                                                    }}
                                                >
                                                    <Stack spacing={2.4}>
                                                        {/* ROW 1 */}
                                                        <Stack
                                                            direction={{ xs: "column", md: "row" }}
                                                            spacing={2}
                                                            justifyContent="space-between"
                                                            alignItems={{ xs: "flex-start", md: "center" }}
                                                        >
                                                            <Stack direction="row" spacing={1.8} alignItems="center">
                                                                <Avatar
                                                                    sx={{
                                                                        width: 48,
                                                                        height: 48,
                                                                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                                                        fontWeight: 800,
                                                                        boxShadow: "0 10px 22px rgba(99,102,241,0.22)"
                                                                    }}
                                                                >
                                                                    {sub.student_name?.charAt(0)?.toUpperCase() || "S"}
                                                                </Avatar>

                                                                <Box>
                                                                    <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
                                                                        {sub.student_name}
                                                                    </Typography>
                                                                    <Typography sx={{ color: "#64748b", fontSize: "0.92rem", mt: 0.25 }}>
                                                                        Submitted {new Date(sub.submitted_at).toLocaleString()}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>

                                                            <Stack
                                                                direction={{ xs: "column", sm: "row" }}
                                                                spacing={1.2}
                                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                                            >
                                                                <Chip
                                                                    label={hasGrade ? `Graded (${sub.grade})` : "Needs grading"}
                                                                    sx={hasGrade ? softGreenChip : softAmberChip}
                                                                />

                                                                <Button
                                                                    variant="contained"
                                                                    size="small"
                                                                    onClick={() => setGrading(sub)}
                                                                    sx={{
                                                                        textTransform: "none",
                                                                        fontWeight: 800,
                                                                        borderRadius: "14px",
                                                                        px: 2,
                                                                        py: 1,
                                                                        background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                                                                        boxShadow: "0 10px 22px rgba(99,102,241,0.24)",
                                                                        "&:hover": {
                                                                            background: "linear-gradient(135deg,#5558eb,#6d28d9)"
                                                                        }
                                                                    }}
                                                                >
                                                                    Grade
                                                                </Button>
                                                            </Stack>
                                                        </Stack>

                                                        {/* FILE CARD */}
                                                        <Paper
                                                            onClick={() => {
                                                                if (!sub.file) return setNoFileOpen(true);
                                                                window.open(sub.file, "_blank");
                                                            }}
                                                            elevation={0}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "space-between",
                                                                gap: 2,
                                                                p: 2,
                                                                borderRadius: "22px",
                                                                border: "1px solid rgba(148,163,184,0.16)",
                                                                bgcolor: "rgba(255,255,255,0.82)",
                                                                cursor: "pointer",
                                                                transition: "all 0.22s ease",
                                                                maxWidth: 560,
                                                                width: "100%",
                                                                mx: "auto",
                                                                "&:hover": {
                                                                    boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                                                                    transform: "scale(1.01)"
                                                                }
                                                            }}
                                                        >
                                                            <Stack direction="row" spacing={1.8} alignItems="center" sx={{ minWidth: 0 }}>
                                                                <Avatar
                                                                    variant="rounded"
                                                                    sx={{
                                                                        width: 54,
                                                                        height: 54,
                                                                        borderRadius: "18px",
                                                                        bgcolor: "rgba(99,102,241,0.10)",
                                                                        color: "#6366f1"
                                                                    }}
                                                                >
                                                                    <DescriptionRoundedIcon />
                                                                </Avatar>

                                                                <Box sx={{ minWidth: 0 }}>
                                                                    <Typography
                                                                        sx={{
                                                                            fontWeight: 800,
                                                                            fontSize: "1rem",
                                                                            color: "#0f172a",
                                                                            textDecoration: "underline",
                                                                            whiteSpace: "nowrap",
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis"
                                                                        }}
                                                                    >
                                                                        {sub.file?.split("/").pop() || "No attached file"}
                                                                    </Typography>

                                                                    <Typography
                                                                        sx={{
                                                                            color: "#64748b",
                                                                            fontSize: "0.92rem",
                                                                            mt: 0.4
                                                                        }}
                                                                    >
                                                                        {getFileTypeLabel(sub.file)}
                                                                    </Typography>
                                                                </Box>
                                                            </Stack>

                                                            <Box
                                                                sx={{
                                                                    width: 90,
                                                                    height: 70,
                                                                    borderRadius: "18px",
                                                                    bgcolor: "#f8fafc",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontSize: 28,
                                                                    border: "1px solid rgba(148,163,184,0.14)"
                                                                }}
                                                            >
                                                                {getFileIcon(sub.file)}
                                                            </Box>
                                                        </Paper>

                                                        {hasGrade && (
                                                            <Paper
                                                                elevation={0}
                                                                sx={{
                                                                    p: 2,
                                                                    borderRadius: "20px",
                                                                    bgcolor: "rgba(22,163,74,0.06)",
                                                                    border: "1px solid rgba(22,163,74,0.14)"
                                                                }}
                                                            >
                                                                <Stack spacing={0.8}>
                                                                    <Typography sx={{ color: "#166534", fontWeight: 800 }}>
                                                                        Grade Saved
                                                                    </Typography>
                                                                    <Typography sx={{ color: "#166534", fontSize: "0.94rem" }}>
                                                                        Score: {sub.grade} / {maxPoints || "—"}
                                                                    </Typography>
                                                                    {sub.feedback && (
                                                                        <Typography sx={{ color: "#166534", fontSize: "0.92rem", lineHeight: 1.7 }}>
                                                                            Feedback: {sub.feedback}
                                                                        </Typography>
                                                                    )}
                                                                </Stack>
                                                            </Paper>
                                                        )}
                                                    </Stack>
                                                </GlassCard>
                                            );
                                        })}
                                    </Stack>
                                </>
                            )}
                        </Stack>
                    )}
                </Stack>
            </Container>

            {/* EDIT DIALOG */}
            <Dialog
                open={!!editing}
                onClose={() => setEditing(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "28px",
                        p: 1,
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)"
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar
                            sx={{
                                width: 42,
                                height: 42,
                                background: "linear-gradient(135deg,#6366f1,#7c3aed)"
                            }}
                        >
                            <EditIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={800}>
                                Edit Assignment
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Update assignment details and deadline
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} mt={1}>
                        <TextField
                            label="Assignment Title"
                            fullWidth
                            value={editing?.title || ""}
                            onChange={(e) =>
                                setEditing({ ...editing, title: e.target.value })
                            }
                            sx={dialogInputStyle}
                        />

                        <TextField
                            label="Instructions"
                            multiline
                            rows={4}
                            fullWidth
                            value={editing?.instructions || ""}
                            onChange={(e) =>
                                setEditing({ ...editing, instructions: e.target.value })
                            }
                            sx={dialogInputStyle}
                        />

                        <TextField
                            label="Points"
                            type="number"
                            fullWidth
                            value={editing?.points || ""}
                            onChange={(e) =>
                                setEditing({ ...editing, points: e.target.value })
                            }
                            sx={dialogInputStyle}
                        />

                        <TextField
                            label="Due Date & Time"
                            type="datetime-local"
                            fullWidth
                            value={editing?.due_date || ""}
                            onChange={(e) =>
                                setEditing({ ...editing, due_date: e.target.value })
                            }
                            InputLabelProps={{ shrink: true }}
                            sx={dialogInputStyle}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                    <Button
                        onClick={() => setEditing(null)}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            color: "text.secondary"
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<SaveRoundedIcon />}
                        onClick={handleSave}
                        sx={{
                            textTransform: "none",
                            fontWeight: 800,
                            px: 3,
                            py: 1.1,
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                            boxShadow: "0 10px 24px rgba(99,102,241,0.28)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #5558eb, #6d28d9)"
                            }
                        }}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* GRADING DIALOG */}
            <Dialog
                open={!!grading}
                onClose={() => setGrading(null)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "28px",
                        p: 1,
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)"
                    }
                }}
            >
                <DialogTitle>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar
                            sx={{
                                width: 42,
                                height: 42,
                                background: "linear-gradient(135deg,#6366f1,#7c3aed)"
                            }}
                        >
                            <GradingRoundedIcon />
                        </Avatar>

                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.15rem" }}>
                                Grade Submission
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                                Total: {maxPoints} points
                            </Typography>
                        </Box>
                    </Stack>
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2.4} mt={1}>
                        <TextField
                            label={`Mark (out of ${maxPoints})`}
                            type="number"
                            fullWidth
                            value={grading?.grade ?? ""}
                            onChange={(e) => {
                                const val = e.target.value;

                                if (val === "") {
                                    setGrading({ ...grading, grade: "" });
                                    return;
                                }

                                const num = Number(val);

                                if (num < 0) return;
                                if (maxPoints && num > maxPoints) return;

                                setGrading({ ...grading, grade: num });
                            }}
                            helperText={maxPoints ? `Example: 9 / ${maxPoints}` : "Set total points first"}
                            sx={dialogInputStyle}
                        />

                        <TextField
                            label="Feedback"
                            multiline
                            rows={4}
                            fullWidth
                            value={grading?.feedback || ""}
                            onChange={(e) => setGrading({ ...grading, feedback: e.target.value })}
                            sx={dialogInputStyle}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() => setGrading(null)}
                        sx={{
                            textTransform: "none",
                            fontWeight: 700
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={gradingLoading}
                        onClick={handleGradeSave}
                        sx={{
                            textTransform: "none",
                            fontWeight: 800,
                            borderRadius: "14px",
                            px: 2.5,
                            py: 1,
                            background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                            boxShadow: "0 10px 24px rgba(99,102,241,0.24)",
                            color: "#fff",

                            "&.Mui-disabled": {
                                color: "#fff",
                                background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                                opacity: 1,
                            },

                            "&:hover": {
                                background: "linear-gradient(135deg,#5558eb,#6d28d9)"
                            }
                        }}
                    >
                        {gradingLoading ? (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircularProgress size={18} sx={{ color: "#fff" }} />
                                <span style={{ color: "#fff" }}>Saving...</span>
                            </Stack>
                        ) : (
                            <>
                                <SaveRoundedIcon sx={{ mr: 0.7 }} />
                                Save Grade
                            </>
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* NO FILE DIALOG */}
            <Dialog
                open={noFileOpen}
                onClose={() => setNoFileOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "24px",
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800 }}>
                    No File Attached
                </DialogTitle>

                <DialogContent>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                        This student did not attach any file with their submission.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.2 }}>
                    <Button
                        onClick={() => setNoFileOpen(false)}
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            fontWeight: 700,
                            borderRadius: "12px",
                            background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                            px: 2.6
                        }}
                    >
                        OK
                    </Button>
                </DialogActions>
            </Dialog>

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

const tabStyle = {
    textTransform: "none",
    fontWeight: 800,
    minHeight: 56,
    zIndex: 2,
    color: "#475569",
    "&.Mui-selected": {
        color: "#4338ca"
    }
};

const heroChipStyle = {
    borderRadius: "999px",
    fontWeight: 700,
    color: "#374151",
    bgcolor: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(148,163,184,0.16)",
    "& .MuiChip-icon": {
        color: "#6366f1"
    }
};

const softIndigoChip = {
    bgcolor: "rgba(99,102,241,0.10)",
    color: "#4f46e5",
    fontWeight: 800,
    border: "1px solid rgba(99,102,241,0.12)"
};

const softGreenChip = {
    bgcolor: "rgba(22,163,74,0.10)",
    color: "#15803d",
    fontWeight: 800,
    border: "1px solid rgba(22,163,74,0.14)"
};

const softRedChip = {
    bgcolor: "rgba(239,68,68,0.10)",
    color: "#dc2626",
    fontWeight: 800,
    border: "1px solid rgba(239,68,68,0.14)"
};

const softAmberChip = {
    bgcolor: "rgba(245,158,11,0.12)",
    color: "#b45309",
    fontWeight: 800,
    border: "1px solid rgba(245,158,11,0.16)"
};

const softBlueChip = {
    bgcolor: "rgba(14,165,233,0.10)",
    color: "#0369a1",
    fontWeight: 800,
    border: "1px solid rgba(14,165,233,0.14)"
};

const softSlateChip = {
    bgcolor: "rgba(148,163,184,0.12)",
    color: "#334155",
    fontWeight: 700,
    border: "1px solid rgba(148,163,184,0.14)"
};

const editButtonStyle = {
    bgcolor: "rgba(99,102,241,0.10)",
    border: "1px solid rgba(99,102,241,0.12)",
    "&:hover": {
        bgcolor: "rgba(99,102,241,0.16)"
    }
};

const deleteButtonStyle = {
    bgcolor: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.12)",
    "&:hover": {
        bgcolor: "rgba(239,68,68,0.16)"
    }
};

const dialogInputStyle = {
    "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        bgcolor: "rgba(255,255,255,0.88)"
    }
};