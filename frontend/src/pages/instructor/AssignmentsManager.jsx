import { useEffect, useState } from "react";
import API from "../../lib/api";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import {
    Box,
    Container,
    Paper,
    TextField,
    Typography,
    Button,
    Stack,
    Divider,
    MenuItem,
    IconButton,
    Chip,
    Avatar,
    CircularProgress,
} from "@mui/material";

import AttachFileIcon from "@mui/icons-material/AttachFile";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CloseIcon from "@mui/icons-material/Close";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TopicRoundedIcon from "@mui/icons-material/TopicRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import Swal from "sweetalert2";


const palette = {
    primary: "#7c3aed",
    secondary: "#6366f1",
    dark: "#111827",
    muted: "#6b7280",
    softText: "#94a3b8",
    border: "rgba(124,58,237,0.14)",
    borderStrong: "rgba(124,58,237,0.22)",
    softBg: "#faf7ff",
    softBg2: "#f5efff",
    chipBg: "rgba(124,58,237,0.10)",
    white: "#ffffff",
};

const fieldSx = {
    "& .MuiOutlinedInput-root": {
        borderRadius: 1,
        backgroundColor: "#fff",
        transition: "all 0.2s ease",
        "& fieldset": {
            borderColor: "rgba(148,163,184,0.28)",
        },
        "&:hover fieldset": {
            borderColor: "rgba(124,58,237,0.28)",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#7c3aed",
            boxShadow: "0 0 0 4px rgba(124,58,237,0.08)",
        },
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: palette.primary,
    },
};

function SummaryRow({ icon, label, value }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                py: 1.1,
            }}
        >
            <Avatar
                sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "rgba(124,58,237,0.10)",
                    color: palette.primary,
                }}
            >
                {icon}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: palette.muted,
                        display: "block",
                        lineHeight: 1.2,
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    sx={{
                        color: palette.dark,
                        fontWeight: 700,
                        lineHeight: 1.35,
                        wordBreak: "break-word",
                    }}
                >
                    {value || "Not selected"}
                </Typography>
            </Box>
        </Box>
    );
}

export default function AssignmentsManager() {
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [dueTime, setDueTime] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedLecture, setSelectedLecture] = useState("");

    const [title, setTitle] = useState("");
    const [instructions, setInstructions] = useState("");
    const [points, setPoints] = useState(100);
    const [dueDate, setDueDate] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [creating, setCreating] = useState(false);


    /* ================= LOAD COURSES ================= */
    useEffect(() => {
        API.get("/api/instructor/courses/")
            .then((res) => setCourses(res.data))
            .catch(() => alert("Failed to load courses"));
    }, []);

    /* ================= LOAD SECTIONS ================= */
    useEffect(() => {
        if (!selectedCourse) return;

        API.get(`/api/courses/${selectedCourse}/curriculum/`)
            .then((res) => {
                setSections(res.data);
                setSelectedSection("");
                setLectures([]);
                setSelectedLecture("");
            })
            .catch(() => alert("Failed to load sections"));
    }, [selectedCourse]);

    /* ================= LOAD LECTURES ================= */
    useEffect(() => {
        if (!selectedSection) return;

        const section = sections.find((s) => s.id === Number(selectedSection));
        setLectures(section ? section.lectures : []);
        setSelectedLecture("");
    }, [selectedSection, sections]);

    /* ================= CREATE ASSIGNMENT ================= */
    const handleCreateAssignment = async () => {
        if (!title) {
            Swal.fire({
                title: "Missing Title",
                text: "Please enter assignment title",
                icon: "warning",
                confirmButtonColor: "#6366f1",
            });
            return;
        }

        if (!selectedLecture) {
            Swal.fire({
                title: "Select Lecture",
                text: "Please select a lecture first",
                icon: "warning",
                confirmButtonColor: "#6366f1",
            });
            return;
        }

        try {
            setCreating(true);

            const formData = new FormData();
            formData.append("title", title);
            formData.append("instructions", instructions);
            formData.append("points", points);
            formData.append("due_date", dueDate || "");

            if (attachment) {
                formData.append("attachment", attachment);
            }

            await API.post(`/api/lectures/${selectedLecture}/assignments/`, formData);

            Swal.fire({
                title: "Success 🎉",
                text: "Assignment created successfully!",
                icon: "success",
                confirmButtonColor: "#6366f1",
            });

            // RESET FORM
            setTitle("");
            setInstructions("");
            setPoints(100);
            setDueDate("");
            setDueTime("");
            setAttachment(null);

        } catch (err) {
            console.error(err);

            Swal.fire({
                title: "Error",
                text: "Failed to create assignment",
                icon: "error",
                confirmButtonColor: "#ef4444",
            });

        } finally {
            setCreating(false);
        }
    };

    const selectedCourseObj = courses.find((c) => String(c.id) === String(selectedCourse));
    const selectedSectionObj = sections.find((s) => String(s.id) === String(selectedSection));
    const selectedLectureObj = lectures.find((l) => String(l.id) === String(selectedLecture));

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 3, md: 5 },
                background:
                    "radial-gradient(circle at top left, rgba(124,58,237,0.09), transparent 24%), radial-gradient(circle at top right, rgba(99,102,241,0.07), transparent 20%), linear-gradient(180deg, #fcfbff 0%, #faf7ff 45%, #f5efff 100%)",
            }}
        >
            <Container maxWidth="xl">

                <Stack direction={{ xs: "column", xl: "row" }} spacing={3} alignItems="stretch">
                    {/* LEFT SIDE */}
                    <Paper
                        elevation={0}
                        sx={{
                            flex: 2,
                            p: { xs: 2, md: 3 },
                            borderRadius: 1,
                            border: `1px solid ${palette.border}`,
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,247,255,0.98) 100%)",
                            boxShadow: "0 20px 50px rgba(17,24,39,0.06)",
                        }}
                    >
                        <Box sx={{ mb: 2.5 }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 800,
                                    color: palette.dark,
                                    mb: 0.6,
                                }}
                            >
                                Assignment details
                            </Typography>
                            <Typography sx={{ color: palette.muted, lineHeight: 1.7 }}>
                                Choose where the assignment belongs, add the title and instructions,
                                then attach the supporting file if needed.
                            </Typography>
                        </Box>

                        <Stack spacing={2.2}>
                            <TextField
                                select
                                label="Select Course"
                                fullWidth
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                sx={fieldSx}
                            >
                                {courses.map((course) => (
                                    <MenuItem key={course.id} value={course.id}>
                                        {course.title}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Select Section"
                                fullWidth
                                value={selectedSection}
                                onChange={(e) => setSelectedSection(e.target.value)}
                                disabled={!selectedCourse}
                                sx={fieldSx}
                            >
                                {sections.map((sec) => (
                                    <MenuItem key={sec.id} value={sec.id}>
                                        {sec.title}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Select Lecture"
                                fullWidth
                                value={selectedLecture}
                                onChange={(e) => setSelectedLecture(e.target.value)}
                                disabled={!selectedSection}
                                sx={fieldSx}
                            >
                                {lectures.map((lec) => (
                                    <MenuItem key={lec.id} value={lec.id}>
                                        {lec.title}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Title *"
                                fullWidth
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                sx={fieldSx}
                            />

                            <TextField
                                label="Instructions (optional)"
                                fullWidth
                                multiline
                                rows={6}
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                sx={fieldSx}
                            />
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    color: palette.dark,
                                    mb: 0.6,
                                }}
                            >
                                Attachment
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: palette.muted,
                                    mb: 2.2,
                                    lineHeight: 1.7,
                                }}
                            >
                                Upload a file that students can use while working on the assignment.
                            </Typography>

                            <Paper
                                elevation={0}
                                sx={{
                                    p: 2.2,
                                    borderRadius: 1,
                                    border: "1px dashed rgba(124,58,237,0.24)",
                                    background:
                                        "linear-gradient(135deg, rgba(124,58,237,0.05) 0%, rgba(99,102,241,0.04) 100%)",
                                }}
                            >
                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={2}
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    justifyContent="space-between"
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <Avatar
                                            sx={{
                                                bgcolor: palette.chipBg,
                                                color: palette.primary,
                                            }}
                                        >
                                            <AttachFileIcon />
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontWeight: 700, color: palette.dark }}>
                                                Upload assignment file
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: palette.muted }}>
                                                PDF, DOCX, ZIP, or any supporting material
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            document.getElementById("assignment-file")?.click()
                                        }
                                        sx={{
                                            borderRadius: 999,
                                            px: 2.5,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            borderColor: palette.borderStrong,
                                            color: palette.primary,
                                        }}
                                    >
                                        Choose file
                                    </Button>
                                </Stack>

                                <input
                                    type="file"
                                    id="assignment-file"
                                    style={{ display: "none" }}
                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                />

                                {attachment && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            mt: 2.2,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            px: 2,
                                            py: 1.4,
                                            borderRadius: 3,
                                            bgcolor: "#fff",
                                            border: "1px solid rgba(148,163,184,0.20)",
                                        }}
                                    >
                                        <AttachFileIcon sx={{ color: palette.primary }} />

                                        <Typography
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: 14,
                                                color: palette.dark,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                flex: 1,
                                            }}
                                        >
                                            {attachment.name}
                                        </Typography>

                                        <IconButton
                                            size="small"
                                            onClick={() => setAttachment(null)}
                                            sx={{
                                                color: "#ef4444",
                                                "&:hover": {
                                                    bgcolor: "#fee2e2",
                                                },
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Paper>
                                )}
                            </Paper>
                        </Box>
                    </Paper>

                    {/* RIGHT SIDE */}
                    <Stack spacing={3} sx={{ flex: 1, minWidth: { xl: 360 } }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: 1,
                                border: `1px solid ${palette.border}`,
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,245,255,0.98) 100%)",
                                boxShadow: "0 18px 44px rgba(17,24,39,0.05)",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    color: palette.dark,
                                    mb: 0.6,
                                    fontSize: "1.06rem",
                                }}
                            >
                                Assignment settings
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: palette.muted,
                                    lineHeight: 1.7,
                                    mb: 2.2,
                                }}
                            >
                                Configure marks and due date before publishing the assignment.
                            </Typography>

                            <Stack spacing={2}>
                                <TextField
                                    label="Points"
                                    type="number"
                                    fullWidth
                                    value={points}
                                    onChange={(e) => setPoints(e.target.value)}
                                    sx={fieldSx}
                                />

                                <TextField
                                    label="Due Date"
                                    type="date"
                                    fullWidth
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    sx={fieldSx}
                                    InputLabelProps={{ shrink: true }}
                                />

                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <TimePicker
                                        label="Due Time (24h)"
                                        ampm={false}
                                        value={dueTime ? dayjs(`2000-01-01T${dueTime}`) : null}
                                        onChange={(newValue) => {
                                            if (newValue) {
                                                setDueTime(newValue.format("HH:mm"));
                                            } else {
                                                setDueTime("");
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                sx: {
                                                    ...fieldSx,
                                                    "& .MuiInputBase-root": {
                                                        minHeight: 56,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    onClick={handleCreateAssignment}
                                    disabled={creating}
                                    sx={{
                                        mt: 1,
                                        py: 1.45,
                                        fontWeight: 800,
                                        borderRadius: 999,
                                        textTransform: "none",
                                        background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                                        boxShadow: "0 16px 34px rgba(124,58,237,0.24)",

                                        "&.Mui-disabled": {
                                            color: "#fff",
                                            opacity: 1,
                                            background: "linear-gradient(135deg,#6366f1,#7c3aed)",
                                        },

                                        "&:hover": {
                                            background: "linear-gradient(135deg,#4f46e5,#6d28d9)",
                                        },
                                    }}
                                >
                                    {creating ? (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <CircularProgress size={18} sx={{ color: "#fff" }} />
                                            <span>Creating...</span>
                                        </Stack>
                                    ) : (
                                        <>
                                            <AssignmentIcon sx={{ mr: 1 }} />
                                            Assign
                                        </>
                                    )}
                                </Button>
                            </Stack>
                        </Paper>

                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, md: 2.5 },
                                borderRadius: 1,
                                border: `1px solid ${palette.border}`,
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,247,255,0.98) 100%)",
                                boxShadow: "0 18px 44px rgba(17,24,39,0.05)",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    color: palette.dark,
                                    mb: 1.2,
                                    fontSize: "1.04rem",
                                }}
                            >
                                Assignment summary
                            </Typography>

                            <Divider sx={{ mb: 1 }} />

                            <SummaryRow
                                icon={<MenuBookRoundedIcon fontSize="small" />}
                                label="Course"
                                value={selectedCourseObj?.title}
                            />

                            <Divider />

                            <SummaryRow
                                icon={<TopicRoundedIcon fontSize="small" />}
                                label="Section"
                                value={selectedSectionObj?.title}
                            />

                            <Divider />

                            <SummaryRow
                                icon={<PlayCircleOutlineRoundedIcon fontSize="small" />}
                                label="Lecture"
                                value={selectedLectureObj?.title}
                            />

                            <Divider />

                            <SummaryRow
                                icon={<StarsRoundedIcon fontSize="small" />}
                                label="Title"
                                value={title}
                            />

                            <Divider />

                            <SummaryRow
                                icon={<CalendarMonthRoundedIcon fontSize="small" />}
                                label="Due"
                                value={
                                    dueDate
                                        ? `${dueDate}${dueTime ? ` • ${dueTime}` : ""}`
                                        : ""
                                }
                            />

                            <Divider />

                            <SummaryRow
                                icon={<AssignmentIcon fontSize="small" />}
                                label="Points"
                                value={points}
                            />
                        </Paper>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}