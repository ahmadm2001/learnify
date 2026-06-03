import { useEffect, useMemo, useState } from "react";
import API from "../../lib/api";
import AdminLayout from "../../components/AdminLayout";
import Swal from "sweetalert2";
import {
    alpha,
} from "@mui/material/styles";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import Grid from "@mui/material/Grid";
import { motion } from "framer-motion";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

function formatMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`;
}

function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

function getInitials(text = "") {
    if (!text?.trim()) return "C";
    const words = text.trim().split(" ").filter(Boolean);
    if (words.length === 1) return words[0][0]?.toUpperCase() || "C";
    return `${words[0][0] || ""}${words[1][0] || ""}`.toUpperCase();
}

function stripHtml(html = "") {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return (temp.textContent || temp.innerText || "").trim();
}

function truncate(text = "", max = 110) {
    if (!text) return "No description available for this course yet.";
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

function formatDate(dateString) {
    if (!dateString) return "Unknown date";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "Unknown date";
    return d.toLocaleDateString();
}

function getCourseTypeLabel(course) {
    const type = String(course?.course_type || "").trim();
    if (!type) return "Standard";
    return type.replaceAll("_", " ");
}

function getPriceConfig(price) {
    const amount = Number(price || 0);

    if (amount <= 0) {
        return {
            label: "Free",
            color: "#0f9d58",
            bg: "rgba(34,197,94,0.10)",
            border: "rgba(34,197,94,0.18)",
            icon: <LocalOfferRoundedIcon sx={{ fontSize: 14 }} />,
        };
    }

    return {
        label: formatMoney(amount),
        color: "#b45309",
        bg: "rgba(245,158,11,0.12)",
        border: "rgba(245,158,11,0.20)",
        icon: <AttachMoneyRoundedIcon sx={{ fontSize: 14 }} />,
    };
}

function FilterPill({ active, label, onClick }) {
    return (
        <Button
            onClick={onClick}
            variant="text"
            sx={{
                textTransform: "none",
                borderRadius: "999px",
                px: 1.6,
                py: 0.9,
                fontWeight: 800,
                fontSize: 13,
                color: active ? "#5b21b6" : "#64748b",
                bgcolor: active ? "rgba(109,97,210,0.10)" : "rgba(255,255,255,0.7)",
                border: active
                    ? "1px solid rgba(109,97,210,0.18)"
                    : "1px solid rgba(148,163,184,0.14)",
                "&:hover": {
                    bgcolor: active ? "rgba(109,97,210,0.14)" : "rgba(255,255,255,0.92)",
                },
            }}
        >
            {label}
        </Button>
    );
}

function StatCard({
    title,
    value,
    helper,
    icon,
    accent = "#6d61d2",
    softBg = "rgba(109,97,210,0.10)",
}) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.2,
                height: "100%",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.72)",
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.96) 100%)",
                boxShadow:
                    "0 18px 40px rgba(15,23,42,0.05), 0 8px 24px rgba(109,97,210,0.04)",
                transition: "all 0.28s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow:
                        "0 24px 48px rgba(15,23,42,0.08), 0 10px 26px rgba(109,97,210,0.08)",
                },
            }}
        >
            <Stack direction="row" spacing={1.6} alignItems="center">
                <Avatar
                    sx={{
                        width: 54,
                        height: 54,
                        borderRadius: "18px",
                        bgcolor: softBg,
                        color: accent,
                        boxShadow: `0 14px 26px ${alpha(accent, 0.14)}`,
                    }}
                >
                    {icon}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#64748b",
                            mb: 0.25,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: { xs: 24, md: 28 },
                            lineHeight: 1.05,
                            letterSpacing: "-0.04em",
                            color: "#0f172a",
                            fontWeight: 950,
                        }}
                    >
                        {value}
                    </Typography>

                    <Typography
                        sx={{
                            fontSize: 12.5,
                            color: "#94a3b8",
                            mt: 0.45,
                            lineHeight: 1.55,
                        }}
                    >
                        {helper}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}

function CourseCardSkeleton() {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.4,
                height: "100%",
                borderRadius: "28px",
                border: "1px solid rgba(255,255,255,0.72)",
                background:
                    "linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))",
                boxShadow: "0 18px 38px rgba(15,23,42,0.05)",
            }}
        >
            <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Skeleton variant="rounded" width={62} height={62} sx={{ borderRadius: "18px" }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="68%" height={34} />
                        <Skeleton variant="text" width="46%" height={24} />
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" width={86} height={30} sx={{ borderRadius: "999px" }} />
                    <Skeleton variant="rounded" width={96} height={30} sx={{ borderRadius: "999px" }} />
                </Stack>

                <Skeleton variant="rounded" width="100%" height={88} sx={{ borderRadius: "18px" }} />
                <Skeleton variant="rounded" width="100%" height={56} sx={{ borderRadius: "16px" }} />
            </Stack>
        </Paper>
    );
}

function EmptyState({ hasFilters, onResetFilters }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 5 },
                borderRadius: "28px",
                border: "1px dashed rgba(109,97,210,0.20)",
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,244,255,0.94))",
                textAlign: "center",
                boxShadow: "0 18px 38px rgba(15,23,42,0.04)",
            }}
        >
            <Avatar
                sx={{
                    width: 72,
                    height: 72,
                    mx: "auto",
                    mb: 1.7,
                    borderRadius: "22px",
                    bgcolor: "rgba(109,97,210,0.10)",
                    color: "#6d61d2",
                }}
            >
                <Inventory2RoundedIcon sx={{ fontSize: 34 }} />
            </Avatar>

            <Typography
                sx={{
                    fontWeight: 900,
                    color: "#0f172a",
                    fontSize: "1.2rem",
                    mb: 0.8,
                }}
            >
                {hasFilters ? "No courses match your filters" : "No courses found"}
            </Typography>

            <Typography
                sx={{
                    color: "#64748b",
                    maxWidth: 540,
                    mx: "auto",
                    lineHeight: 1.8,
                    mb: hasFilters ? 2 : 0,
                }}
            >
                {hasFilters
                    ? "Try changing your search, teacher name, course type, or price filter."
                    : "Once teachers publish courses on your platform, they will appear here for admin management."}
            </Typography>

            {hasFilters && (
                <Button
                    variant="contained"
                    onClick={onResetFilters}
                    sx={{
                        mt: 1,
                        textTransform: "none",
                        borderRadius: "16px",
                        px: 2.5,
                        py: 1.1,
                        fontWeight: 800,
                        background: "linear-gradient(135deg, #6d61d2 0%, #5146c4 100%)",
                        boxShadow: "0 12px 24px rgba(109,97,210,0.20)",
                        "&:hover": {
                            background: "linear-gradient(135deg, #6154cb 0%, #473db6 100%)",
                        },
                    }}
                >
                    Reset filters
                </Button>
            )}
        </Paper>
    );
}

function CourseCard({
    course,
    actionLoading,
    onDelete,
}) {
    const description = truncate(stripHtml(course.description || ""), 120);
    const priceConfig = getPriceConfig(course.price);
    const initials = getInitials(course.title || "Course");
    const courseType = getCourseTypeLabel(course);
    const isBusy = actionLoading === course.id;

    return (
        <MotionPaper
            variants={fadeUp}
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ duration: 0.24 }}
            elevation={0}
            sx={{
                position: "relative",
                overflow: "hidden",
                height: "100%",
                width: "100%",
                p: 2.4,
                display: "flex",        // 🔥 ADD THIS
                flexDirection: "column",// 🔥 ADD THIS
                borderRadius: "28px",
                border: "1px solid rgba(255,255,255,0.72)",
                background:
                    "linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 58%, rgba(246,243,255,0.94) 100%)",
                boxShadow:
                    "0 18px 38px rgba(15,23,42,0.05), 0 10px 24px rgba(109,97,210,0.04)",
                backdropFilter: "blur(18px)",
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    top: -70,
                    right: -60,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background:
                        "radial-gradient(circle, rgba(109,97,210,0.10), transparent 70%)",
                    pointerEvents: "none",
                }}
            />

            <Stack
                sx={{
                    position: "relative",
                    zIndex: 1,
                    height: "100%"   // 🔥 ADD THIS
                }}
                spacing={2.1}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                            sx={{
                                width: 58,
                                height: 58,
                                borderRadius: "18px",
                                fontWeight: 900,
                                fontSize: 22,
                                color: "white",
                                background: "linear-gradient(135deg, #6d61d2 0%, #5146c4 100%)",
                                boxShadow: "0 14px 26px rgba(109,97,210,0.22)",
                            }}
                        >
                            {initials}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontWeight: 900,
                                    color: "#0f172a",
                                    fontSize: "1.08rem",
                                    lineHeight: 1.2,
                                    mb: 0.35,
                                    wordBreak: "break-word",
                                }}
                            >
                                {course.title || "Untitled course"}
                            </Typography>

                            <Stack direction="row" spacing={0.8} alignItems="center">
                                <PersonRoundedIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
                                <Typography
                                    sx={{
                                        fontSize: 13.5,
                                        color: "#64748b",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    by {course.teacher_name || "Unknown teacher"}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Tooltip title="Course item">
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "14px",
                                bgcolor: "rgba(109,97,210,0.12)",
                                color: "#6d61d2",
                                border: "1px solid rgba(109,97,210,0.16)",
                                flexShrink: 0,
                            }}
                        >
                            <SchoolRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                    </Tooltip>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                        icon={priceConfig.icon}
                        label={priceConfig.label}
                        sx={{
                            borderRadius: "999px",
                            fontWeight: 800,
                            color: priceConfig.color,
                            bgcolor: priceConfig.bg,
                            border: `1px solid ${priceConfig.border}`,
                            "& .MuiChip-icon": {
                                color: priceConfig.color,
                            },
                        }}
                    />

                    <Chip
                        icon={<CategoryRoundedIcon sx={{ fontSize: 14 }} />}
                        label={courseType}
                        sx={{
                            borderRadius: "999px",
                            fontWeight: 800,
                            color: "#475569",
                            bgcolor: "rgba(148,163,184,0.12)",
                            border: "1px solid rgba(148,163,184,0.18)",
                            "& .MuiChip-icon": {
                                color: "#64748b",
                            },
                        }}
                    />
                </Stack>

                <Paper
                    elevation={0}
                    sx={{
                        p: 1.6,
                        borderRadius: "20px",
                        border: "1px solid rgba(148,163,184,0.12)",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(248,250,252,0.94))",
                        minHeight: 96,
                    }}
                >
                    <Typography
                        sx={{
                            color: "#64748b",
                            fontSize: 13.4,
                            lineHeight: 1.8,
                            wordBreak: "break-word",
                        }}
                    >
                        {description}
                    </Typography>
                </Paper>

                <Paper
                    elevation={0}
                    sx={{
                        p: 1.6,
                        borderRadius: "20px",
                        border: "1px solid rgba(148,163,184,0.12)",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(248,250,252,0.94))",
                    }}
                >
                    <Stack spacing={1.1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CalendarMonthRoundedIcon sx={{ fontSize: 17, color: "#6d61d2" }} />
                                <Typography
                                    sx={{
                                        color: "#334155",
                                        fontWeight: 700,
                                        fontSize: 13.5,
                                    }}
                                >
                                    Created
                                </Typography>
                            </Stack>

                            <Typography
                                sx={{
                                    color: "#0f172a",
                                    fontWeight: 800,
                                    fontSize: 13.5,
                                }}
                            >
                                {formatDate(course.created_at)}
                            </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <PaidRoundedIcon sx={{ fontSize: 17, color: "#6d61d2" }} />
                                <Typography
                                    sx={{
                                        color: "#334155",
                                        fontWeight: 700,
                                        fontSize: 13.5,
                                    }}
                                >
                                    Course price
                                </Typography>
                            </Stack>

                            <Typography
                                sx={{
                                    color: "#0f172a",
                                    fontWeight: 900,
                                    fontSize: 13.5,
                                }}
                            >
                                {formatMoney(course.price)}
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>

                <Stack direction="row" spacing={1.2} sx={{ mt: "auto" }}>
                    <Tooltip title="Delete course permanently">
                        <IconButton
                            onClick={() => onDelete(course.id)}
                            disabled={isBusy}
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: "16px",
                                bgcolor: "rgba(239,68,68,0.10)",
                                color: "#dc2626",
                                border: "1px solid rgba(239,68,68,0.18)",
                                "&:hover": {
                                    bgcolor: "rgba(239,68,68,0.16)",
                                },
                            }}
                        >
                            {isBusy ? (
                                <CircularProgress size={18} sx={{ color: "inherit" }} />
                            ) : (
                                <DeleteForeverRoundedIcon />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Paper
                        elevation={0}
                        sx={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 1.5,
                            borderRadius: "16px",
                            border: "1px solid rgba(148,163,184,0.14)",
                            background: "rgba(255,255,255,0.74)",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#475569",
                            }}
                        >
                            Admin action
                        </Typography>

                        <ArrowOutwardRoundedIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                    </Paper>
                </Stack>
            </Stack>
        </MotionPaper>
    );
}

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [teacherFilter, setTeacherFilter] = useState("ALL");
    const [priceFilter, setPriceFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("NEWEST");

    const loadCourses = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            setError("");

            const res = await API.get("/api/admin/courses/");
            setCourses(safeArray(res.data));
        } catch (err) {
            console.log(err);
            setError("Failed to load courses.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This course will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#6d61d2",
            cancelButtonColor: "#94a3b8",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        // ❌ if user clicks cancel → stop
        if (!result.isConfirmed) return;

        try {
            setActionLoading(id);

            await API.delete(`/api/admin/courses/${id}/delete/`);

            // ✅ success popup
            Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Course has been deleted.",
                timer: 1500,
                showConfirmButton: false,
            });

            await loadCourses(true);

        } catch (err) {
            console.log(err);

            Swal.fire({
                icon: "error",
                title: "Error",
                text: err?.response?.data?.detail || "Failed to delete course.",
            });

        } finally {
            setActionLoading(null);
        }
    };

    const teacherOptions = useMemo(() => {
        const names = [...new Set(courses.map((c) => c.teacher_name).filter(Boolean))];
        return names.sort((a, b) => String(a).localeCompare(String(b)));
    }, [courses]);

    const filteredCourses = useMemo(() => {
        let list = safeArray(courses);

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((course) => {
                const cleanDesc = stripHtml(course.description || "");
                return (
                    String(course.title || "").toLowerCase().includes(q) ||
                    String(course.teacher_name || "").toLowerCase().includes(q) ||
                    cleanDesc.toLowerCase().includes(q) ||
                    String(course.id || "").includes(q)
                );
            });
        }

        if (teacherFilter !== "ALL") {
            list = list.filter((course) => course.teacher_name === teacherFilter);
        }

        if (priceFilter !== "ALL") {
            list = list.filter((course) => {
                const amount = Number(course.price || 0);
                if (priceFilter === "FREE") return amount <= 0;
                if (priceFilter === "PAID") return amount > 0;
                if (priceFilter === "UNDER_20") return amount > 0 && amount < 20;
                if (priceFilter === "ABOVE_20") return amount >= 20;
                return true;
            });
        }

        list = [...list].sort((a, b) => {
            if (sortBy === "NEWEST") return Number(b.id) - Number(a.id);
            if (sortBy === "OLDEST") return Number(a.id) - Number(b.id);
            if (sortBy === "A_Z") {
                return String(a.title || "").localeCompare(String(b.title || ""));
            }
            if (sortBy === "Z_A") {
                return String(b.title || "").localeCompare(String(a.title || ""));
            }
            if (sortBy === "PRICE_HIGH") {
                return Number(b.price || 0) - Number(a.price || 0);
            }
            if (sortBy === "PRICE_LOW") {
                return Number(a.price || 0) - Number(b.price || 0);
            }
            return 0;
        });

        return list;
    }, [courses, search, teacherFilter, priceFilter, sortBy]);

    const stats = useMemo(() => {
        const total = courses.length;
        const paid = courses.filter((course) => Number(course.price || 0) > 0).length;
        const free = courses.filter((course) => Number(course.price || 0) <= 0).length;
        const revenue = courses.reduce((sum, c) => sum + Number(c.price || 0), 0);

        return { total, paid, free, revenue };
    }, [courses]);

    const hasActiveFilters =
        search.trim() !== "" ||
        teacherFilter !== "ALL" ||
        priceFilter !== "ALL";

    const resetFilters = () => {
        setSearch("");
        setTeacherFilter("ALL");
        setPriceFilter("ALL");
        setSortBy("NEWEST");
    };

    return (
        <AdminLayout>
            <Box
                sx={{
                    minHeight: "100vh",
                    py: { xs: 2.5, md: 4.5 },
                    px: { xs: 1, md: 2 },
                    background:
                        "radial-gradient(circle at top left, rgba(109,97,210,0.10), transparent 18%), radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 20%), linear-gradient(180deg, #fbfbff 0%, #f8f5ff 42%, #f5f7fb 100%)",
                }}
            >
                <Container maxWidth={false} sx={{ px: 2 }}>
                    <Stack spacing={3}>
                        <MotionPaper
                            variants={fadeUp}
                            initial="initial"
                            animate="animate"
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            elevation={0}
                            sx={{
                                p: { xs: 2.3, sm: 2.8, md: 3.4 },
                                borderRadius: "34px",
                                overflow: "hidden",
                                position: "relative",
                                border: "1px solid rgba(109,97,210,0.15)",
                                background:
                                    "linear-gradient(135deg, rgba(248,245,255,0.96) 0%, rgba(255,255,255,0.99) 42%, rgba(243,240,255,0.96) 100%)",
                                boxShadow:
                                    "0 24px 55px rgba(109,97,210,0.10), 0 8px 20px rgba(15,23,42,0.04)",
                                backdropFilter: "blur(18px)",
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: -90,
                                    right: -80,
                                    width: 240,
                                    height: 240,
                                    borderRadius: "50%",
                                    background:
                                        "radial-gradient(circle, rgba(109,97,210,0.18), transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: -100,
                                    left: -70,
                                    width: 230,
                                    height: 230,
                                    borderRadius: "50%",
                                    background:
                                        "radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)",
                                    pointerEvents: "none",
                                }}
                            />

                            <Stack
                                direction={{ xs: "column", xl: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", xl: "center" }}
                                spacing={2.5}
                                sx={{ position: "relative", zIndex: 1 }}
                            >
                                <Box sx={{ maxWidth: 850 }}>
                                    <Chip
                                        icon={<AutoAwesomeRoundedIcon />}
                                        label="Courses workspace"
                                        sx={heroChipStyle}
                                    />

                                    <Typography
                                        sx={{
                                            fontSize: { xs: "2rem", md: "3rem" },
                                            lineHeight: 1.02,
                                            fontWeight: 950,
                                            letterSpacing: "-0.05em",
                                            color: "#0f172a",
                                            mb: 1,
                                            mt: 1.2,
                                        }}
                                    >
                                        Courses Management
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#64748b",
                                            maxWidth: 760,
                                            lineHeight: 1.85,
                                            fontSize: { xs: "0.96rem", md: "1rem" },
                                        }}
                                    >
                                        Review all courses published by teachers, monitor pricing,
                                        search through the full catalog, and remove courses when
                                        needed from one polished admin workspace.
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
                                        sx={{ mt: 1.8 }}
                                    >
                                        <Chip
                                            icon={<MenuBookRoundedIcon />}
                                            label={`${stats.total} total courses`}
                                            sx={heroChipStyle}
                                        />
                                        <Chip
                                            icon={<BoltRoundedIcon />}
                                            label={`${stats.paid} paid courses`}
                                            sx={heroChipStyle}
                                        />
                                        <Chip
                                            icon={<PercentRoundedIcon />}
                                            label={`${stats.free} free courses`}
                                            sx={heroChipStyle}
                                        />
                                    </Stack>
                                </Box>

                                <Stack
                                    spacing={1.2}
                                    sx={{
                                        minWidth: { xs: "100%", xl: 360 },
                                        width: { xs: "100%", xl: "auto" },
                                    }}
                                >
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: "24px",
                                            bgcolor: "rgba(255,255,255,0.84)",
                                            border: "1px solid rgba(15,23,42,0.06)",
                                            backdropFilter: "blur(10px)",
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        color: "#64748b",
                                                        fontSize: 12,
                                                        fontWeight: 700,
                                                        letterSpacing: 0.3,
                                                    }}
                                                >
                                                    Catalog value
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        color: "#0f172a",
                                                        fontWeight: 900,
                                                        fontSize: 28,
                                                        lineHeight: 1.1,
                                                        mt: 0.4,
                                                    }}
                                                >
                                                    {formatMoney(stats.revenue)}
                                                </Typography>
                                            </Box>

                                            <Avatar
                                                sx={{
                                                    width: 46,
                                                    height: 46,
                                                    bgcolor: "rgba(109,97,210,0.12)",
                                                    color: "#6d61d2",
                                                }}
                                            >
                                                <PaidRoundedIcon />
                                            </Avatar>
                                        </Stack>

                                        <Typography
                                            sx={{
                                                color: "#64748b",
                                                fontSize: 12.5,
                                                mt: 0.8,
                                                lineHeight: 1.65,
                                            }}
                                        >
                                            Sum of all course prices currently visible in your admin catalog.
                                        </Typography>
                                    </Paper>

                                    <Button
                                        variant="contained"
                                        startIcon={
                                            refreshing ? (
                                                <CircularProgress size={16} sx={{ color: "#fff" }} />
                                            ) : (
                                                <RefreshRoundedIcon />
                                            )
                                        }
                                        onClick={() => loadCourses(true)}
                                        disabled={refreshing}
                                        sx={{
                                            textTransform: "none",
                                            borderRadius: "18px",
                                            py: 1.2,
                                            fontWeight: 800,
                                            fontSize: 14,
                                            color: "white",
                                            background: "linear-gradient(135deg, #6d61d2, #5146c4)",
                                            boxShadow: "0 12px 28px rgba(109,97,210,0.24)",
                                            "&:hover": {
                                                background:
                                                    "linear-gradient(135deg, #5f55c7, #4338ca)",
                                            },
                                        }}
                                    >
                                        Refresh courses
                                    </Button>
                                </Stack>
                            </Stack>
                        </MotionPaper>

                        <MotionBox
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            <Grid container spacing={2.2} sx={{ mb: 0.4 }}>
                                <Grid item xs={12} sm={6} xl={3}>
                                    <MotionBox variants={fadeUp}>
                                        <StatCard
                                            title="Total courses"
                                            value={stats.total}
                                            helper="All course records in your platform catalog"
                                            icon={<Inventory2RoundedIcon />}
                                            accent="#6d61d2"
                                            softBg="rgba(109,97,210,0.10)"
                                        />
                                    </MotionBox>
                                </Grid>

                                <Grid item xs={12} sm={6} xl={3}>
                                    <MotionBox variants={fadeUp}>
                                        <StatCard
                                            title="Paid courses"
                                            value={stats.paid}
                                            helper="Courses that currently have a price above zero"
                                            icon={<PaidRoundedIcon />}
                                            accent="#b45309"
                                            softBg="rgba(245,158,11,0.12)"
                                        />
                                    </MotionBox>
                                </Grid>

                                <Grid item xs={12} sm={6} xl={3}>
                                    <MotionBox variants={fadeUp}>
                                        <StatCard
                                            title="Free courses"
                                            value={stats.free}
                                            helper="Courses available without a paid price"
                                            icon={<LocalOfferRoundedIcon />}
                                            accent="#16a34a"
                                            softBg="rgba(34,197,94,0.10)"
                                        />
                                    </MotionBox>
                                </Grid>

                                <Grid item xs={12} sm={6} xl={3}>
                                    <MotionBox variants={fadeUp}>
                                        <StatCard
                                            title="Catalog revenue"
                                            value={formatMoney(stats.revenue)}
                                            helper="Combined course prices across the full catalog"
                                            icon={<AttachMoneyRoundedIcon />}
                                            accent="#0f9d58"
                                            softBg="rgba(34,197,94,0.10)"
                                        />
                                    </MotionBox>
                                </Grid>
                            </Grid>
                        </MotionBox>

                        <MotionPaper
                            variants={fadeUp}
                            initial="initial"
                            animate="animate"
                            transition={{ duration: 0.38 }}
                            elevation={0}
                            sx={{
                                p: { xs: 2.1, md: 2.4 },
                                borderRadius: "28px",
                                border: "1px solid rgba(255,255,255,0.72)",
                                background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.96))",
                                boxShadow: "0 18px 38px rgba(15,23,42,0.05)",
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack
                                    direction={{ xs: "column", xl: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "stretch", xl: "center" }}
                                    spacing={1.6}
                                >
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontWeight: 900,
                                                color: "#0f172a",
                                                fontSize: "1.08rem",
                                                mb: 0.35,
                                            }}
                                        >
                                            Filter courses
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: 13.5,
                                                color: "#64748b",
                                                lineHeight: 1.7,
                                            }}
                                        >
                                            Search by course title, teacher, description, or ID and refine the result set.
                                        </Typography>
                                    </Box>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
                                        alignItems="center"
                                    >
                                        <FilterPill
                                            active={priceFilter === "ALL"}
                                            label="All prices"
                                            onClick={() => setPriceFilter("ALL")}
                                        />
                                        <FilterPill
                                            active={priceFilter === "FREE"}
                                            label="Free"
                                            onClick={() => setPriceFilter("FREE")}
                                        />
                                        <FilterPill
                                            active={priceFilter === "PAID"}
                                            label="Paid"
                                            onClick={() => setPriceFilter("PAID")}
                                        />
                                        <FilterPill
                                            active={priceFilter === "ABOVE_20"}
                                            label="20+"
                                            onClick={() => setPriceFilter("ABOVE_20")}
                                        />
                                    </Stack>
                                </Stack>

                                <Grid container spacing={1.6}>
                                    <Grid item xs={12} xl={5}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search by title, teacher, description, or course ID..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            sx={searchInputStyle}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchRoundedIcon sx={{ color: "#94a3b8" }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6} xl={2.5}>
                                        <Select
                                            fullWidth
                                            value={teacherFilter}
                                            onChange={(e) => setTeacherFilter(e.target.value)}
                                            sx={selectStyle}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <PersonRoundedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                                                </InputAdornment>
                                            }
                                        >
                                            <MenuItem value="ALL">All teachers</MenuItem>
                                            {teacherOptions.map((teacher) => (
                                                <MenuItem key={teacher} value={teacher}>
                                                    {teacher}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Grid>

                                    <Grid item xs={12} sm={6} xl={2.5}>
                                        <Select
                                            fullWidth
                                            value={priceFilter}
                                            onChange={(e) => setPriceFilter(e.target.value)}
                                            sx={selectStyle}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <FilterAltRoundedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                                                </InputAdornment>
                                            }
                                        >
                                            <MenuItem value="ALL">All prices</MenuItem>
                                            <MenuItem value="FREE">Free</MenuItem>
                                            <MenuItem value="PAID">Paid</MenuItem>
                                            <MenuItem value="UNDER_20">Under $20</MenuItem>
                                            <MenuItem value="ABOVE_20">$20 and above</MenuItem>
                                        </Select>
                                    </Grid>

                                    <Grid item xs={12} sm={8} xl={2}>
                                        <Select
                                            fullWidth
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            sx={selectStyle}
                                        >
                                            <MenuItem value="NEWEST">Newest first</MenuItem>
                                            <MenuItem value="OLDEST">Oldest first</MenuItem>
                                            <MenuItem value="A_Z">A → Z</MenuItem>
                                            <MenuItem value="Z_A">Z → A</MenuItem>
                                            <MenuItem value="PRICE_HIGH">Price high</MenuItem>
                                            <MenuItem value="PRICE_LOW">Price low</MenuItem>
                                        </Select>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </MotionPaper>

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    borderRadius: "18px",
                                    fontWeight: 700,
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <Paper
                            elevation={0}
                            sx={{
                                p: 1.4,
                                borderRadius: "22px",
                                border: "1px solid rgba(255,255,255,0.72)",
                                background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.90), rgba(248,250,252,0.94))",
                                boxShadow: "0 12px 28px rgba(15,23,42,0.04)",
                            }}
                        >
                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={1}
                            >
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <InfoOutlinedIcon sx={{ color: "#6d61d2", fontSize: 18 }} />
                                    <Typography
                                        sx={{
                                            fontSize: 13.5,
                                            color: "#475569",
                                            fontWeight: 700,
                                        }}
                                    >
                                        Showing {filteredCourses.length} of {courses.length} courses
                                    </Typography>
                                </Stack>

                                {hasActiveFilters && (
                                    <Button
                                        onClick={resetFilters}
                                        variant="text"
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 800,
                                            color: "#5b21b6",
                                        }}
                                    >
                                        Clear filters
                                    </Button>
                                )}
                            </Stack>
                        </Paper>

                        {loading ? (
                            <Grid
                                container
                                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                                alignItems="stretch" // ✅ IMPORTANT
                            >
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        lg={4}
                                        xl={3}
                                        key={index}
                                    >
                                        <CourseCardSkeleton />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : filteredCourses.length === 0 ? (
                            <EmptyState
                                hasFilters={hasActiveFilters}
                                onResetFilters={resetFilters}
                            />
                        ) : (
                            <MotionBox
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                            >
                                <Grid
                                    container
                                    spacing={{ xs: 2, sm: 2.5, md: 3 }}
                                    sx={{ alignItems: "flex-start" }} // ✅ FIX
                                >
                                    {filteredCourses.map((course) => (
                                        <Grid
                                            item
                                            xs={4}
                                            sm={4}
                                            md={4}
                                            lg={4}
                                            xl={4}
                                            sx={{
                                                display: "flex",
                                                alignItems: "stretch", // ✅ ADD THIS
                                            }}
                                        >
                                            <CourseCard
                                                course={course}
                                                actionLoading={actionLoading}
                                                onDelete={handleDelete}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </MotionBox>
                        )}
                    </Stack>
                </Container>
            </Box>
        </AdminLayout>
    );
}

const heroChipStyle = {
    borderRadius: "999px",
    fontWeight: 800,
    bgcolor: "rgba(109,97,210,0.08)",
    color: "#5b21b6",
    border: "1px solid rgba(109,97,210,0.14)",
};

const searchInputStyle = {
    "& .MuiOutlinedInput-root": {
        minHeight: 56,
        borderRadius: "18px",
        bgcolor: "rgba(255,255,255,0.88)",
        border: "1px solid rgba(148,163,184,0.12)",
        boxShadow: "0 8px 18px rgba(15,23,42,0.03)",
        "& fieldset": {
            border: "none",
        },
    },
};

const selectStyle = {
    minHeight: 56,
    borderRadius: "18px",
    bgcolor: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(148,163,184,0.12)",
    boxShadow: "0 8px 18px rgba(15,23,42,0.03)",
    "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
    },
};