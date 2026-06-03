import { useEffect, useState } from "react";
import API from "../lib/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  LinearProgress,
  Avatar,
  Chip,
} from "@mui/material";

import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export default function TeacherRegister() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState(null);

  const loadLatest = async () => {
    try {
      const { data } = await API.get("/api/teacher/my-application/");
      setLatest(data);
    } catch { }
  };

  useEffect(() => {
    loadLatest();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!file) {
      setMsg("Please attach your CV (PDF).");
      return;
    }

    const fd = new FormData();
    fd.append("first_name", form.first_name);
    fd.append("last_name", form.last_name);
    fd.append("email", form.email);
    fd.append("phone", form.phone);
    fd.append("resume_file", file);

    setLoading(true);
    try {
      await API.post("/api/teacher/apply/", fd);
      setMsg("Application submitted! Status: PENDING");
      await loadLatest();
      setTimeout(() => (window.location.href = "/teacher/status"), 600);
    } catch {
      setMsg("Failed to submit. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: 2,
        py: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at top left, rgba(124,58,237,0.12), transparent 25%), linear-gradient(135deg,#f9f7ff,#ffffff)",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 560 }}>

        {/* ================= HERO ================= */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 2,
            borderRadius: "24px",
            border: "1px solid rgba(124,58,237,0.12)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,244,255,0.95))",
            boxShadow: "0 18px 40px rgba(124,58,237,0.08)",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                width: 60,
                height: 60,
                borderRadius: "18px",
                background: "linear-gradient(135deg,#7c3aed,#6366f1)",
                boxShadow: "0 12px 30px rgba(99,102,241,0.3)",
              }}
            >
              <SchoolRoundedIcon sx={{ fontSize: 30 }} />
            </Avatar>

            <Box>
              <Chip
                icon={<AutoAwesomeRoundedIcon />}
                label="Become an Instructor"
                sx={{
                  mb: 1,
                  borderRadius: "999px",
                  fontWeight: 700,
                  bgcolor: "rgba(124,58,237,0.08)",
                  color: "#6d28d9",
                }}
              />

              <Typography fontWeight={900} fontSize={22}>
                Teacher Registration
              </Typography>

              <Typography color="text.secondary" fontSize={14}>
                Apply to teach and share your knowledge with students.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ================= FORM ================= */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "24px",
            border: "1px solid rgba(15,23,42,0.06)",
            background: "white",
            boxShadow: "0 16px 40px rgba(15,23,42,0.06)",
          }}
        >
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          {msg && (
            <Alert
              severity={msg.startsWith("Failed") ? "error" : "success"}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {msg}
            </Alert>
          )}

          {latest?.has_application && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Latest application status: <b>{latest.status}</b>
            </Alert>
          )}

          <Stack component="form" spacing={2.2} onSubmit={onSubmit}>

            {/* Names */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="First Name"
                fullWidth
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                sx={inputStyle}
              />
              <TextField
                label="Last Name"
                fullWidth
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
                sx={inputStyle}
              />
            </Stack>

            <TextField
              label="Email"
              type="email"
              fullWidth
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              sx={inputStyle}
            />

            <TextField
              label="Phone"
              fullWidth
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              sx={inputStyle}
            />

            {/* Upload */}
            <Box
              sx={{
                p: 3,
                borderRadius: "20px",
                textAlign: "center",
                border: "2px dashed rgba(124,58,237,0.3)",
                background: "rgba(124,58,237,0.03)",
                cursor: "pointer",
                transition: "0.25s",
                "&:hover": {
                  background: "rgba(124,58,237,0.08)",
                  borderColor: "#7c3aed",
                },
              }}
              onClick={() => document.getElementById("cvUpload").click()}
            >
              <UploadFileRoundedIcon sx={{ fontSize: 40, color: "#7c3aed" }} />

              <Typography fontWeight={700} mt={1}>
                Upload CV (PDF)
              </Typography>

              <Typography fontSize={13} color="text.secondary">
                {file ? file.name : "Click or drag your CV here"}
              </Typography>

              <input
                id="cvUpload"
                type="file"
                hidden
                accept="application/pdf"
                onChange={(e) =>
                  setFile(e.target.files?.[0] || null)
                }
              />
            </Box>

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                mt: 1,
                py: 1.4,
                borderRadius: "16px",
                fontWeight: 800,
                background:
                  "linear-gradient(135deg,#7c3aed,#6366f1)",
                boxShadow: "0 14px 30px rgba(99,102,241,0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg,#6d28d9,#4f46e5)",
                },
              }}
            >
              Submit Application
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

/* ================= STYLES ================= */

const inputStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    background: "rgba(255,255,255,0.9)",
  },
};