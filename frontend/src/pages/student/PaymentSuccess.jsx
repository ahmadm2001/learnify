import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export default function PaymentSuccess() {
    const navigate = useNavigate();
    const { courseId } = useParams();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "linear-gradient(180deg,#f5f3ff 0%,#eef2ff 40%,#ffffff 100%)",
                px: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    maxWidth: 520,
                    width: "100%",
                    p: 5,
                    borderRadius: "28px",
                    textAlign: "center",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                }}
            >
                {/* ICON */}
                <Box
                    sx={{
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        mx: "auto",
                        mb: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                            "linear-gradient(135deg,#7c3aed,#6366f1)",
                        boxShadow: "0 10px 30px rgba(124,58,237,0.4)",
                    }}
                >
                    <CheckCircleIcon sx={{ fontSize: 50, color: "#fff" }} />
                </Box>

                {/* TITLE */}
                <Typography fontSize="2rem" fontWeight={900} mb={1}>
                    Payment Successful 🎉
                </Typography>

                {/* SUBTEXT */}
                <Typography color="text.secondary" mb={3}>
                    Your purchase was completed successfully.
                    <br />
                    You now have full access to this course.
                </Typography>

                {/* INFO BOX */}
                <Paper
                    sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: "16px",
                        background: "rgba(124,58,237,0.06)",
                    }}
                >
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <SchoolIcon sx={{ color: "#7c3aed" }} />
                        <Typography fontWeight={700} color="#5b21b6">
                            Start learning immediately 🚀
                        </Typography>
                    </Stack>
                </Paper>

                {/* BUTTONS */}
                <Stack spacing={2}>
                    <Button
                        fullWidth
                        size="large"
                        onClick={() =>
                            navigate(`/student/courses/${courseId}`)
                        }
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            height: 56,
                            borderRadius: 999,
                            fontWeight: 900,
                            background:
                                "linear-gradient(135deg,#7c3aed,#6366f1)",
                            color: "#fff",
                            boxShadow:
                                "0 12px 30px rgba(99,102,241,0.4)",
                            "&:hover": {
                                transform: "scale(1.02)",
                            },
                        }}
                    >
                        Go to Course
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate("/student/courses")}
                        sx={{
                            height: 52,
                            borderRadius: 999,
                            fontWeight: 800,
                        }}
                    >
                        Go to My Courses
                    </Button>
                </Stack>

                {/* FOOTER */}
                <Typography
                    fontSize={12}
                    color="text.secondary"
                    mt={3}
                >
                    Thank you for learning with us 💜
                </Typography>
            </Paper>
        </Box>
    );
}