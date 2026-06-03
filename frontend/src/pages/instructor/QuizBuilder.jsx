import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../lib/api";
import { Snackbar, Alert } from "@mui/material";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    IconButton,
    Stack,
    Radio,
    RadioGroup,
    FormControlLabel,
    Chip,
    Divider,
    MenuItem,
    Card,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import QuizRoundedIcon from "@mui/icons-material/QuizRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

export default function QuizBuilder() {
    const { lectureId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([]);
    const [quizId, setQuizId] = useState(null);

    // ================= LOAD EXISTING QUIZ =================
    useEffect(() => {
        API.get(`/api/lectures/${lectureId}/assessments/`)
            .then((res) => {
                if (res.data.length > 0) {
                    const quiz = res.data[0];
                    setQuizId(quiz.id);
                    setTitle(quiz.title);

                    const loadedQuestions = quiz.questions.map((q) => ({
                        id: q.id,
                        text: q.text,
                        type: q.question_type || "MCQ",
                        choices: (q.choices || []).map((c) => c.text),
                        correct_index: (q.choices || []).findIndex((c) => c.is_correct),
                    }));

                    setQuestions(loadedQuestions);
                }
            })
            .catch(() => { });
    }, [lectureId]);

    // ================= QUESTION FUNCTIONS =================
    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: "",
                type: "MCQ",
                choices: ["", ""],
                correct_index: 0,
            },
        ]);
    };

    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success", // success | error | warning | info
    });

    const showToast = (message, severity = "success") => {
        setToast({
            open: true,
            message,
            severity,
        });
    };

    const deleteQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    // ================= CHOICE FUNCTIONS =================
    const addChoice = (qIndex) => {
        const updated = [...questions];
        updated[qIndex].choices.push("");
        setQuestions(updated);
    };

    const removeChoice = (qIndex, cIndex) => {
        const updated = [...questions];
        if (updated[qIndex].choices.length <= 2) return;
        updated[qIndex].choices.splice(cIndex, 1);
        setQuestions(updated);
    };

    const updateChoice = (qIndex, cIndex, value) => {
        const updated = [...questions];
        updated[qIndex].choices[cIndex] = value;
        setQuestions(updated);
    };

    // ================= SAVE QUIZ =================
    const saveQuiz = async () => {
        if (!title.trim()) return showToast("Quiz title is required", "warning");

        const validQuestions = questions.filter((q) => q.text.trim() !== "");

        if (!quizId && validQuestions.length === 0) {
            return showToast("Add at least one question", "warning");
        }

        const formattedQuestions = validQuestions.map((q) => {
            // ✅ OPEN ENDED QUESTION
            if (q.type === "TEXT") {
                return {
                    text: q.text,
                    marks: 1,
                    question_type: "TEXT",
                    choices: [],
                };
            }

            // ✅ MCQ QUESTION (OLD LOGIC — UNCHANGED)
            return {
                text: q.text,
                marks: 1,
                question_type: "MCQ",
                choices: q.choices.map((choiceText, index) => ({
                    text: choiceText,
                    is_correct: index === q.correct_index,
                })),
            };
        });

        try {
            if (quizId) {
                await API.put(`/api/assessments/${quizId}/edit/`, {
                    title,
                    description: "",
                    max_attempts: 2,
                    lecture: Number(lectureId),
                    questions: formattedQuestions,
                });

                showToast("Quiz updated successfully!", "success");

                // ✅ Redirect after short delay
                setTimeout(() => {
                    navigate(-1); // go back
                }, 1000);

            } else {
                await API.post("/api/assessments/", {
                    lecture: lectureId,
                    title,
                    description: "",
                    max_attempts: 2,
                    questions: formattedQuestions,
                });

                showToast("Quiz created successfully!", "success");

                // ✅ Redirect after short delay
                setTimeout(() => {
                    navigate(-1); // go back
                }, 1000);
            }
        } catch (err) {
            console.error(err.response?.data || err);
            showToast("Error saving quiz", "error");
        }
    };

    const pageCardStyle = {
        borderRadius: "30px",
        border: "1px solid rgba(15,23,42,0.06)",
        background:
            "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.97))",
        boxShadow: "0 18px 50px rgba(15,23,42,0.07)",
        backdropFilter: "blur(10px)",
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                py: { xs: 3, md: 5 },
                background:
                    "radial-gradient(circle at top left, rgba(124,58,237,0.08), transparent 24%), radial-gradient(circle at top right, rgba(99,102,241,0.06), transparent 22%), linear-gradient(180deg, #f8fafc 0%, #f7f4ff 46%, #f8fafc 100%)",
            }}
        >
            <Container maxWidth="lg">
                <Paper
                    sx={{
                        ...pageCardStyle,
                        p: { xs: 2, sm: 3, md: 4 },
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: -60,
                            right: -60,
                            width: 220,
                            height: 220,
                            borderRadius: "50%",
                            background: "rgba(139,92,246,0.10)",
                            filter: "blur(40px)",
                            pointerEvents: "none",
                        }}
                    />

                    <Box
                        sx={{
                            position: "absolute",
                            bottom: -80,
                            left: -80,
                            width: 240,
                            height: 240,
                            borderRadius: "50%",
                            background: "rgba(99,102,241,0.08)",
                            filter: "blur(44px)",
                            pointerEvents: "none",
                        }}
                    />

                    {/* HEADER */}
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2}
                        alignItems={{ xs: "flex-start", md: "center" }}
                        justifyContent="space-between"
                        sx={{ position: "relative", zIndex: 1, mb: 3.5 }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: "20px",
                                    display: "grid",
                                    placeItems: "center",
                                    background:
                                        "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(99,102,241,0.12))",
                                    border: "1px solid rgba(124,58,237,0.16)",
                                    boxShadow: "0 12px 24px rgba(99,102,241,0.10)",
                                }}
                            >
                                <QuizRoundedIcon sx={{ color: "#6d28d9", fontSize: 30 }} />
                            </Box>

                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 950,
                                        letterSpacing: -1,
                                        color: "#0f172a",
                                        fontSize: { xs: "1.8rem", md: "2.25rem" },
                                    }}
                                >
                                    {quizId ? "Edit Quiz" : "Create Quiz"}
                                </Typography>

                                <Typography
                                    sx={{
                                        mt: 0.5,
                                        color: "#64748b",
                                        fontWeight: 500,
                                        fontSize: "0.98rem",
                                    }}
                                >
                                    Build a polished assessment experience for your students.
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="row" spacing={1.25} flexWrap="wrap">
                            <Chip
                                icon={<NotesRoundedIcon />}
                                label={`Questions: ${questions.length}`}
                                sx={{
                                    height: 36,
                                    fontWeight: 800,
                                    borderRadius: "999px",
                                    color: "#4338ca",
                                    bgcolor: "rgba(99,102,241,0.08)",
                                    border: "1px solid rgba(99,102,241,0.14)",
                                }}
                            />
                            <Chip
                                icon={<AutoAwesomeRoundedIcon />}
                                label={quizId ? "Editing mode" : "New quiz"}
                                sx={{
                                    height: 36,
                                    fontWeight: 800,
                                    borderRadius: "999px",
                                    color: "#7c3aed",
                                    bgcolor: "rgba(124,58,237,0.08)",
                                    border: "1px solid rgba(124,58,237,0.14)",
                                }}
                            />
                        </Stack>
                    </Stack>

                    {/* QUIZ TITLE */}
                    <Card
                        sx={{
                            ...pageCardStyle,
                            p: { xs: 2, md: 2.4 },
                            mb: 3,
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <Typography
                            sx={{
                                mb: 1.5,
                                fontWeight: 900,
                                color: "#0f172a",
                                fontSize: "1rem",
                            }}
                        >
                            Quiz details
                        </Typography>

                        <TextField
                            fullWidth
                            label="Quiz Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter a clear quiz title"
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "18px",
                                    bgcolor: "#fff",
                                },
                            }}
                        />
                    </Card>

                    {/* EMPTY STATE */}
                    {questions.length === 0 && (
                        <Card
                            sx={{
                                ...pageCardStyle,
                                p: { xs: 2.5, md: 3.5 },
                                mb: 3,
                                textAlign: "center",
                                position: "relative",
                                zIndex: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: "22px",
                                    display: "grid",
                                    placeItems: "center",
                                    mx: "auto",
                                    mb: 2,
                                    background:
                                        "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.10))",
                                    border: "1px solid rgba(124,58,237,0.14)",
                                }}
                            >
                                <AddIcon sx={{ fontSize: 32, color: "#6d28d9" }} />
                            </Box>

                            <Typography
                                sx={{
                                    fontWeight: 900,
                                    fontSize: "1.15rem",
                                    color: "#0f172a",
                                }}
                            >
                                Start building your quiz
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 1,
                                    color: "#64748b",
                                    maxWidth: 440,
                                    mx: "auto",
                                    lineHeight: 1.8,
                                }}
                            >
                                Add your first question to create a premium, clean quiz experience
                                for students.
                            </Typography>
                        </Card>
                    )}

                    {/* QUESTIONS */}
                    <Stack spacing={3} sx={{ position: "relative", zIndex: 1 }}>
                        {questions.map((q, qi) => (
                            <Card
                                key={qi}
                                sx={{
                                    ...pageCardStyle,
                                    p: { xs: 2, md: 3 },
                                    overflow: "hidden",
                                    position: "relative",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        background:
                                            "linear-gradient(135deg, rgba(124,58,237,0.03), rgba(99,102,241,0.01), rgba(255,255,255,0.4))",
                                        pointerEvents: "none",
                                    }}
                                />

                                <Stack
                                    direction={{ xs: "column", sm: "row" }}
                                    justifyContent="space-between"
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                    spacing={1.5}
                                    sx={{ mb: 2.5, position: "relative", zIndex: 1 }}
                                >
                                    <Stack direction="row" spacing={1.2} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: "14px",
                                                display: "grid",
                                                placeItems: "center",
                                                background:
                                                    "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.10))",
                                                border: "1px solid rgba(124,58,237,0.14)",
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: 900,
                                                    color: "#6d28d9",
                                                    fontSize: "0.95rem",
                                                }}
                                            >
                                                {qi + 1}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 900,
                                                    color: "#0f172a",
                                                    fontSize: "1rem",
                                                }}
                                            >
                                                Question {qi + 1}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: "#64748b",
                                                    fontSize: "0.88rem",
                                                    mt: 0.2,
                                                }}
                                            >
                                                Configure content, type, and answer options
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <IconButton
                                        onClick={() => deleteQuestion(qi)}
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: "14px",
                                            bgcolor: "rgba(239,68,68,0.08)",
                                            border: "1px solid rgba(239,68,68,0.14)",
                                            "&:hover": {
                                                bgcolor: "rgba(239,68,68,0.14)",
                                            },
                                        }}
                                    >
                                        <DeleteIcon sx={{ color: "#ef4444" }} />
                                    </IconButton>
                                </Stack>

                                <Stack spacing={2.2} sx={{ position: "relative", zIndex: 1 }}>
                                    <TextField
                                        fullWidth
                                        label="Question Text"
                                        value={q.text}
                                        onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                                        placeholder="Write the question clearly"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "18px",
                                                bgcolor: "#fff",
                                            },
                                        }}
                                    />

                                    {/* ✅ QUESTION TYPE SELECT */}
                                    <TextField
                                        select
                                        fullWidth
                                        label="Question Type"
                                        value={q.type}
                                        onChange={(e) => {
                                            const newType = e.target.value;
                                            const updated = [...questions];
                                            updated[qi].type = newType;

                                            if (newType === "TEXT") {
                                                updated[qi].choices = [];
                                                updated[qi].correct_index = 0;
                                            }

                                            if (newType === "MCQ" && updated[qi].choices.length === 0) {
                                                updated[qi].choices = ["", ""];
                                                updated[qi].correct_index = 0;
                                            }

                                            setQuestions(updated);
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "18px",
                                                bgcolor: "#fff",
                                            },
                                        }}
                                    >
                                        <MenuItem value="MCQ">Multiple Choice</MenuItem>
                                        <MenuItem value="TEXT">Open Ended</MenuItem>
                                    </TextField>

                                    <Divider />

                                    {/* ✅ MCQ UI */}
                                    {q.type === "MCQ" ? (
                                        <>
                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                justifyContent="space-between"
                                                alignItems={{ xs: "flex-start", sm: "center" }}
                                                spacing={1}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontWeight: 800,
                                                        color: "#0f172a",
                                                        fontSize: "0.98rem",
                                                    }}
                                                >
                                                    Choices
                                                </Typography>

                                                <Chip
                                                    icon={<RadioButtonCheckedRoundedIcon />}
                                                    label={`Correct: Choice ${q.correct_index + 1}`}
                                                    sx={{
                                                        fontWeight: 800,
                                                        borderRadius: "999px",
                                                        color: "#047857",
                                                        bgcolor: "rgba(16,185,129,0.10)",
                                                        border: "1px solid rgba(16,185,129,0.18)",
                                                    }}
                                                />
                                            </Stack>

                                            <RadioGroup
                                                value={q.correct_index}
                                                onChange={(e) =>
                                                    updateQuestion(qi, "correct_index", Number(e.target.value))
                                                }
                                            >
                                                <Stack spacing={1.4}>
                                                    {q.choices.map((choice, ci) => (
                                                        <Card
                                                            key={ci}
                                                            sx={{
                                                                p: 1.4,
                                                                borderRadius: "20px",
                                                                border:
                                                                    q.correct_index === ci
                                                                        ? "1px solid rgba(16,185,129,0.24)"
                                                                        : "1px solid rgba(15,23,42,0.06)",
                                                                background:
                                                                    q.correct_index === ci
                                                                        ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(255,255,255,0.98))"
                                                                        : "#fff",
                                                                boxShadow:
                                                                    q.correct_index === ci
                                                                        ? "0 10px 22px rgba(16,185,129,0.08)"
                                                                        : "0 6px 16px rgba(15,23,42,0.03)",
                                                            }}
                                                        >
                                                            <Stack
                                                                direction="row"
                                                                alignItems="center"
                                                                spacing={1}
                                                            >
                                                                <FormControlLabel
                                                                    value={ci}
                                                                    control={<Radio />}
                                                                    label=""
                                                                    sx={{ mr: 0 }}
                                                                />

                                                                <TextField
                                                                    fullWidth
                                                                    label={`Choice ${ci + 1}`}
                                                                    value={choice}
                                                                    onChange={(e) =>
                                                                        updateChoice(qi, ci, e.target.value)
                                                                    }
                                                                    sx={{
                                                                        "& .MuiOutlinedInput-root": {
                                                                            borderRadius: "16px",
                                                                            bgcolor: "#fff",
                                                                        },
                                                                    }}
                                                                />

                                                                {q.choices.length > 2 && (
                                                                    <IconButton
                                                                        onClick={() => removeChoice(qi, ci)}
                                                                        sx={{
                                                                            width: 40,
                                                                            height: 40,
                                                                            borderRadius: "12px",
                                                                            bgcolor: "rgba(239,68,68,0.08)",
                                                                            border: "1px solid rgba(239,68,68,0.14)",
                                                                            "&:hover": {
                                                                                bgcolor: "rgba(239,68,68,0.14)",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <DeleteIcon
                                                                            fontSize="small"
                                                                            sx={{ color: "#ef4444" }}
                                                                        />
                                                                    </IconButton>
                                                                )}
                                                            </Stack>
                                                        </Card>
                                                    ))}
                                                </Stack>
                                            </RadioGroup>

                                            <Stack
                                                direction={{ xs: "column", sm: "row" }}
                                                spacing={1.2}
                                                alignItems={{ xs: "stretch", sm: "center" }}
                                                justifyContent="space-between"
                                                sx={{ pt: 0.5 }}
                                            >
                                                <Button
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => addChoice(qi)}
                                                    sx={{
                                                        alignSelf: "flex-start",
                                                        borderRadius: "999px",
                                                        px: 2,
                                                        py: 0.9,
                                                        textTransform: "none",
                                                        fontWeight: 800,
                                                        color: "#5b21b6",
                                                        bgcolor: "rgba(124,58,237,0.08)",
                                                        border: "1px solid rgba(124,58,237,0.14)",
                                                        "&:hover": {
                                                            bgcolor: "rgba(124,58,237,0.12)",
                                                        },
                                                    }}
                                                >
                                                    Add Choice
                                                </Button>

                                                <Chip
                                                    icon={<CheckCircleRoundedIcon />}
                                                    label={`Correct Answer: Choice ${q.correct_index + 1}`}
                                                    sx={{
                                                        fontWeight: 800,
                                                        borderRadius: "999px",
                                                        color: "#047857",
                                                        bgcolor: "rgba(16,185,129,0.10)",
                                                        border: "1px solid rgba(16,185,129,0.18)",
                                                    }}
                                                />
                                            </Stack>
                                        </>
                                    ) : (
                                        <Card
                                            sx={{
                                                p: 2,
                                                borderRadius: "20px",
                                                border: "1px solid rgba(59,130,246,0.16)",
                                                background:
                                                    "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(255,255,255,0.98))",
                                                boxShadow: "0 8px 20px rgba(59,130,246,0.05)",
                                            }}
                                        >
                                            <Stack direction="row" spacing={1.2} alignItems="center">
                                                <Box
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: "14px",
                                                        display: "grid",
                                                        placeItems: "center",
                                                        bgcolor: "rgba(59,130,246,0.12)",
                                                    }}
                                                >
                                                    <NotesRoundedIcon sx={{ color: "#2563eb" }} />
                                                </Box>

                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 800,
                                                            color: "#0f172a",
                                                            fontSize: "0.96rem",
                                                        }}
                                                    >
                                                        Open-ended question
                                                    </Typography>
                                                    <Typography
                                                        sx={{
                                                            color: "#64748b",
                                                            fontSize: "0.9rem",
                                                            mt: 0.2,
                                                        }}
                                                    >
                                                        Student will type the answer manually.
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Card>
                                    )}
                                </Stack>
                            </Card>
                        ))}
                    </Stack>

                    {/* ACTIONS */}
                    <Card
                        sx={{
                            ...pageCardStyle,
                            mt: 3.2,
                            p: { xs: 2, md: 2.5 },
                            position: "relative",
                            zIndex: 1,
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1.5}
                            alignItems={{ xs: "stretch", sm: "center" }}
                            justifyContent="space-between"
                        >
                            <Box>
                                <Typography
                                    sx={{
                                        fontWeight: 900,
                                        color: "#0f172a",
                                        fontSize: "1rem",
                                    }}
                                >
                                    Ready to continue?
                                </Typography>
                                <Typography
                                    sx={{
                                        color: "#64748b",
                                        mt: 0.4,
                                        fontSize: "0.92rem",
                                    }}
                                >
                                    Add more questions or save your quiz when you're done.
                                </Typography>
                            </Box>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                                <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={addQuestion}
                                    sx={{
                                        borderRadius: "999px",
                                        px: 2.4,
                                        py: 1.1,
                                        textTransform: "none",
                                        fontWeight: 900,
                                        borderColor: "rgba(124,58,237,0.18)",
                                        color: "#5b21b6",
                                        bgcolor: "rgba(124,58,237,0.03)",
                                        "&:hover": {
                                            borderColor: "rgba(124,58,237,0.28)",
                                            bgcolor: "rgba(124,58,237,0.08)",
                                        },
                                    }}
                                >
                                    Add Question
                                </Button>

                                <Button
                                    variant="contained"
                                    startIcon={<SaveRoundedIcon />}
                                    onClick={saveQuiz}
                                    sx={{
                                        borderRadius: "999px",
                                        px: 2.8,
                                        py: 1.1,
                                        textTransform: "none",
                                        fontWeight: 900,
                                        background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                                        boxShadow: "0 14px 30px rgba(99,102,241,0.28)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                                            boxShadow: "0 16px 36px rgba(99,102,241,0.34)",
                                        },
                                    }}
                                >
                                    Save Quiz
                                </Button>
                            </Stack>
                        </Stack>
                    </Card>
                </Paper>
            </Container>
            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast({ ...toast, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                sx={{
                    mb: 2,
                    ml: 2,
                }}
            >
                <Alert
                    onClose={() => setToast({ ...toast, open: false })}
                    severity={toast.severity}
                    variant="filled"
                    sx={{
                        borderRadius: "12px",
                        fontWeight: 700,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                    }}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}