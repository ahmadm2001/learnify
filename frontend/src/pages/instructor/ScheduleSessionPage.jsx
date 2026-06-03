// src/pages/instructor/ScheduleSessionPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../lib/api";

import {
    Box,
    Container,
    Typography,
    Card,
    TextField,
    Button,
    Stack,
    Avatar,
    Divider,
    InputAdornment,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function ScheduleSessionPage() {
    const { lectureId } = useParams();
    const navigate = useNavigate();

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [conflictData, setConflictData] = useState(null);

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: "18px",
            background:
                "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(250,247,255,0.92))",
            transition: "all 0.22s ease",
            boxShadow: "0 8px 24px rgba(17,24,39,0.03)",
            "& fieldset": {
                borderColor: "rgba(124,58,237,0.16)",
            },
            "&:hover fieldset": {
                borderColor: "rgba(124,58,237,0.28)",
            },
            "&.Mui-focused": {
                boxShadow: "0 12px 30px rgba(124,58,237,0.10)",
            },
            "&.Mui-focused fieldset": {
                borderColor: "#7c3aed",
                borderWidth: "1px",
            },
        },
        "& .MuiInputAdornment-root svg": {
            color: "#7c3aed",
            opacity: 0.9,
        },
        "& .MuiInputLabel-root.Mui-focused": {
            color: "#7c3aed",
        },
    };

    const handleSchedule = async () => {
        setError("");

        if (!date || !time || !endTime) {
            setError("Please select start and end time.");
            setErrorDialogOpen(true);
            return;
        }

        try {
            setLoading(true);

            const startDateTime = `${date}T${time}:00`;
            const endDateTime = `${date}T${endTime}:00`;

            await API.post(`/api/lectures/${lectureId}/schedule/`, {
                start_time: startDateTime,
                end_time: endDateTime,
            });

            navigate(`/instructor/live-session/${lectureId}`);

        } catch (err) {
            console.error(err);

            const data = err.response?.data;

            // ✅ conflict support (same as first page)
            if (data?.conflict) {
                setConflictData(data.conflict);
            } else {
                setConflictData(null);
            }

            setError(
                data?.detail ||
                data?.error ||
                "Failed to schedule session."
            );

            setErrorDialogOpen(true);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 4, md: 6 },
                background:
                    "radial-gradient(circle at top left, rgba(124,58,237,0.12), transparent 30%), radial-gradient(circle at top right, rgba(99,102,241,0.08), transparent 25%), linear-gradient(180deg, #ffffff 0%, #faf7ff 40%, #f3ecff 100%)",
            }}
        >
            <Container maxWidth="sm">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{
                        mb: 2.2,
                        textTransform: "none",
                        fontWeight: 800,
                        color: "#5b21b6",
                        borderRadius: "999px",
                        px: 1.4,
                        py: 0.8,
                        background: "rgba(255,255,255,0.65)",
                        border: "1px solid rgba(124,58,237,0.12)",
                        backdropFilter: "blur(8px)",
                        "&:hover": {
                            background: "rgba(124,58,237,0.06)",
                        },
                    }}
                >
                    Back
                </Button>

                <Card
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: "30px",
                        border: "1px solid rgba(124,58,237,0.14)",
                        boxShadow: "0 30px 80px rgba(17,24,39,0.10)",
                        backdropFilter: "blur(12px)",
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(250,247,255,0.98) 100%)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: -40,
                            right: -40,
                            width: 170,
                            height: 170,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(124,58,237,0.16), rgba(124,58,237,0.03))",
                            filter: "blur(10px)",
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            left: -50,
                            bottom: -60,
                            width: 180,
                            height: 180,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(99,102,241,0.10), rgba(99,102,241,0.02))",
                            filter: "blur(10px)",
                        }}
                    />

                    <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    sx={{
                                        width: 62,
                                        height: 62,
                                        bgcolor: "rgba(124,58,237,0.12)",
                                        color: "#7c3aed",
                                        boxShadow: "0 12px 28px rgba(124,58,237,0.14)",
                                    }}
                                >
                                    <CalendarMonthRoundedIcon />
                                </Avatar>

                                <Box>
                                    <Typography
                                        variant="h5"
                                        fontWeight={900}
                                        sx={{ letterSpacing: -0.5 }}
                                    >
                                        Schedule Session
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                        Plan your live class for later with precise timing and a
                                        premium scheduling flow.
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <Chip
                                    icon={<ScheduleRoundedIcon />}
                                    label="Smart scheduling"
                                    sx={{
                                        borderRadius: "999px",
                                        fontWeight: 800,
                                        bgcolor: "rgba(124,58,237,0.10)",
                                        color: "#7c3aed",
                                        border: "1px solid rgba(124,58,237,0.16)",
                                    }}
                                />
                                <Chip
                                    icon={<AutoAwesomeRoundedIcon />}
                                    label="Professional setup"
                                    sx={{
                                        borderRadius: "999px",
                                        fontWeight: 800,
                                        bgcolor: "rgba(99,102,241,0.08)",
                                        color: "#4f46e5",
                                        border: "1px solid rgba(99,102,241,0.14)",
                                    }}
                                />
                            </Stack>
                        </Stack>

                        <Divider />

                        <Stack spacing={2.2}>
                            <TextField
                                label="Select Date"
                                type="date"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                sx={inputSx}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EventAvailableRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="Select Time"
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                sx={inputSx}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccessTimeRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                label="End Time"
                                type="time"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                sx={inputSx}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccessTimeRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        <Button
                            variant="contained"
                            onClick={handleSchedule}
                            disabled={loading}
                            endIcon={loading ? null : <ArrowForwardRoundedIcon />}
                            sx={{
                                mt: 0.5,
                                alignSelf: "flex-start",
                                px: 3.5,
                                py: 1.3,
                                borderRadius: "999px",
                                fontWeight: 900,
                                fontSize: "0.98rem",
                                letterSpacing: "0.2px",
                                textTransform: "none",
                                color: "#fff",
                                background:
                                    "linear-gradient(135deg, #7c3aed 0%, #6366f1 60%, #4f46e5 100%)",
                                boxShadow: "0 15px 35px rgba(124,58,237,0.32)",
                                transition: "all 0.22s ease",
                                "&:hover": {
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 18px 42px rgba(124,58,237,0.40)",
                                    background:
                                        "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                                },
                                "&:disabled": {
                                    color: "#fff",
                                    opacity: 0.75,
                                },
                            }}
                        >
                            {loading ? "Scheduling..." : "Schedule Meeting"}
                        </Button>

                        <Box
                            sx={{
                                p: 2.2,
                                borderRadius: "18px",
                                background:
                                    "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.06))",
                                border: "1px solid rgba(99,102,241,0.14)",
                                boxShadow: "0 10px 25px rgba(99,102,241,0.08)",
                            }}
                        >
                            <Typography fontWeight={900} sx={{ mb: 1 }}>
                                Important Notes
                            </Typography>

                            <Stack spacing={0.8}>
                                <Typography fontSize={14} color="text.secondary">
                                    • Time will be converted automatically to UTC.
                                </Typography>
                                <Typography fontSize={14} color="text.secondary">
                                    • Students will only be able to join during the scheduled time.
                                </Typography>
                                <Typography fontSize={14} color="text.secondary">
                                    • After the session ends, access will be automatically blocked.
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Card>
            </Container>

            <Dialog
                open={errorDialogOpen}
                onClose={() => setErrorDialogOpen(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "20px",
                        p: 0,
                        width: 440,
                        overflow: "hidden",
                        boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
                    },
                }}
                BackdropProps={{
                    sx: {
                        backdropFilter: "blur(6px)",
                        backgroundColor: "rgba(0,0,0,0.35)",
                    },
                }}
            >
                {/* HEADER */}
                <Box
                    sx={{
                        px: 3,
                        py: 2.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        borderBottom: "1px solid #eee",
                    }}
                >
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: "12px",
                            background: "rgba(239,68,68,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            color: "#ef4444",
                            fontSize: 20,
                        }}
                    >
                        !
                    </Box>

                    <Typography fontWeight={900} fontSize={18}>
                        Scheduling Conflict
                    </Typography>
                </Box>

                {/* CONTENT */}
                <DialogContent sx={{ px: 3, py: 2.5 }}>
                    <Typography
                        sx={{
                            mb: 2,
                            fontSize: 14,
                            color: "text.secondary",
                        }}
                    >
                        {error}
                    </Typography>

                    {conflictData && (
                        <Box
                            sx={{
                                p: 2,
                                borderRadius: "14px",
                                background:
                                    "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.04))",
                                border: "1px solid rgba(239,68,68,0.2)",
                            }}
                        >
                            <Typography
                                fontWeight={900}
                                fontSize={13}
                                sx={{ color: "#ef4444", mb: 1 }}
                            >
                                Conflicting Session
                            </Typography>

                            <Typography fontSize={13}>
                                <strong>Course:</strong> {conflictData.course}
                            </Typography>

                            <Typography fontSize={13} sx={{ mt: 0.5 }}>
                                <strong>Time:</strong>{" "}
                                {new Date(conflictData.start).toLocaleString()} →{" "}
                                {new Date(conflictData.end).toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>

                {/* ACTION */}
                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                        pt: 1,
                        justifyContent: "flex-end",
                    }}
                >
                    <Button
                        onClick={() => setErrorDialogOpen(false)}
                        sx={{
                            borderRadius: "999px",
                            px: 3,
                            py: 1,
                            fontWeight: 800,
                            color: "#fff",
                            background: "linear-gradient(135deg,#ef4444,#dc2626)",
                            boxShadow: "0 8px 20px rgba(239,68,68,0.3)",
                            "&:hover": {
                                background: "linear-gradient(135deg,#dc2626,#b91c1c)",
                            },
                        }}
                    >
                        Got it
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}