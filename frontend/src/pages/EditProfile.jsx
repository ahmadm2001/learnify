// frontend/src/pages/EditProfile.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";

import {
  Avatar,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Alert,
  Paper,
  Stack,
  TextField,
  Typography,
  Box,
} from "@mui/material";

export default function EditProfile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    id_number: "",
    address: "",
    bio: "",
    avatar_url: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [meta, setMeta] = useState({ role: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get("/api/profile/")
      .then(({ data }) => {
        setForm((prev) => ({ ...prev, ...data }));
        setMeta({ role: data.role || "STUDENT" });
      })
      .catch(() => setMessage("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setMessage("Passwords do not match");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      new_password: form.newPassword || undefined,
      confirm_password: form.confirmPassword || undefined,
    };

    try {
      await API.put("/api/profile/", payload);
      setMessage("Profile updated successfully");

      setTimeout(() => navigate("/account"), 800);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 6 }}>
        <LinearProgress />
      </Container>
    );
  }

  const initials =
    (form.first_name?.[0] || form.username?.[0] || "?") +
    (form.last_name?.[0] || "");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #eef2ff 0%, #f8fafc 40%, #f1f5ff 100%)",
        py: 5,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* ================= LEFT (PROFILE CARD) ================= */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: "24px",
                textAlign: "center",
                backdropFilter: "blur(10px)",
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.6)",
                boxShadow: "0 20px 50px rgba(99,102,241,0.15)",
              }}
            >
              {/* Avatar with glow */}
              <Box
                sx={{
                  display: "inline-block",
                  p: "4px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg,#7c3aed,#6366f1)",
                  mb: 2,
                }}
              >
                <Avatar
                  src={form.avatar_url}
                  sx={{
                    width: 100,
                    height: 100,
                    fontSize: 32,
                  }}
                >
                  {initials.toUpperCase()}
                </Avatar>
              </Box>

              <Typography fontWeight={800} fontSize={20}>
                {form.first_name || form.last_name
                  ? `${form.first_name} ${form.last_name}`
                  : form.username}
              </Typography>

              <Typography color="text.secondary" fontSize={14}>
                {form.email}
              </Typography>

              <Chip
                label={meta.role}
                sx={{
                  mt: 2,
                  borderRadius: 999,
                  fontWeight: 700,
                  background:
                    meta.role === "TEACHER_APPROVED"
                      ? "linear-gradient(135deg,#22c55e,#16a34a)"
                      : "#e2e8f0",
                  color:
                    meta.role === "TEACHER_APPROVED"
                      ? "#fff"
                      : "#475569",
                }}
              />

              {form.bio && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography fontSize={13} color="text.secondary">
                    {form.bio}
                  </Typography>
                </>
              )}
            </Paper>
          </Grid>

          {/* ================= RIGHT (FORM) ================= */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "24px",
                background: "#fff",
                border: "1px solid #eef2ff",
                boxShadow: "0 20px 60px rgba(0,0,0,0.05)",
              }}
            >
              <Typography fontSize={26} fontWeight={800} mb={1}>
                Edit Profile
              </Typography>

              <Typography color="text.secondary" mb={3}>
                Manage your personal information and account settings.
              </Typography>

              {message && (
                <Alert
                  severity={
                    message.includes("match") || message.includes("fail")
                      ? "error"
                      : "success"
                  }
                  sx={{ mb: 2 }}
                >
                  {message}
                </Alert>
              )}

              {saving && <LinearProgress sx={{ mb: 2 }} />}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* PERSONAL */}
                  <Section title="Personal Information">
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="First Name" value={form.first_name} onChange={handleChange("first_name")} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Last Name" value={form.last_name} onChange={handleChange("last_name")} />
                      </Grid>
                    </Grid>
                  </Section>

                  {/* CONTACT */}
                  <Section title="Contact">
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email" value={form.email} onChange={handleChange("email")} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Phone" value={form.phone} onChange={handleChange("phone")} />
                      </Grid>
                    </Grid>
                  </Section>

                  {/* ACCOUNT */}
                  <Section title="Account">
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Username" value={form.username} onChange={handleChange("username")} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="ID Number" value={form.id_number} onChange={handleChange("id_number")} />
                      </Grid>
                    </Grid>
                  </Section>

                  {/* PASSWORD */}
                  <Section title="Security">
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField type="password" fullWidth label="New Password" value={form.newPassword} onChange={handleChange("newPassword")} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField type="password" fullWidth label="Confirm Password" value={form.confirmPassword} onChange={handleChange("confirmPassword")} />
                      </Grid>
                    </Grid>
                  </Section>

                  {/* EXTRA */}
                  <Section title="Additional">
                    <TextField label="Address" multiline minRows={2} fullWidth value={form.address} onChange={handleChange("address")} />
                    <TextField label="Bio" multiline minRows={2} fullWidth value={form.bio} onChange={handleChange("bio")} />
                    <TextField label="Avatar URL" fullWidth value={form.avatar_url} onChange={handleChange("avatar_url")} />
                  </Section>

                  {/* BUTTON */}
                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      type="submit"
                      sx={{
                        px: 5,
                        py: 1.3,
                        borderRadius: 999,
                        fontWeight: 700,
                        textTransform: "none",
                        background:
                          "linear-gradient(135deg,#7c3aed,#6366f1)",
                        color: "#fff",
                        boxShadow:
                          "0 15px 40px rgba(99,102,241,0.4)",
                        "&:hover": {
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      Save Changes
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

/* ================= SECTION COMPONENT ================= */
function Section({ title, children }) {
  return (
    <Box>
      <Typography fontWeight={700} mb={1}>
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}