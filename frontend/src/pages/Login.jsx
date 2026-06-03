// src/pages/Login.jsx
import { useState, useContext } from "react";
import API from "../lib/api";
import { saveTokens } from "../lib/auth";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
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
  Checkbox,
  FormControlLabel,
  IconButton,
  Stack,
  Snackbar,
} from "@mui/material";

import GoogleIcon from "@mui/icons-material/Google";
import AppleIcon from "@mui/icons-material/Apple";
import FacebookIcon from "@mui/icons-material/Facebook";
import CloseIcon from "@mui/icons-material/Close";

import { motion } from "framer-motion";
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

import PetsImage from "../assets/login-pets.jpg";
import PatternFloatingBackground from "../components/PatternFloatingBackground";

// Auth context (for updating navbar user immediately)
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const { loadUser } = useContext(AuthContext);

  // where to redirect after login
  const redirectTo =
    (location.state?.from?.pathname || "/account") +
    (location.state?.from?.search || "");

  // 🔹 email + password state
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/token/", {
        email: form.email,
        password: form.password,
      });

      saveTokens(data);

      await loadUser();

      // get logged-in user info
      const me = await API.get("/api/auth/me/");
      const user = me.data;
      const role = user?.profile?.role || user?.role;


      localStorage.setItem("role", role || "");

      setSuccessOpen(true);

      setTimeout(() => {
        if (role === "ADMIN") {
          nav("/admin-dashboard", { replace: true });
        } else if (role === "TEACHER_APPROVED") {
          nav("/instructor", { replace: true });
        } else {
          nav(redirectTo, { replace: true });
        }
      }, 1200);
    } catch (err) {
      console.error("Login error:", err);
      const backendMsg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message;

      setError(backendMsg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // animations
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
            overflow: "hidden",
            bgcolor: "#fff",
            boxShadow:
              "0 25px 60px rgba(108,93,211,.18), 0 10px 24px rgba(108,93,211,.08)",
            display: { xs: "block", md: "grid" },
            gridTemplateColumns: { md: "1.05fr 1fr" },
          }}
        >
          {/* Left image */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              position: "relative",
              minHeight: 600,
            }}
          >
            <MotionBox
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              sx={{
                position: "absolute",
                inset: 14,
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "0 16px 36px rgba(0,0,0,.18)",
              }}
            >
              <Box
                component="img"
                src={PetsImage}
                alt="Visual"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center bottom",
                  display: "block",
                }}
              />
            </MotionBox>
          </Box>

          {/* Right form */}
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
            <MotionBox variants={item}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 0.5,
                  letterSpacing: "-.01em",
                }}
              >
                Log in
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  mb: 2.5,
                  color: "text.secondary",
                  fontSize: { xs: 13.5, sm: 14 },
                }}
              >
                Not a member yet?{" "}
                <Link
                  component={RouterLink}
                  to="/register"
                  underline="hover"
                  sx={{ fontWeight: 700 }}
                >
                  Register now
                </Link>
              </Typography>
            </MotionBox>

            {/* Error message */}
            {error && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error" sx={{ fontSize: 14 }}>
                  {String(error)}
                </Alert>
              </Box>
            )}

            <Box component="form" onSubmit={submit}>
              {/* Email */}
              <MotionBox variants={item}>
                <TextField
                  placeholder="Email"
                  fullWidth
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  sx={{
                    mb: 1.5,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      height: 46,
                      bgcolor: "#EEF1FF",
                      "& fieldset": { borderColor: "#B8B2FA" },
                      "&:hover fieldset": { borderColor: "#9D94F7" },
                      "&.Mui-focused fieldset": { borderColor: "#7B6FF0" },
                    },
                  }}
                />
              </MotionBox>

              {/* Password */}
              <MotionBox variants={item}>
                <TextField
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
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
                  sx={{
                    mb: 1.25,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      height: 46,
                      bgcolor: "#EEF1FF",
                      "& fieldset": { borderColor: "#B8B2FA" },
                      "&:hover fieldset": { borderColor: "#9D94F7" },
                      "&.Mui-focused fieldset": { borderColor: "#7B6FF0" },
                    },
                  }}
                />
              </MotionBox>

              <MotionBox
                variants={item}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2.5,
                }}
              >
                <FormControlLabel
                  control={<Checkbox size="small" />}
                  label="Keep me logged in"
                  sx={{
                    color: "text.secondary",
                    "& .MuiFormControlLabel-label": { fontSize: 14 },
                  }}
                />
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  underline="hover"
                  sx={{ fontWeight: 700, fontSize: 14 }}
                >
                  Forgot your password?
                </Link>
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
                  height: 50,
                  borderRadius: 999,
                  fontWeight: 800,
                  letterSpacing: ".06em",
                  bgcolor: "#978bf7",
                  ":hover": { bgcolor: "#6b60d1" },
                  boxShadow: "0 8px 22px rgba(151,139,247,.45)",
                }}
              >
                {loading ? "Logging in…" : "SIGN  IN"}
              </MotionButton>
            </Box>

            <MotionBox variants={item}>
              <Typography
                variant="body2"
                sx={{
                  mt: 3.5,
                  mb: 1.25,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Or sign in with
              </Typography>
            </MotionBox>

            <Stack direction="row" spacing={1.75}>
              {[GoogleIcon, AppleIcon, FacebookIcon, CloseIcon].map(
                (Icon, i) => (
                  <MotionBox key={i} variants={item}>
                    <IconButton
                      size="medium"
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 999,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "#fff",
                        boxShadow: "0 5px 12px rgba(0,0,0,.06)",
                        ":hover": { bgcolor: "#F8FAFC" },
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </MotionBox>
                )
              )}
            </Stack>
          </MotionBox>
        </MotionPaper>
      </Container>

      {/* Success toast */}
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
          Logged in successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
