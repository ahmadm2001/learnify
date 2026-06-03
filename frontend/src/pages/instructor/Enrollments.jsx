// src/pages/instructor/Enrollments.jsx

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Button,
  Typography,
  Alert,
  Avatar,
  Chip,
  Stack,
  Container,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SchoolIcon from "@mui/icons-material/School";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";

import Swal from "sweetalert2";

export default function Enrollments() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access");

      const res = await fetch("http://localhost:8000/api/enroll/pending/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const msg = await res.text();
        console.error("Fetch error:", msg);
        setError(`Error loading enrollments: ${res.status}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setPending(data);
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error while loading enrollments.");
    }

    setLoading(false);
  };

  const handleApprove = async (courseId, studentId) => {
    const token = localStorage.getItem("access");

    try {
      const res = await fetch(
        `http://localhost:8000/api/enroll/approve/${courseId}/${studentId}/`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        console.error(msg);
        setError("Error approving student.");
        return;
      }

      Swal.fire({
        title: "Student Approved",
        text: "The student now has access to the course.",
        icon: "success",
        confirmButtonColor: "#6366F1",
      });

      fetchPending();
    } catch (err) {
      console.error(err);
      setError("Network error while approving student.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#7c3aed" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
        background:
          "linear-gradient(180deg,#ffffff 0%,#faf7ff 40%,#f3ecff 100%)",
      }}
    >
      <Container maxWidth="lg">
        {/* HEADER */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 1,
            background:
              "linear-gradient(135deg,#7c3aed 0%,#6366f1 100%)",
            color: "white",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <SchoolIcon sx={{ fontSize: 38 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Pending Enrollments
              </Typography>

              <Typography sx={{ opacity: 0.9 }}>
                Approve students requesting access to your courses
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* STATS */}
        <Stack direction="row" spacing={3} mb={4}>
          <Card sx={{ p: 3, flex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <HourglassTopIcon sx={{ color: "#7c3aed" }} />
              <Box>
                <Typography fontWeight={700} fontSize={20}>
                  {pending.length}
                </Typography>
                <Typography color="text.secondary">
                  Pending Requests
                </Typography>
              </Box>
            </Stack>
          </Card>

          <Card sx={{ p: 3, flex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <PersonOutlineIcon sx={{ color: "#6366f1" }} />
              <Box>
                <Typography fontWeight={700} fontSize={20}>
                  {pending.length}
                </Typography>
                <Typography color="text.secondary">
                  Students Waiting
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {pending.length === 0 && (
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 1,
            }}
          >
            <Typography variant="h6" mb={1}>
              No students waiting for approval
            </Typography>

            <Typography color="text.secondary">
              When students request to join your courses,
              they will appear here.
            </Typography>
          </Paper>
        )}

        {/* STUDENT CARDS */}
        <Stack spacing={3}>
          {pending.map((item) => (
            <Card
              key={item.id}
              sx={{
                p: 3,
                borderRadius: 1,
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                transition: "0.25s",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
                },
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ md: "center" }}
                justifyContent="space-between"
                spacing={2}
              >
                {/* LEFT SIDE */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: "#7c3aed",
                      width: 50,
                      height: 50,
                      fontWeight: 700,
                    }}
                  >
                    {item.student_name?.charAt(0)}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={700} fontSize={18}>
                      {item.student_name}
                    </Typography>

                    <Chip
                      label={item.course_title}
                      size="small"
                      sx={{
                        mt: 0.5,
                        background: "#eef2ff",
                        color: "#4f46e5",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Stack>

                {/* ACTION */}
                <Button
                  startIcon={<CheckCircleOutlineIcon />}
                  variant="contained"
                  onClick={() =>
                    handleApprove(item.course_id, item.student_id)
                  }
                  sx={{
                    background:
                      "linear-gradient(135deg,#7c3aed 0%,#6366f1 100%)",
                    px: 3,
                    py: 1.2,
                    fontWeight: 600,
                    borderRadius: 2,
                    boxShadow: "0 10px 20px rgba(124,58,237,0.3)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg,#6d28d9 0%,#4f46e5 100%)",
                    },
                  }}
                >
                  Approve Student
                </Button>
              </Stack>
            </Card>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}