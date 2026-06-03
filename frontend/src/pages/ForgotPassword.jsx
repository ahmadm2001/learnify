// src/pages/ForgotPassword.jsx

import { useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import API from "../lib/api";

import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
  Snackbar,
  Link,
  CircularProgress,
} from "@mui/material";

import { motion } from "framer-motion";
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

import PatternFloatingBackground from "../components/PatternFloatingBackground";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    new_password: "",
    confirm_password: "",
  });

  const steps = ["Email", "Verification Code", "New Password", "Confirm"];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (error || success) {
      const t = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [error, success]);

  const pillFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 999,
      height: 46,
      bgcolor: "#EEF1FF",
      "& fieldset": { borderColor: "#B8B2FA" },
      "&:hover fieldset": { borderColor: "#9D94F7" },
      "&.Mui-focused fieldset": { borderColor: "#7B6FF0" },
    },
  };

  const handleNext = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (step === 1) {
        await API.post("/api/auth/send-otp/", {
          email: form.email,
        });

        setSuccess("OTP sent to your email");
        setStep(2);
      } else if (step === 2) {
        await API.post("/api/auth/verify-otp/", {
          email: form.email,
          otp: form.otp,
        });

        setSuccess("OTP verified");
        setStep(3);
      } else {
        setStep(step + 1);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await API.post("/api/auth/reset-password/", {
        email: form.email,
        password: form.new_password,
        confirm_password: form.confirm_password,
      });

      setSuccessOpen(true);

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = () => {
    if (step === 1)
      return (
        <TextField
          placeholder="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          sx={pillFieldSx}
        />
      );

    if (step === 2)
      return (
        <TextField
          placeholder="Enter OTP"
          name="otp"
          value={form.otp}
          onChange={handleChange}
          fullWidth
          sx={pillFieldSx}
        />
      );

    if (step === 3)
      return (
        <TextField
          placeholder="New Password"
          type="password"
          name="new_password"
          value={form.new_password}
          onChange={handleChange}
          fullWidth
          sx={pillFieldSx}
        />
      );

    return (
      <TextField
        placeholder="Confirm Password"
        type="password"
        name="confirm_password"
        value={form.confirm_password}
        onChange={handleChange}
        fullWidth
        sx={pillFieldSx}
      />
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ECE6FF",
        display: "flex",
        alignItems: "center",
        py: 6,
        position: "relative",
      }}
    >
      <PatternFloatingBackground count={26} />

      <Container maxWidth="md">
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            boxShadow:
              "0 25px 60px rgba(108,93,211,.18), 0 10px 24px rgba(108,93,211,.08)",
            minHeight: 420,
          }}
        >
          {/* LEFT PANEL */}
          <Box
            sx={{
              p: 4,
              color: "white",
              background:
                "linear-gradient(135deg, #6b60d1, #978bf7)",
            }}
          >
            <Typography variant="h5" fontWeight={800} mb={2}>
              Reset Password
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.9, mb: 4 }}>
              Follow steps to securely reset your account password.
            </Typography>

            <Stack spacing={2}>
              {steps.map((label, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "1px solid white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      bgcolor:
                        step > i + 1 ? "white" : "transparent",
                      color:
                        step > i + 1 ? "#6b60d1" : "white",
                    }}
                  >
                    {i + 1}
                  </Box>

                  <Typography
                    sx={{
                      opacity: step === i + 1 ? 1 : 0.6,
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          {/* RIGHT PANEL */}
          <Box
            sx={{
              p: 5,
              bgcolor: "#ffffff",   // solid white
              opacity: 1,           // 🔥 force full opacity
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Forgot your password
            </Typography>

            <Typography variant="body2" color="text.secondary" mb={3}>
              Step {step} of {steps.length}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Stack spacing={2} mt={2}>
              {renderInput()}

              <Stack direction="row" justifyContent="space-between">
                {step > 1 && (
                  <Button onClick={() => setStep(step - 1)}>
                    Back
                  </Button>
                )}

                {step < 4 ? (
                  <MotionButton
                    whileHover={{ y: -2 }}
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    sx={{
                      bgcolor: "#978bf7",
                      ":hover": { bgcolor: "#6b60d1" },
                      borderRadius: 999,
                    }}
                  >
                    {loading ? <CircularProgress size={20} /> : "Next"}
                  </MotionButton>
                ) : (
                  <MotionButton
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                    sx={{
                      bgcolor: "#978bf7",
                      ":hover": { bgcolor: "#6b60d1" },
                      borderRadius: 999,
                    }}
                  >
                    Confirm
                  </MotionButton>
                )}
              </Stack>
            </Stack>

            <Typography mt={3} textAlign="center" fontSize={14}>
              Back to{" "}
              <Link component={RouterLink} to="/login" fontWeight={700}>
                Login
              </Link>
            </Typography>
          </Box>
        </MotionPaper>
      </Container>

      <Snackbar open={successOpen} autoHideDuration={1500}>
        <Alert severity="success">Password updated!</Alert>
      </Snackbar>
    </Box>
  );
}