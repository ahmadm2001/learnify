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

import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import PersonOffRoundedIcon from "@mui/icons-material/PersonOffRounded";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

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

function getInitials(name = "") {
    if (!name?.trim()) return "U";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getStatusConfig(isActive) {
    if (isActive) {
        return {
            label: "Active",
            color: "#16a34a",
            bg: "rgba(34,197,94,0.10)",
            border: "rgba(34,197,94,0.18)",
            icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
        };
    }

    return {
        label: "Disabled",
        color: "#dc2626",
        bg: "rgba(239,68,68,0.10)",
        border: "rgba(239,68,68,0.18)",
        icon: <PersonOffRoundedIcon sx={{ fontSize: 14 }} />,
    };
}

function getRoleConfig(isStaff) {
    if (isStaff) {
        return {
            label: "Admin",
            color: "#5b21b6",
            bg: "rgba(109,97,210,0.12)",
            border: "rgba(109,97,210,0.16)",
            icon: <ShieldRoundedIcon sx={{ fontSize: 14 }} />,
        };
    }

    return {
        label: "User",
        color: "#334155",
        bg: "rgba(148,163,184,0.12)",
        border: "rgba(148,163,184,0.18)",
        icon: <PersonRoundedIcon sx={{ fontSize: 14 }} />,
    };
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

function UserCardSkeleton() {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.4,
                borderRadius: "26px",
                border: "1px solid rgba(255,255,255,0.72)",
                background:
                    "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,252,0.96))",
                boxShadow: "0 18px 38px rgba(15,23,42,0.05)",
            }}
        >
            <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Skeleton variant="rounded" width={58} height={58} sx={{ borderRadius: "18px" }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="55%" height={34} />
                        <Skeleton variant="text" width="75%" height={24} />
                    </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" width={82} height={30} sx={{ borderRadius: "999px" }} />
                    <Skeleton variant="rounded" width={70} height={30} sx={{ borderRadius: "999px" }} />
                </Stack>

                <Skeleton variant="rounded" width="100%" height={72} sx={{ borderRadius: "18px" }} />
                <Skeleton variant="rounded" width="100%" height={52} sx={{ borderRadius: "16px" }} />
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
                <Groups2RoundedIcon sx={{ fontSize: 34 }} />
            </Avatar>

            <Typography
                sx={{
                    fontWeight: 900,
                    color: "#0f172a",
                    fontSize: "1.2rem",
                    mb: 0.8,
                }}
            >
                {hasFilters ? "No users match your filters" : "No users found"}
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
                    ? "Try changing your search, role, or status filter to see more results."
                    : "Once users register on your platform, they will appear here for management."}
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

function UserCard({
    user,
    actionLoading,
    onToggle,
    onDelete,
}) {
    const initials = getInitials(user.username);
    const statusConfig = getStatusConfig(user.is_active);
    const roleConfig = getRoleConfig(user.is_staff);
    const isBusy = actionLoading === user.id;
    const isAdmin = user.is_staff;

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
                p: 2.4,
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

            <Stack sx={{ position: "relative", zIndex: 1 }} spacing={2.1}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar
                            sx={{
                                width: 58,
                                height: 58,
                                borderRadius: "18px",
                                fontWeight: 900,
                                fontSize: 24,
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
                                    fontSize: "1.12rem",
                                    lineHeight: 1.2,
                                    mb: 0.35,
                                    wordBreak: "break-word",
                                }}
                            >
                                {user.username || "Unnamed user"}
                            </Typography>

                            <Stack direction="row" spacing={0.8} alignItems="center">
                                <EmailRoundedIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
                                <Typography
                                    sx={{
                                        fontSize: 13.5,
                                        color: "#64748b",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {user.email || "No email"}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Tooltip title={roleConfig.label}>
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "14px",
                                bgcolor: roleConfig.bg,
                                color: roleConfig.color,
                                border: `1px solid ${roleConfig.border}`,
                                flexShrink: 0,
                            }}
                        >
                            {roleConfig.icon}
                        </Avatar>
                    </Tooltip>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        sx={{
                            borderRadius: "999px",
                            fontWeight: 800,
                            color: statusConfig.color,
                            bgcolor: statusConfig.bg,
                            border: `1px solid ${statusConfig.border}`,
                            "& .MuiChip-icon": {
                                color: statusConfig.color,
                            },
                        }}
                    />

                    <Chip
                        icon={roleConfig.icon}
                        label={roleConfig.label}
                        sx={{
                            borderRadius: "999px",
                            fontWeight: 800,
                            color: roleConfig.color,
                            bgcolor: roleConfig.bg,
                            border: `1px solid ${roleConfig.border}`,
                            "& .MuiChip-icon": {
                                color: roleConfig.color,
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
                    }}
                >
                    <Stack spacing={1.1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <BadgeRoundedIcon sx={{ fontSize: 17, color: "#6d61d2" }} />
                                <Typography
                                    sx={{
                                        color: "#334155",
                                        fontWeight: 700,
                                        fontSize: 13.5,
                                    }}
                                >
                                    User ID
                                </Typography>
                            </Stack>

                            <Typography
                                sx={{
                                    color: "#0f172a",
                                    fontWeight: 900,
                                    fontSize: 13.5,
                                }}
                            >
                                #{user.id}
                            </Typography>
                        </Stack>

                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={1} alignItems="center">
                                <CircleRoundedIcon
                                    sx={{
                                        fontSize: 11,
                                        color: user.is_active ? "#22c55e" : "#ef4444",
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color: "#334155",
                                        fontWeight: 700,
                                        fontSize: 13.5,
                                    }}
                                >
                                    Access state
                                </Typography>
                            </Stack>

                            <Typography
                                sx={{
                                    color: user.is_active ? "#16a34a" : "#dc2626",
                                    fontWeight: 900,
                                    fontSize: 13.5,
                                }}
                            >
                                {user.is_active ? "Enabled" : "Blocked"}
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>

                <Stack direction="row" spacing={1.2}>
                    <Tooltip
                        title={
                            isAdmin
                                ? "Admin cannot be modified"
                                : user.is_active
                                    ? "Disable user"
                                    : "Enable user"
                        }
                    >
                        <IconButton
                            onClick={() => onToggle(user.id)}
                            disabled={isBusy || isAdmin}
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: "16px",
                                bgcolor: user.is_active
                                    ? "rgba(245,158,11,0.10)"
                                    : "rgba(34,197,94,0.10)",
                                color: user.is_active ? "#d97706" : "#16a34a",
                                border: `1px solid ${user.is_active
                                    ? "rgba(245,158,11,0.20)"
                                    : "rgba(34,197,94,0.18)"
                                    }`,
                                "&:hover": {
                                    bgcolor: user.is_active
                                        ? "rgba(245,158,11,0.16)"
                                        : "rgba(34,197,94,0.16)",
                                },
                            }}
                        >
                            {isBusy ? (
                                <CircularProgress size={18} sx={{ color: "inherit" }} />
                            ) : user.is_active ? (
                                <ToggleOffRoundedIcon />
                            ) : (
                                <ToggleOnRoundedIcon />
                            )}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={isAdmin ? "Admin cannot be deleted" : "Delete user"}>
                        <IconButton
                            onClick={() => onDelete(user.id)}
                            disabled={isBusy || isAdmin}
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
                                <DeleteOutlineRoundedIcon />
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
                            User actions
                        </Typography>

                        <ArrowOutwardRoundedIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                    </Paper>
                </Stack>
            </Stack>
        </MotionPaper>
    );
}

export default function AdminAllUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("NEWEST");

    const loadUsers = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            setError("");
            const res = await API.get("/api/admin/users/");
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.log(err);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleToggle = async (id) => {
        try {
            setActionLoading(id);
            await API.patch(`/api/admin/users/${id}/toggle/`);
            await loadUsers(true);
        } catch (err) {
            console.log(err);
            setError(
                err?.response?.data?.error || "Failed to update user status."
            );
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This user will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#6d61d2",
            cancelButtonColor: "#94a3b8",
            confirmButtonText: "Yes, delete it",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            backdrop: true,
            background: "#ffffff",
            borderRadius: "16px",
        });

        if (!result.isConfirmed) return;

        try {
            setActionLoading(id);

            await API.delete(`/api/admin/users/${id}/delete/`);

            // ✅ success popup
            Swal.fire({
                title: "Deleted!",
                text: "User has been deleted successfully.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false,
            });

            await loadUsers(true);

        } catch (err) {
            console.log(err);

            Swal.fire({
                title: "Error",
                text: err?.response?.data?.error || "Failed to delete user.",
                icon: "error",
            });

        } finally {
            setActionLoading(null);
        }
    };
    const filteredUsers = useMemo(() => {
        let list = Array.isArray(users) ? [...users] : [];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter((user) => {
                return (
                    String(user.username || "").toLowerCase().includes(q) ||
                    String(user.email || "").toLowerCase().includes(q) ||
                    String(user.id || "").includes(q)
                );
            });
        }

        if (roleFilter !== "ALL") {
            list = list.filter((user) =>
                roleFilter === "ADMIN" ? user.is_staff : !user.is_staff
            );
        }

        if (statusFilter !== "ALL") {
            list = list.filter((user) =>
                statusFilter === "ACTIVE" ? user.is_active : !user.is_active
            );
        }

        list.sort((a, b) => {
            if (sortBy === "NEWEST") return Number(b.id) - Number(a.id);
            if (sortBy === "OLDEST") return Number(a.id) - Number(b.id);
            if (sortBy === "A_Z")
                return String(a.username || "").localeCompare(String(b.username || ""));
            if (sortBy === "Z_A")
                return String(b.username || "").localeCompare(String(a.username || ""));
            return 0;
        });

        return list;
    }, [users, search, roleFilter, statusFilter, sortBy]);

    const stats = useMemo(() => {
        const total = users.length;
        const active = users.filter((u) => u.is_active).length;
        const disabled = users.filter((u) => !u.is_active).length;
        const admins = users.filter((u) => u.is_staff).length;

        return { total, active, disabled, admins };
    }, [users]);

    const hasActiveFilters =
        search.trim() !== "" || roleFilter !== "ALL" || statusFilter !== "ALL";

    const resetFilters = () => {
        setSearch("");
        setRoleFilter("ALL");
        setStatusFilter("ALL");
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
                <Container
                    maxWidth={false}
                    sx={{
                        px: { xs: 1, sm: 2, md: 3 },

                        // 👇 THIS IS THE MAGIC FIX
                        width: "100%",

                        // responsive max width
                        maxWidth: {
                            xs: "100%",
                            sm: "100%",
                            md: "100%",
                            lg: "1200px",
                            xl: "1400px",
                        },

                        mx: "auto",
                    }}
                >
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
                                        label="Users workspace"
                                        sx={{
                                            mb: 1.5,
                                            borderRadius: "999px",
                                            bgcolor: "rgba(109,97,210,0.10)",
                                            color: "#6d61d2",
                                            fontWeight: 800,
                                            border: "1px solid rgba(109,97,210,0.16)",
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            fontSize: { xs: "2rem", md: "3rem" },
                                            lineHeight: 1.02,
                                            fontWeight: 950,
                                            letterSpacing: "-0.05em",
                                            color: "#0f172a",
                                            mb: 1,
                                        }}
                                    >
                                        Users Management
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#64748b",
                                            maxWidth: 760,
                                            lineHeight: 1.85,
                                            fontSize: { xs: "0.96rem", md: "1rem" },
                                        }}
                                    >
                                        Review every platform account, monitor activation status,
                                        identify admin accounts, and manage access from one clean,
                                        premium admin workspace.
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
                                        sx={{ mt: 1.8 }}
                                    >
                                        <Chip
                                            icon={<VerifiedRoundedIcon />}
                                            label={`${stats.total} total users`}
                                            sx={heroChipStyle}
                                        />
                                        <Chip
                                            icon={<BoltRoundedIcon />}
                                            label={`${stats.active} active accounts`}
                                            sx={heroChipStyle}
                                        />
                                        <Chip
                                            icon={<ShieldRoundedIcon />}
                                            label={`${stats.admins} admin accounts`}
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
                                                    Workspace readiness
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
                                                    100%
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
                                                <AdminPanelSettingsRoundedIcon />
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
                                            User management is connected and ready for moderation.
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
                                        onClick={() => loadUsers(true)}
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
                                        Refresh users
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
                                            title="Total users"
                                            value={stats.total}
                                            helper="All registered platform accounts"
                                            icon={<Groups2RoundedIcon />}
                                            accent="#6d61d2"
                                            softBg="rgba(109,97,210,0.10)"
                                        />
                                    </MotionBox>
                                </Grid>

                                <Grid item xs={12} sm={6} xl={3}>
                                    <MotionBox variants={fadeUp}>
                                        <StatCard
                                            title="Active users"
                                            value={stats.active}
                                            helper="Accounts currently allowed access"
                                            icon={<CheckCircleRoundedIcon />}
                                            accent="#16a34a"
                                            softBg="rgba(34,197,94,0.10)"
                                        />
                                    </MotionBox>
                                </Grid>

                                <Grid item xs={12} sm={6} xl={3}>
                                    <MotionBox variants={fadeUp}>
                                        <StatCard
                                            title="Disabled users"
                                            value={stats.disabled}
                                            helper="Accounts currently blocked"
                                            icon={<BlockRoundedIcon />}
                                            accent="#ef4444"
                                            softBg="rgba(239,68,68,0.10)"
                                        />
                                    </MotionBox>
                                </Grid>

                                <Grid item xs={12} sm={6} xl={3}>
                                    <MotionBox variants={fadeUp}>
                                        <StatCard
                                            title="Admin accounts"
                                            value={stats.admins}
                                            helper="Privileged accounts on the platform"
                                            icon={<ShieldRoundedIcon />}
                                            accent="#f59e0b"
                                            softBg="rgba(245,158,11,0.12)"
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
                                            Filter users
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: 13.5,
                                                color: "#64748b",
                                                lineHeight: 1.7,
                                            }}
                                        >
                                            Search by username, email, or ID and filter the result set.
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
                                            active={statusFilter === "ALL" && roleFilter === "ALL"}
                                            label="All accounts"
                                            onClick={() => {
                                                setRoleFilter("ALL");
                                                setStatusFilter("ALL");
                                            }}
                                        />
                                        <FilterPill
                                            active={statusFilter === "ACTIVE"}
                                            label="Active"
                                            onClick={() => setStatusFilter("ACTIVE")}
                                        />
                                        <FilterPill
                                            active={statusFilter === "DISABLED"}
                                            label="Disabled"
                                            onClick={() => setStatusFilter("DISABLED")}
                                        />
                                        <FilterPill
                                            active={roleFilter === "ADMIN"}
                                            label="Admins"
                                            onClick={() => setRoleFilter("ADMIN")}
                                        />
                                    </Stack>
                                </Stack>

                                <Grid container spacing={1.6}>
                                    <Grid item xs={12} xl={5}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search by username, email, or user ID..."
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
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            sx={selectStyle}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <ShieldRoundedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                                                </InputAdornment>
                                            }
                                        >
                                            <MenuItem value="ALL">All roles</MenuItem>
                                            <MenuItem value="ADMIN">Admins</MenuItem>
                                            <MenuItem value="USER">Users</MenuItem>
                                        </Select>
                                    </Grid>

                                    <Grid item xs={12} sm={6} xl={2.5}>
                                        <Select
                                            fullWidth
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            sx={selectStyle}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <FilterAltRoundedIcon sx={{ color: "#94a3b8", fontSize: 18 }} />
                                                </InputAdornment>
                                            }
                                        >
                                            <MenuItem value="ALL">All statuses</MenuItem>
                                            <MenuItem value="ACTIVE">Active</MenuItem>
                                            <MenuItem value="DISABLED">Disabled</MenuItem>
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

                        {loading ? (
                            <Grid
                                container
                                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                                sx={{ alignItems: "stretch" }}
                            >
                                {Array.from({ length: 8 }).map((_, index) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={12}   // ✅ FIX (important)
                                        md={6}    // ✅ iPad → 2 columns
                                        lg={4}
                                        xl={3}
                                        key={index}
                                    >
                                        <UserCardSkeleton />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : filteredUsers.length === 0 ? (
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
                                    sx={{ alignItems: "stretch" }}
                                >
                                    {filteredUsers.map((user) => (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={12}   // ✅ FIX (important)
                                            md={6}    // ✅ iPad → perfect 2 cards
                                            lg={4}
                                            xl={3}
                                            key={user.id}
                                        >
                                            <UserCard
                                                user={user}
                                                actionLoading={actionLoading}
                                                onToggle={handleToggle}
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