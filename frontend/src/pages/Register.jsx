// src/pages/Register.jsx
import { useState } from "react";
import API from "../lib/api";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import InputAdornment from "@mui/material/InputAdornment";
import { Eye, EyeOff } from "lucide-react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Snackbar,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";

import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";
import CloseIcon from "@mui/icons-material/Close"; // using as X icon

import { motion } from "framer-motion";
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

import PatternFloatingBackground from "../components/PatternFloatingBackground";

export default function Register() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!form.idNumber.trim()) {
      newErrors.idNumber = "ID number is required.";
    }

    if (!form.username.trim()) {
      newErrors.username = "Username is required.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setError("Please fix the highlighted fields.");
      setLoading(false);
      return;
    }

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    try {
      await API.post("/api/auth/register/", {
        name: fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        id_number: form.idNumber,
        address: form.address,
      });

      setSuccessOpen(true);
      setTimeout(() => nav("/login"), 1200);
    } catch (err) {
      console.error("Register error:", err);
      const backendMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message;

      setError(
        backendMsg || "Registration failed. Try a different username/email."
      );
    } finally {
      setLoading(false);
    }
  };

  // animation
  const cardVariants = {
    hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const staggerParent = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const pillFieldSx = {
    mb: 1.5,
    "& .MuiOutlinedInput-root": {
      borderRadius: 999,
      height: 46,
      bgcolor: "#EEF1FF",
      "& fieldset": { borderColor: "#B8B2FA" },
      "&:hover fieldset": { borderColor: "#9D94F7" },
      "&.Mui-focused fieldset": { borderColor: "#7B6FF0" },
    },
  };

  const addressFieldSx = {
    mb: 1.5,
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      bgcolor: "#EEF1FF",
      alignItems: "flex-start",
      "& fieldset": { borderColor: "#B8B2FA" },
      "&:hover fieldset": { borderColor: "#9D94F7" },
      "&.Mui-focused fieldset": { borderColor: "#7B6FF0" },
    },
    "& .MuiInputBase-inputMultiline": {
      padding: "10px 18px",
    },
  };

  const socialButtons = [
    { label: "Continue with Google", Icon: GoogleIcon },
    { label: "Continue with Apple", Icon: AppleIcon },
    { label: "Continue with Facebook", Icon: FacebookIcon },
    { label: "Continue with X", Icon: CloseIcon },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ECE6FF",
        display: "flex",
        alignItems: "center",
        py: { xs: 2, sm: 4, md: 8 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <PatternFloatingBackground count={26} />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <MotionPaper
          variants={cardVariants}
          initial="hidden"
          animate="show"
          elevation={0}
          sx={{
            borderRadius: 2,
            bgcolor: "#fff",
            boxShadow:
              "0 25px 60px rgba(108,93,211,.18), 0 10px 24px rgba(108,93,211,.08)",
            display: { xs: "block", md: "grid" },
            gridTemplateColumns: { md: "1.05fr 1fr" },
            overflow: "hidden",
          }}
        >
          {/* ===== LEFT: light gradient hero section ===== */}
          <MotionBox
            variants={staggerParent}
            initial="hidden"
            animate="show"
            sx={{
              display: { xs: "none", md: "flex" },
              flexDirection: "column",
              justifyContent: "center",
              px: 8,
              py: 10,
              background: "linear-gradient(135deg, #e8deff 0%, #d7ccff 40%, #d0e6ff 100%)",

            }}
          >
            <MotionBox variants={item} sx={{ mb: 3 }}>
              <Typography
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  fontSize: 36,
                  mb: 1.5,
                  color: "#3c3360",
                }}
              >
                Learn anytime, anywhere.
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mb: 4,
                  maxWidth: 370,
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: "#5A5578",
                }}
              >
                Join thousands of learners upgrading their skills with project-based
                courses, quizzes, and certificates  all designed to help you grow faster.
              </Typography>

              <Typography
                variant="body1"
                sx={{ fontWeight: 700, mb: 0.5, color: "#3c3360" }}
              >
                Create account
              </Typography>

              <Typography
                variant="body2"
                sx={{ mb: 3, fontSize: 14, color: "#5A5578" }}
              >
                Already a member?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 700, color: "#6B60D1" }}
                >
                  Log in
                </Link>
              </Typography>
            </MotionBox>

            {/* Social Buttons */}
            <Stack spacing={1.2} sx={{ maxWidth: 380 }}>
              {[
                { label: "Continue with Google", Icon: GoogleIcon },
                { label: "Continue with Apple", Icon: AppleIcon },
                { label: "Continue with Facebook", Icon: FacebookIcon },
                { label: "Continue with X", Icon: CloseIcon },
              ].map(({ label, Icon }, idx) => (
                <MotionButton
                  key={idx}
                  variants={item}
                  variant="outlined"
                  startIcon={<Icon />}
                  fullWidth
                  sx={{
                    height: 50,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 14,
                    justifyContent: "center",
                    pl: 0,
                    bgcolor: "#ffffff80",
                    borderColor: "#d6d0ff",
                    color: "#4a4396",
                    backdropFilter: "blur(6px)",
                    ":hover": {
                      bgcolor: "#ffffff",
                      borderColor: "#b8b2fa",
                    },
                  }}
                  onClick={() => { }}
                >
                  {label}
                </MotionButton>
              ))}
            </Stack>
          </MotionBox>


          {/* ===== RIGHT: form (same position) ===== */}
          <MotionBox
            variants={staggerParent}
            initial="hidden"
            animate="show"
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              p: { xs: 2.5, sm: 3, md: 4 },
              maxWidth: { md: 520 },
            }}
          >
            {/* mobile header + social buttons */}
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, mb: 0.5, letterSpacing: "-.01em" }}
              >
                Create account
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 2,
                  color: "text.secondary",
                  fontSize: { xs: 13.5, sm: 14 },
                }}
              >
                Already a member?{" "}
                <Link
                  component={RouterLink}
                  to="/login"
                  underline="hover"
                  sx={{ fontWeight: 700 }}
                >
                  Log in
                </Link>
              </Typography>

              <Stack spacing={1.1} mb={2}>
                {socialButtons.map(({ label, Icon }, idx) => (
                  <Button
                    key={idx}
                    fullWidth
                    variant="outlined"
                    startIcon={<Icon />}
                    sx={{
                      height: 46,
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: 13.5,
                      borderColor: "#D8D5FF",
                      color: "#6b60d1",
                      bgcolor: "#FBFAFF",
                      ":hover": {
                        bgcolor: "#F4F2FF",
                        borderColor: "#C0BAFF",
                      },
                    }}
                    onClick={() => {
                      // handleOAuth(label)
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* error banner */}
            {error && (
              <MotionBox variants={item} sx={{ mb: 2 }}>
                <Alert severity="error" sx={{ fontSize: 14 }}>
                  {String(error)}
                </Alert>
              </MotionBox>
            )}

            <MotionBox variants={item} sx={{ mb: 2 }}>
              <Divider>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontSize: 11 }}
                >
                  OR CREATE ACCOUNT WITH EMAIL
                </Typography>
              </Divider>
            </MotionBox>

            {/* form */}
            <Box component="form" onSubmit={submit}>
              <MotionBox variants={item}>
                <TextField
                  placeholder="First Name"
                  fullWidth
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  sx={pillFieldSx}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                />
              </MotionBox>

              <MotionBox variants={item}>
                <TextField
                  placeholder="Last Name"
                  fullWidth
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  sx={pillFieldSx}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                />
              </MotionBox>

              <MotionBox variants={item}>
                <TextField
                  placeholder="Email Address"
                  type="email"
                  fullWidth
                  value={form.email}
                  onChange={handleChange("email")}
                  sx={pillFieldSx}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                />
              </MotionBox>

              <MotionBox variants={item}>
                <TextField
                  placeholder="Phone Number (Optional)"
                  fullWidth
                  value={form.phone}
                  onChange={handleChange("phone")}
                  sx={pillFieldSx}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                />
              </MotionBox>

              <MotionBox variants={item}>
                <TextField
                  placeholder="ID Number"
                  fullWidth
                  value={form.idNumber}
                  onChange={handleChange("idNumber")}
                  sx={pillFieldSx}
                  error={Boolean(errors.idNumber)}
                  helperText={errors.idNumber}
                />
              </MotionBox>

              <MotionBox variants={item}>
                <TextField
                  placeholder="Username"
                  fullWidth
                  value={form.username}
                  onChange={handleChange("username")}
                  sx={pillFieldSx}
                  error={Boolean(errors.username)}
                  helperText={errors.username}
                />
              </MotionBox>

              <MotionBox variants={item}>
                <TextField
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={form.password}
                  onChange={handleChange("password")}
                  sx={pillFieldSx}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          sx={{
                            color: "#8E8AE6",
                            "&:hover": {
                              bgcolor: "rgba(142,138,230,0.08)",
                            },
                          }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </MotionBox>

              <MotionBox variants={item}>
                <TextField
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  fullWidth
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  sx={pillFieldSx}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                          sx={{
                            color: "#8E8AE6",
                            "&:hover": {
                              bgcolor: "rgba(142,138,230,0.08)",
                            },
                          }}
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </MotionBox>

              <MotionBox variants={item}>
                <TextField
                  placeholder="Address"
                  fullWidth
                  multiline
                  minRows={2}
                  value={form.address}
                  onChange={handleChange("address")}
                  sx={addressFieldSx}
                  error={Boolean(errors.address)}
                  helperText={errors.address}
                />
              </MotionBox>

              <MotionButton
                variants={item}
                whileHover={{
                  y: -2,
                  boxShadow: "0 12px 24px rgba(151,139,247,.55)",
                }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  height: 50,
                  borderRadius: 999,
                  fontWeight: 800,
                  letterSpacing: ".06em",
                  bgcolor: "#978bf7",
                  ":hover": { bgcolor: "#6b60d1" },
                  boxShadow: "0 8px 22px rgba(151,139,247,.45)",
                }}
              >
                {loading ? "Creating…" : "CREATE ACCOUNT"}
              </MotionButton>
            </Box>
          </MotionBox>
        </MotionPaper>
      </Container>

      <Snackbar
        open={successOpen}
        autoHideDuration={1500}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSuccessOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Account created successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
