import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../lib/api";
import TimerIcon from "@mui/icons-material/Timer";
import {
    Container,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Stack,
    LinearProgress,
    Chip,
    Box,
    Paper,
    Snackbar,
    Alert,
    Dialog,
    CircularProgress,
    TextField,
} from "@mui/material";

export default function StudentQuizAttempt() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const QUIZ_DURATION = 300;

    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [attemptId, setAttemptId] = useState(null);
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [snack, setSnack] = useState("");
    const [progress, setProgress] = useState(0);

    // Attempts dialog
    const [showCompletedDialog, setShowCompletedDialog] = useState(false);
    const [completedInfo, setCompletedInfo] = useState(null);
    const [resultDialogOpen, setResultDialogOpen] = useState(false);
    const [resultData, setResultData] = useState(null);



    // =====================================================
    // CHECK STATUS FIRST
    // =====================================================
    useEffect(() => {
        let mounted = true;

        async function checkStatus() {
            try {
                const res = await API.get(`/api/assessments/${quizId}/full-status/`);
                const data = res.data;

                if (!mounted) return;

                // ❌ BLOCK only if NO attempts left
                if (data.remaining_attempts === 0) {
                    setCompletedInfo({
                        score: data.score,
                        submitted_at: data.submitted_at,
                    });
                    setShowCompletedDialog(true);
                    setLoading(false);
                    return;
                }

                // ✅ OPTIONAL UX: previous attempt pending but retry allowed
                if (data.status === "PENDING" && data.remaining_attempts > 0) {
                    setSnack(
                        `Previous attempt is waiting for grading. You still have ${data.remaining_attempts} attempt(s) left.`
                    );
                }

                // ✅ START QUIZ (ONLY ONCE)
                await startQuiz();

            } catch (err) {
                console.error(err);
                if (mounted) setLoading(false);
            }
        }

        checkStatus();

        return () => {
            mounted = false;
        };
    }, [quizId]);

    // =====================================================
    // START QUIZ
    // =====================================================
    async function startQuiz() {
        try {
            const startRes = await API.post(`/api/assessments/${quizId}/start/`);
            setAttemptId(startRes.data.attempt_id);

            const quizRes = await API.get(`/api/assessments/${quizId}/`);
            setQuiz(quizRes.data);

            setLoading(false);
        } catch (err) {
            console.error(err);

            // If backend blocks attempts
            if (err.response?.status === 403) {
                setCompletedInfo({
                    score: err.response.data?.score ?? 0,
                    submitted_at: err.response.data?.submitted_at ?? null,
                });
                setShowCompletedDialog(true);
                setLoading(false); // ✅ IMPORTANT
                return;
            }

            // Not logged in etc.
            if (err.response?.status === 401) {
                setSnack("Please login again.");
                setLoading(false);
                return;
            }

            setSnack("Could not start quiz.");
            setLoading(false);
        }
    }

    // =====================================================
    // TIMER
    // =====================================================
    useEffect(() => {
        if (!attemptId) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attemptId]);

    // =====================================================
    // PROGRESS
    // =====================================================
    useEffect(() => {
        if (!quiz) return;
        const total = quiz.questions?.length || 0;
        const answered = Object.keys(answers).length;
        setProgress(total ? (answered / total) * 100 : 0);
    }, [answers, quiz]);

    // =====================================================
    // SELECT ANSWER
    // =====================================================
    const handleSelect = (questionId, choiceId) => {
        setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
    };
    const handleTextChange = (questionId, text) => {
        setAnswers((prev) => ({ ...prev, [questionId]: text }));
    };

    // =====================================================
    // SUBMIT
    // =====================================================
    const handleSubmit = async () => {
        if (submitting || !attemptId) return;
        setSubmitting(true);

        try {
            const payload = {
                answers: quiz.questions.map((q) => {
                    // MCQ
                    if (q.question_type === "MCQ") {
                        return {
                            question_id: q.id,
                            choice_id: answers[q.id] ? Number(answers[q.id]) : null,
                        };
                    }

                    // TEXT
                    return {
                        question_id: q.id,
                        answer_text: answers[q.id] || "",
                    };
                }),
            };

            const res = await API.post(`/api/attempts/${attemptId}/submit/`, payload);

            // ✅ Instead of snackbar → open result popup
            setResultData({
                score: res.data.score,
                status: res.data.status,
                submitted_at: new Date().toISOString()
            });

            setResultDialogOpen(true);
            setQuiz(null);

        } catch (err) {
            console.error(err);
            setSnack("Error submitting quiz");
        } finally {
            setSubmitting(false);
        }
    };


    // ✅ Show spinner only if loading AND no dialog
    if (loading && !showCompletedDialog) {
        return (
            <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 5 }}>
            {/* ✅ Attempts Finished Dialog */}
            <Dialog open={showCompletedDialog}>
                <Box
                    sx={{
                        borderRadius: "10px",
                        overflow: "hidden",
                        width: 520,
                        textAlign: "center",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
                    }}
                >
                    {/* Gradient Header */}
                    <Box
                        sx={{
                            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                            color: "white",
                            py: 4,
                            px: 3,
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold">
                            🚫 Attempts Completed
                        </Typography>

                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                            You have used all allowed quiz attempts
                        </Typography>
                    </Box>

                    {/* White Body */}
                    <Box sx={{ bgcolor: "white", px: 5, py: 4 }}>
                        {completedInfo && (
                            <>
                                {/* Score Badge */}
                                <Box
                                    sx={{
                                        width: 110,
                                        height: 110,
                                        borderRadius: "30%",
                                        margin: "0 auto",
                                        background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "36px",
                                        fontWeight: "bold",
                                        boxShadow: "0 12px 30px rgba(99,102,241,0.45)",
                                        mb: 3,
                                    }}
                                >
                                    {completedInfo.score}
                                </Box>

                                <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                    Final Score
                                </Typography>

                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Submitted on{" "}
                                    {completedInfo.submitted_at
                                        ? new Date(completedInfo.submitted_at).toLocaleString()
                                        : "N/A"}
                                </Typography>
                            </>
                        )}

                        {/* Divider */}
                        <Box sx={{ height: "1px", background: "#eee", mb: 3 }} />

                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                borderRadius: "10px",
                                py: 1.4,
                                fontWeight: "bold",
                                textTransform: "none",
                                fontSize: "15px",
                                background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                                boxShadow: "0 10px 25px rgba(99,102,241,0.35)",
                            }}
                            onClick={() => navigate("/student/courses")}
                        >
                            Back to Courses
                        </Button>
                    </Box>
                </Box>
            </Dialog>

            {/* ✅ Quiz Result Dialog */}
            <Dialog open={resultDialogOpen}>
                <Box
                    sx={{
                        borderRadius: "10px",
                        overflow: "hidden",
                        width: 520,
                        textAlign: "center",
                        boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
                    }}
                >
                    {/* Top Gradient Header */}
                    <Box
                        sx={{
                            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                            color: "white",
                            py: 4,
                            px: 3,
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold">
                            🎉 Quiz Completed!
                        </Typography>

                        {/* Date Time */}
                        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                            {resultData?.submitted_at
                                ? new Date(resultData.submitted_at).toLocaleString()
                                : ""}
                        </Typography>
                    </Box>

                    {/* White Body */}
                    <Box sx={{ bgcolor: "white", px: 5, py: 4 }}>
                        {/* Score Badge */}
                        <Box
                            sx={{
                                width: 110,
                                height: 110,
                                borderRadius: "24px",
                                margin: "0 auto",
                                background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "42px",
                                fontWeight: "bold",
                                boxShadow: "0 12px 30px rgba(99,102,241,0.45)",
                                mb: 3,
                            }}
                        >
                            {resultData?.status === "GRADED" ? "✔️" : "⏳"}
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            {resultData?.status === "GRADED"
                                ? "Attempts Completed"
                                : "Attempt Submitted (Waiting for Grading)"}
                        </Typography>
                        {resultData?.status === "GRADED" && (
                            <Typography variant="h6" fontWeight="bold" mb={1}>
                                Final Score: {resultData.score}
                            </Typography>
                        )}

                        {resultData?.status === "PENDING" ? (
                            <>
                                <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                    ⏳ Waiting for Instructor Grading
                                </Typography>

                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Your answers have been submitted successfully.
                                    <br />
                                    Final score will be available after instructor grading.
                                </Typography>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" fontWeight="bold" mb={0.5}>
                                    🎉 Quiz Completed!
                                </Typography>

                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Review the material and try again.
                                </Typography>
                            </>
                        )}

                        <Box sx={{ height: "1px", background: "#eee", mb: 3 }} />

                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                borderRadius: "12px",
                                py: 1.5,
                                fontWeight: "bold",
                                textTransform: "none",
                                fontSize: "15px",
                                background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                                boxShadow: "0 10px 25px rgba(99,102,241,0.35)",
                            }}
                            onClick={() => navigate("/student/courses")}
                        >
                            Back to Course
                        </Button>
                    </Box>
                </Box>
            </Dialog>





            {/* If dialog open, we don’t need to render quiz */}
            {!showCompletedDialog && quiz && (
                <Box>
                    <Box
                        sx={{
                            p: 4,
                            borderRadius: 1,
                            background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
                            border: "1px solid #e0e7ff",
                            mb: 4,
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    📝 {quiz.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    {Object.keys(answers).length} / {quiz.questions.length} answered
                                </Typography>
                            </Box>

                            <Chip
                                icon={<TimerIcon />}
                                label={`${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(
                                    timeLeft % 60
                                ).padStart(2, "0")}`}
                                sx={{
                                    bgcolor: "#6366f1",
                                    color: "white",
                                    fontWeight: "bold",
                                }}
                            />
                        </Stack>

                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                mt: 3,
                                height: 8,
                                borderRadius: 5,
                                backgroundColor: "#e5e7eb",
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: "#6366f1",
                                },
                            }}
                        />
                    </Box>

                    {quiz.questions?.map((q, index) => (
                        <Paper
                            key={q.id}
                            elevation={0}
                            sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: 1,
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                                <Chip
                                    label={`Q${index + 1}`}
                                    sx={{
                                        bgcolor: "#6366f1",
                                        color: "white",
                                        fontWeight: "bold",
                                    }}
                                />
                                <Typography fontWeight="bold">{q.text}</Typography>
                            </Stack>

                            {/* ✅ MCQ OR OPEN ENDED */}
                            {q.question_type === "MCQ" ? (
                                <RadioGroup
                                    value={answers[q.id] || ""}
                                    onChange={(e) => handleSelect(q.id, e.target.value)}
                                >
                                    {q.choices?.map((c) => (
                                        <Paper
                                            key={c.id}
                                            sx={{
                                                p: 1.5,
                                                mb: 1,
                                                borderRadius: 1,
                                                border: "1px solid #e5e7eb",
                                            }}
                                        >
                                            <FormControlLabel
                                                value={c.id}
                                                control={<Radio />}
                                                label={c.text}
                                                sx={{ width: "100%" }}
                                            />
                                        </Paper>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    label="Your Answer"
                                    value={answers[q.id] || ""}
                                    onChange={(e) =>
                                        handleTextChange(q.id, e.target.value)
                                    }
                                    placeholder="Type your answer here..."
                                />
                            )}
                        </Paper>
                    ))}

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmit}
                        disabled={submitting}
                        sx={{
                            mt: 4,
                            py: 1.8,
                            borderRadius: 1,
                            fontSize: "16px",
                            fontWeight: "bold",
                            textTransform: "none",
                            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                            boxShadow: "0 10px 25px rgba(99,102,241,0.3)",
                            "&:hover": {
                                background: "linear-gradient(135deg, #4f46e5, #4338ca)",
                            },
                        }}
                    >
                        {submitting ? "Submitting..." : "Submit Quiz"}
                    </Button>

                </Box>
            )}

            <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack("")}>
                <Alert severity="info">{snack}</Alert>
            </Snackbar>
        </Container>
    );
}
