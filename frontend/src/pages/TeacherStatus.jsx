import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../lib/api";
import {
  Container,
  Paper,
  Typography,
  Alert,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";

export default function TeacherStatus() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState(null);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, appRes] = await Promise.all([
          API.get("/api/auth/me/"),
          API.get("/api/teacher/my-application/"),
        ]);
        setMe(meRes.data);
        setApp(appRes.data);

        if (meRes.data.role === "TEACHER_APPROVED") {
          nav("/instructor");
        }
      } catch {
        setErr("Failed to load status. Are you logged in?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [nav]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (err) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Alert severity="error">{err}</Alert>
      </Container>
    );
  }

  if (!app || !app.has_application) {
    return (
      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Teacher Application Status
          </Typography>
          <Alert severity="info">
            You have not submitted an application yet.
          </Alert>
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() => nav("/teacher/register")}
          >
            Go to Teacher Registration
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Teacher Application Status
        </Typography>

        <Alert severity="info" sx={{ mb: 2 }}>
          Current status: <b>{app.status}</b>
        </Alert>

        {me && me.role === "TEACHER_PENDING" && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Your application was submitted to Admin. Please wait for approval.
          </Typography>
        )}

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography>
            <b>Name:</b> {app.first_name} {app.last_name}
          </Typography>
          <Typography>
            <b>Email:</b> {app.email}
          </Typography>
          <Typography>
            <b>Phone:</b> {app.phone}
          </Typography>
          <Typography>
            <b>CV:</b>{" "}
            {app.resume_url ? (
              <a href={app.resume_url} target="_blank" rel="noreferrer">
                View PDF
              </a>
            ) : (
              "Not available"
            )}
          </Typography>
        </Stack>

        <Button variant="outlined" onClick={() => nav("/instructor")}>
          Go to Instructor Page
        </Button>
      </Paper>
    </Container>
  );
}
