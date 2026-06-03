import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../lib/api";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Stack,
    Alert,
    CircularProgress,
    Chip,
    Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Schedule";

export default function QuizGrading() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [marksMap, setMarksMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [savingAttemptId, setSavingAttemptId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ✅ toggle (professional UX)
    const [showGraded, setShowGraded] = useState(false);

    // =====================================================
    // LOAD GRADING DATA
    // =====================================================
    const loadData = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const res = await API.get(`/api/assessments/${quizId}/grading/`);
            const data = res.data?.submissions || [];

            // ✅ Sort: PENDING first
            data.sort((a, b) => {
                if (a.status === b.status) return 0;
                return a.status === "PENDING" ? -1 : 1;
            });

            setSubmissions(data);

            // preload marks
            const initialMarks = {};
            data.forEach((attempt) => {
                attempt.answers.forEach((a) => {
                    initialMarks[a.answer_id] = a.marks_awarded ?? "";
                });
            });
            setMarksMap(initialMarks);
        } catch (err) {
            setError("Failed to load grading data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    // =====================================================
    // FILTERED VIEW
    // =====================================================
    const pendingSubmissions = useMemo(
        () => submissions.filter((s) => s.status === "PENDING"),
        [submissions]
    );
    const gradedSubmissions = useMemo(
        () => submissions.filter((s) => s.status === "GRADED"),
        [submissions]
    );

    const visibleSubmissions = useMemo(() => {
        if (showGraded) return [...pendingSubmissions, ...gradedSubmissions];
        return pendingSubmissions; // ✅ professional default
    }, [showGraded, pendingSubmissions, gradedSubmissions]);

    // =====================================================
    // SAVE FINAL GRADES (ALL QUESTIONS)
    // =====================================================
    const submitFinalGrades = async (attempt) => {
        setError("");
        setSuccess("");

        try {
            // ✅ validate all answers first (no partial grading)
            for (const ans of attempt.answers) {
                const value = marksMap[ans.answer_id];

                if (value === "" || value === null || value === undefined) {
                    setError("Please grade ALL questions before saving.");
                    return;
                }

                const marks = Number(value);
                if (Number.isNaN(marks)) {
                    setError("Marks must be a number.");
                    return;
                }

                if (marks < 0 || marks > ans.max_marks) {
                    setError(`Marks must be between 0 and ${ans.max_marks}.`);
                    return;
                }
            }

            setSavingAttemptId(attempt.attempt_id);

            // ✅ save all answers
            await Promise.all(
                attempt.answers.map((ans) =>
                    API.patch(`/api/answers/${ans.answer_id}/grade/`, {
                        marks: Number(marksMap[ans.answer_id]),
                    })
                )
            );

            await loadData();
            setSuccess("Final grade saved successfully!");
        } catch (err) {
            setError("Failed to save grades.");
        } finally {
            setSavingAttemptId(null);
        }
    };

    // =====================================================
    // UI HELPERS
    // =====================================================
    const statusChip = (status) => {
        const isPending = status === "PENDING";
        return (
            <Chip
                icon={isPending ? <PendingIcon /> : <CheckCircleIcon />}
                label={status}
                color={isPending ? "warning" : "success"}
                sx={{ fontWeight: 800 }}
            />
        );
    };

    // =====================================================
    // UI
    // =====================================================
    return (
        <Box sx={{ maxWidth: 980, mx: "auto", mt: 4, px: 2 }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>
                        Quiz Grading
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Quiz ID: {quizId}
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/instructor/quizzes")}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                >
                    Back
                </Button>
            </Stack>

            {/* Alerts */}
            {!loading && error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            {/* Toggle graded */}
            {!loading && submissions.length > 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                        Pending: <strong>{pendingSubmissions.length}</strong> • Graded:{" "}
                        <strong>{gradedSubmissions.length}</strong>
                    </Typography>

                    {gradedSubmissions.length > 0 && (
                        <Button
                            variant="text"
                            onClick={() => setShowGraded((p) => !p)}
                            sx={{ textTransform: "none", fontWeight: 800 }}
                        >
                            {showGraded ? "Hide graded attempts" : "Show graded attempts"}
                        </Button>
                    )}
                </Stack>
            )}

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && !error && pendingSubmissions.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No pending submissions for grading.
                </Alert>
            )}

            {!loading && !error && visibleSubmissions.length === 0 && submissions.length === 0 && (
                <Alert severity="info">No quiz submissions available.</Alert>
            )}

            {/* Attempts */}
            {!loading &&
                !error &&
                visibleSubmissions.map((attempt) => {
                    const isPending = attempt.status === "PENDING";

                    return (
                        <Paper
                            key={attempt.attempt_id}
                            sx={{
                                p: 3,
                                mb: 3,
                                borderRadius: 2,
                                border: "1px solid #e5e7eb",
                                boxShadow: "0 14px 30px rgba(0,0,0,0.06)",
                            }}
                        >
                            {/* Attempt Header */}
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Box>
                                    <Typography variant="h6" fontWeight={900}>
                                        Student: {attempt.student}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Submitted:{" "}
                                        {attempt.submitted_at
                                            ? new Date(attempt.submitted_at).toLocaleString()
                                            : "N/A"}
                                    </Typography>
                                </Box>
                                {statusChip(attempt.status)}
                            </Stack>

                            <Divider sx={{ my: 2 }} />

                            {/* Answers */}
                            <Stack spacing={2}>
                                {attempt.answers.map((a, index) => (
                                    <Paper
                                        key={a.answer_id}
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2,
                                            bgcolor: "#fafafa",
                                            border: "1px solid #e5e7eb",
                                        }}
                                    >
                                        <Typography fontWeight={900} mb={1}>
                                            Q{index + 1}. {a.question_text}
                                        </Typography>

                                        <Typography sx={{ mb: 2 }}>
                                            <strong>Student Answer:</strong> {a.student_answer || "(empty)"}
                                        </Typography>

                                        <TextField
                                            type="number"
                                            fullWidth
                                            disabled={!isPending}
                                            label={`Marks (max ${a.max_marks})`}
                                            inputProps={{ min: 0, max: a.max_marks }}
                                            value={marksMap[a.answer_id] ?? ""}
                                            onChange={(e) =>
                                                setMarksMap((prev) => ({
                                                    ...prev,
                                                    [a.answer_id]: e.target.value,
                                                }))
                                            }
                                        />
                                    </Paper>
                                ))}
                            </Stack>

                            {/* Footer */}
                            <Divider sx={{ my: 2 }} />

                            {isPending ? (
                                <Box sx={{ textAlign: "right" }}>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => submitFinalGrades(attempt)}
                                        disabled={savingAttemptId === attempt.attempt_id}
                                        sx={{
                                            px: 4,
                                            py: 1.2,
                                            fontWeight: 900,
                                            textTransform: "none",
                                            borderRadius: 2,
                                            background: "linear-gradient(135deg, #6366f1, #7c3aed)",
                                            boxShadow: "0 10px 25px rgba(99,102,241,0.25)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, #4f46e5, #6d28d9)",
                                            },
                                        }}
                                    >
                                        {savingAttemptId === attempt.attempt_id ? "Saving..." : "Save Final Grade"}
                                    </Button>
                                </Box>
                            ) : (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    Already graded Final Score: <strong>{attempt.score ?? attempt.final_score ?? "-"}</strong>
                                </Alert>
                            )}
                        </Paper>
                    );
                })}
        </Box>
    );
}