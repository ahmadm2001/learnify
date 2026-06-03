// src/pages/instructor/CreateScheduleSessionPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    MenuItem,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import { TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function CreateScheduleSessionPage() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [lectures, setLectures] = useState([]);

    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedLecture, setSelectedLecture] = useState("");

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [endTime, setEndTime] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [timeFormat, setTimeFormat] = useState("12h");

    const [errorDialogOpen, setErrorDialogOpen] = useState(false);
    const [conflictData, setConflictData] = useState(null);

    useEffect(() => {
        API.get("/api/courses/")
            .then((res) => setCourses(res.data || []))
            .catch(() => { });
    }, []);

    const handleCourseChange = async (courseId) => {
        setSelectedCourse(courseId);
        setSelectedLecture("");
        setLectures([]);

        try {
            const res = await API.get(`/api/courses/${courseId}/curriculum/`);
            const allLectures = res.data.flatMap((section) => section.lectures || []);
            setLectures(allLectures);
        } catch {
            setLectures([]);
        }
    };

    const formatDisplayTime = (value) => {
        if (!value) return "";

        if (timeFormat === "24h") return value;

        const [hours, minutes] = value.split(":");
        let h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";

        h = h % 12;
        if (h === 0) h = 12;

        return `${h}:${minutes} ${ampm}`;
    };

    const handleSchedule = async () => {
        setError("");

        if (!selectedLecture) {
            setError("Please select a lecture.");
            setErrorDialogOpen(true);
            return;
        }

        if (!date || !time || !endTime) {
            setError("Please select start and end time.");
            setErrorDialogOpen(true);
            return;
        }

        try {
            setLoading(true);

            const startDateTime = `${date}T${time}:00`;
            const endDateTime = `${date}T${endTime}:00`;

            await API.post(`/api/lectures/${selectedLecture}/schedule/`, {
                start_time: startDateTime,
                end_time: endDateTime,
            });

            navigate("/instructor/scheduled-sessions");

        } catch (err) {
            console.error(err);

            const data = err.response?.data;

            // ✅ handle conflict data (FROM BACKEND)
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

            // ✅ OPEN POPUP
            setErrorDialogOpen(true);

        } finally {
            setLoading(false);
        }
    };

    const selectedCourseObj = courses.find((c) => c.id === selectedCourse);
    const selectedLectureObj = lectures.find((l) => l.id === selectedLecture);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: 6,
                background: "linear-gradient(135deg,#f5f3ff 0%,#eef2ff 100%)",
            }}
        >
            <Container maxWidth="lg">
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 3 }}
                >
                    Back
                </Button>

                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                    <Card
                        sx={{
                            flex: 1,
                            p: 4,
                            borderRadius: "28px",
                            backdropFilter: "blur(12px)",
                            background: "rgba(255,255,255,0.85)",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.08)",
                        }}
                    >
                        <Stack spacing={3}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar sx={{ bgcolor: "#7c3aed" }}>
                                    <CalendarMonthRoundedIcon />
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={900} fontSize={22}>
                                        Create Live Session
                                    </Typography>
                                    <Typography color="text.secondary">
                                        Schedule using start & end time
                                    </Typography>
                                </Box>
                            </Stack>

                            <Divider />


                            <TextField
                                select
                                label="Select Course"
                                value={selectedCourse}
                                onChange={(e) => handleCourseChange(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SchoolRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {courses.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.title}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Select Lecture"
                                value={selectedLecture}
                                onChange={(e) => setSelectedLecture(e.target.value)}
                                disabled={!selectedCourse}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MenuBookRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                {lectures.map((l) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.title}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                type="date"
                                label="Date"
                                InputLabelProps={{ shrink: true }}
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EventAvailableRoundedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant={
                                        timeFormat === "12h" ? "contained" : "outlined"
                                    }
                                    onClick={() => setTimeFormat("12h")}
                                    sx={{
                                        borderRadius: "999px",
                                        fontWeight: 800,
                                        minWidth: 84,
                                    }}
                                >
                                    12H
                                </Button>

                                <Button
                                    variant={
                                        timeFormat === "24h" ? "contained" : "outlined"
                                    }
                                    onClick={() => setTimeFormat("24h")}
                                    sx={{
                                        borderRadius: "999px",
                                        fontWeight: 800,
                                        minWidth: 84,
                                    }}
                                >
                                    24H
                                </Button>
                            </Stack>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    label="Start Time"
                                    value={time ? dayjs(`2024-01-01T${time}`) : null}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            setTime(newValue.format("HH:mm"));
                                        } else {
                                            setTime("");
                                        }
                                    }}
                                    ampm={timeFormat === "12h"}
                                    format={timeFormat === "12h" ? "hh:mm A" : "HH:mm"}
                                    minutesStep={5}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AccessTimeRoundedIcon />
                                                    </InputAdornment>
                                                ),
                                            },
                                        },
                                    }}
                                />

                                <TimePicker
                                    label="End Time"
                                    value={endTime ? dayjs(`2024-01-01T${endTime}`) : null}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            setEndTime(newValue.format("HH:mm"));
                                        } else {
                                            setEndTime("");
                                        }
                                    }}
                                    ampm={timeFormat === "12h"}
                                    format={timeFormat === "12h" ? "hh:mm A" : "HH:mm"}
                                    minutesStep={5}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <AccessTimeRoundedIcon />
                                                    </InputAdornment>
                                                ),
                                            },
                                        },
                                    }}
                                />
                            </LocalizationProvider>

                            <Button
                                onClick={handleSchedule}
                                disabled={!selectedLecture || loading}
                                sx={{
                                    mt: 2,
                                    alignSelf: "flex-start",
                                    px: 4,
                                    py: 1.4,
                                    borderRadius: "999px",
                                    fontWeight: 900,
                                    background:
                                        "linear-gradient(135deg,#7c3aed,#4f46e5)",
                                    color: "#fff",
                                    boxShadow: "0 15px 40px rgba(124,58,237,0.4)",
                                    "&:hover": {
                                        background:
                                            "linear-gradient(135deg,#6d28d9,#4338ca)",
                                    },
                                    "&.Mui-disabled": {
                                        color: "#fff",
                                        opacity: 0.7,
                                    },
                                }}
                            >
                                {loading ? "Creating..." : "Create Session"}
                            </Button>
                        </Stack>
                    </Card>

                    <Card
                        sx={{
                            width: { md: 320 },
                            p: 3,
                            borderRadius: "28px",
                            background:
                                "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.18))",
                            border: "1px solid rgba(124,58,237,0.18)",
                            backdropFilter: "blur(14px)",
                        }}
                    >
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <AutoAwesomeRoundedIcon />
                                <Typography fontWeight={900}>Live Preview</Typography>
                            </Stack>

                            <Divider />

                            <Typography fontSize={14}>Course:</Typography>
                            <Typography fontWeight={800}>
                                {selectedCourseObj?.title || "—"}
                            </Typography>

                            <Typography fontSize={14}>Lecture:</Typography>
                            <Typography fontWeight={800}>
                                {selectedLectureObj?.title || "—"}
                            </Typography>

                            <Typography fontSize={14}>Time:</Typography>
                            <Typography fontWeight={800}>
                                {date && time && endTime
                                    ? `${date} | ${formatDisplayTime(time)} → ${formatDisplayTime(endTime)}`
                                    : "—"}
                            </Typography>

                            <Chip
                                label="Students will see this session"
                                sx={{
                                    mt: 2,
                                    bgcolor: "rgba(124,58,237,0.15)",
                                }}
                            />
                        </Stack>
                    </Card>
                </Stack>
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
                                {new Date(conflictData.start).toLocaleString()} UTC →{" "}
                                {new Date(conflictData.end).toLocaleString()} UTC
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