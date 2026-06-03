import { useEffect, useState } from "react";
import API from "../lib/api";
import {
  Container, Paper, Typography, Alert, Stack, Button, LinearProgress
} from "@mui/material";

export default function ApplyTeacher() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);   // latest app info
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    try {
      const { data } = await API.get("/api/teacher/my-application/");
      setStatus(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!file) { setMsg("Please choose a PDF resume."); return; }
    const form = new FormData();
    form.append("resume_file", file);
    setLoading(true);
    try {
      await API.post("/api/teacher/apply/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("Application submitted!");
      setFile(null);
      await loadStatus();
    } catch {
      setMsg("Failed to submit. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Apply as Teacher
        </Typography>

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {status?.has_application && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Latest application status: <b>{status.status}</b>
            {status.resume_url ? <> — <a href={status.resume_url} target="_blank">view resume</a></> : null}
          </Alert>
        )}

        {msg && <Alert sx={{ mb: 2 }} severity={msg.includes("Failed") ? "error" : "success"}>{msg}</Alert>}

        <Stack spacing={2} component="form" onSubmit={submit}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button type="submit" variant="contained">Submit Application</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
