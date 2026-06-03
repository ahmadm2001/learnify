import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../lib/api";
import { Snackbar, Alert } from "@mui/material";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Link,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import OndemandVideoIcon from "@mui/icons-material/OndemandVideo";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import LaunchIcon from "@mui/icons-material/Launch";
import CloseIcon from "@mui/icons-material/Close";
import QuizIcon from "@mui/icons-material/Quiz";
import { Link as RouterLink } from "react-router-dom";



export default function InstructorCourseEdit() {
  const { courseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);
  // Modal
  const [openModal, setOpenModal] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [editingLecture, setEditingLecture] = useState(null);

  const [lectureData, setLectureData] = useState({
    title: "",
    mode: "file",
    videoFile: null,
    videoUrl: "",
    files: [], // ✅ MULTIPLE FILES
  });
  // Delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: null,      // "section" or "lecture"
    id: null,
    title: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // PDF delete popup state
  const [pdfDeleteDialog, setPdfDeleteDialog] = useState({
    open: false,
    fileId: null,
    fileName: "",
  });



  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------- Helpers ----------
  const isYoutube = (url = "") => /youtube\.com|youtu\.be/i.test(url || "");

  const getYoutubeId = (url = "") => {
    const m = (url || "").match(/(?:youtube\.com.*v=|youtu\.be\/)([^&?/]+)/);
    return m?.[1] || null;
  };
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
  const handleRemoveExistingPdf = (fileId, fileName) => {
    setPdfDeleteDialog({
      open: true,
      fileId,
      fileName,
    });
  };
  const confirmRemovePdf = async () => {
    try {
      setBusy(true);

      await API.delete(
        `/api/lecture-files/${pdfDeleteDialog.fileId}/delete/`
      );

      setExistingFiles((prev) =>
        prev.filter((f) => f.id !== pdfDeleteDialog.fileId)
      );

      showSnackbar("PDF removed successfully");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to remove PDF", "error");
    } finally {
      setBusy(false);
      setPdfDeleteDialog({ open: false, fileId: null, fileName: "" });
    }
  };

  const getYoutubeThumbnail = (url = "") => {
    const id = getYoutubeId(url);
    return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
  };

  // Nice placeholder for uploaded files (we can't generate real thumbnail without extra work)
  const fileThumbSvg = useMemo(() => {
    const svg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#7c3aed"/>
            <stop offset="0.6" stop-color="#6366f1"/>
            <stop offset="1" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
        <circle cx="72" cy="90" r="34" fill="rgba(255,255,255,0.22)"/>
        <polygon points="64,70 64,110 98,90" fill="rgba(255,255,255,0.90)"/>
        <text x="138" y="86" fill="rgba(255,255,255,0.95)" font-size="18" font-family="Arial" font-weight="700">Video File</text>
        <text x="138" y="112" fill="rgba(255,255,255,0.85)" font-size="13" font-family="Arial">Uploaded to Learnify</text>
      </svg>
    `);
    return `data:image/svg+xml;charset=utf-8,${svg}`;
  }, []);

  const getLectureThumb = (videoLink) => {
    if (!videoLink) return fileThumbSvg;
    if (isYoutube(videoLink)) return getYoutubeThumbnail(videoLink) || fileThumbSvg;
    return fileThumbSvg;
  };

  const resetModalState = () => {
    setEditingLecture(null);
    setActiveSection(null);
    setLectureData({
      title: "",
      mode: "file",
      videoFile: null,
      videoUrl: "",
      files: [],
    });
    setError("");
    setSuccess("");
  };

  const openAddLecture = (sectionId) => {
    resetModalState();
    setActiveSection(sectionId);
    setOpenModal(true);
  };

  const openEditLecture = (sectionId, lec) => {
    resetModalState();
    setActiveSection(sectionId);
    setEditingLecture(lec);

    const videoLink = lec?.video_link || "";
    const yt = isYoutube(videoLink);

    setLectureData({
      title: lec?.title || "",
      mode: yt ? "url" : "file",
      videoFile: null,
      videoUrl: yt ? videoLink : "",
      files: [], // ONLY new files
    });

    // ✅ THIS IS THE FIX
    setExistingFiles(lec.files || []);

    setOpenModal(true);
  };

  // ---------- API ----------
  useEffect(() => {
    loadCurriculum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/api/courses/${courseId}/curriculum/`);
      setSections(res.data || []);
    } catch (e) {
      console.error(e);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    try {
      setBusy(true);
      await API.post(`/api/courses/${courseId}/sections/add/`, {
        title: newSectionTitle.trim(),
        order: (sections?.length || 0) + 1,
      });
      setNewSectionTitle("");
      await loadCurriculum();
    } catch (e) {
      console.error(e);
      alert("Failed to add section");
    } finally {
      setBusy(false);
    }
  };

  const askDeleteSection = (sectionId, sectionTitle) => {
    setDeleteDialog({
      open: true,
      type: "section",
      id: sectionId,
      title: sectionTitle,
    });
  };


  const askDeleteLecture = (lectureId, lectureTitle) => {
    setDeleteDialog({
      open: true,
      type: "lecture",
      id: lectureId,
      title: lectureTitle,
    });
  };


  const handleConfirmDelete = async () => {
    try {
      setBusy(true);

      if (deleteDialog.type === "section") {
        await API.delete(`/api/courses/sections/${deleteDialog.id}/delete/`);
        showSnackbar("Section deleted successfully");
      }

      if (deleteDialog.type === "lecture") {
        await API.delete(`/api/lectures/${deleteDialog.id}/delete/`);
        showSnackbar("Section deleted successfully");
      }

      setDeleteDialog({ open: false, type: null, id: null, title: "" });
      await loadCurriculum();
    } catch (e) {
      console.error(e);
      alert("Delete failed — check backend endpoint.");
    } finally {
      setBusy(false);
    }
  };


  const saveLecture = async () => {
    setError("");

    if (!lectureData.title.trim()) {
      setError("Lecture title is required.");
      return;
    }

    const hasVideoFile = Boolean(lectureData.videoFile);
    const hasVideoUrl = Boolean(lectureData.videoUrl && lectureData.videoUrl.trim());

    if (!editingLecture && !hasVideoFile && !hasVideoUrl) {
      setError("Please upload a video OR paste a YouTube link.");
      return;
    }

    const fd = new FormData();
    fd.append("title", lectureData.title.trim());

    if (lectureData.mode === "file" && lectureData.videoFile) {
      fd.append("video", lectureData.videoFile);
    }

    if (lectureData.mode === "url" && lectureData.videoUrl.trim()) {
      fd.append("video_url", lectureData.videoUrl.trim());
    }

    try {
      setBusy(true);

      let lectureId = null;

      // ✅ 1. CREATE or UPDATE lecture
      if (editingLecture) {
        await API.patch(
          `/api/lectures/${editingLecture.id}/edit/`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        lectureId = editingLecture.id;
      } else {
        const res = await API.post(
          `/api/sections/${activeSection}/lectures/add/`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        lectureId = res.data.id; // ✅ VERY IMPORTANT
      }

      // ✅ 2. UPLOAD MULTIPLE FILES
      if (lectureData.files.length > 0) {
        const filesFd = new FormData();
        lectureData.files.forEach((file) => {
          filesFd.append("files", file);
        });

        await API.post(
          `/api/lectures/${lectureId}/files/upload/`,
          filesFd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      showSnackbar("Lecture saved successfully");

      setOpenModal(false);
      resetModalState();
      await loadCurriculum();

    } catch (e) {
      console.error(e);
      showSnackbar("Save failed. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading curriculum...
        </Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 6 },
        background:
          "radial-gradient(1200px 600px at 20% 0%, rgba(124,58,237,0.12), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(99,102,241,0.12), transparent 55%), #f6f7fb",
      }}
    >
      <Container maxWidth="md">
        {/* Top hero header */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 1,
            border: "1px solid rgba(99,102,241,0.14)",
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.09), rgba(14,165,233,0.06))",
            boxShadow: "0 14px 40px rgba(15,23,42,0.08)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: -0.6 }}>
                Curriculum Builder
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Create your course like Udemy — sections and lectures with video + PDFs.
              </Typography>
            </Box>

            <Chip
              label={`${sections.length} sections`}
              sx={{
                fontWeight: 800,
                bgcolor: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.18)",
              }}
            />
          </Stack>
        </Paper>

        {/* Add Section card */}
        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 4,
            borderRadius: 1,
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(15,23,42,0.06)",
            boxShadow: "0 16px 45px rgba(15,23,42,0.08)",
          }}
        >
          <Typography fontWeight={900} sx={{ mb: 1 }}>
            Add a new section
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Example: “Day 1 — Basics”, “Week 2 — Functions”
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="New section title"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  background: "#fff",
                },
              }}
            />
            <Button
              variant="contained"
              onClick={addSection}
              startIcon={<AddIcon />}
              disabled={busy}
              sx={{
                px: 3,
                borderRadius: 0.7,
                textTransform: "none",
                fontWeight: 900,
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                boxShadow: "0 12px 25px rgba(99,102,241,0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
                },
              }}
            >
              Add Section
            </Button>
          </Stack>
        </Paper>

        {/* Empty state */}
        {sections.length === 0 && (
          <Paper
            sx={{
              p: 4,
              borderRadius: 1,
              textAlign: "center",
              border: "1px dashed rgba(99,102,241,0.35)",
              background: "rgba(255,255,255,0.70)",
            }}
          >
            <Typography fontWeight={900} sx={{ mb: 1 }}>
              No sections yet
            </Typography>
            <Typography color="text.secondary">
              Add your first section to start building your course.
            </Typography>
          </Paper>
        )}

        {/* Sections */}
        {sections.map((section, sIndex) => (
          <Paper
            key={section.id}
            sx={{
              mb: 5,
              borderRadius: 1,
              overflow: "hidden",
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(15,23,42,0.06)",
              boxShadow: "0 18px 55px rgba(15,23,42,0.09)",
            }}
          >
            {/* Section header */}
            <Box
              sx={{
                px: 3,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background:
                  "linear-gradient(90deg, rgba(124,58,237,0.13), rgba(99,102,241,0.08))",
                borderBottom: "1px solid rgba(15,23,42,0.06)",
              }}
            >
              <Stack spacing={0.2}>
                <Typography fontWeight={950}>
                  Section {sIndex + 1}: {section.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.lectures?.length || 0} lectures
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Add lecture">
                  <IconButton
                    onClick={() => openAddLecture(section.id)}
                    sx={{
                      bgcolor: "rgba(99,102,241,0.10)",
                      "&:hover": { bgcolor: "rgba(99,102,241,0.16)" },
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete section">
                  <IconButton
                    color="error"
                    onClick={() => askDeleteSection(section.id, section.title)}
                    sx={{
                      bgcolor: "rgba(239,68,68,0.10)",
                      "&:hover": { bgcolor: "rgba(239,68,68,0.16)" },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>

                </Tooltip>
              </Stack>
            </Box>

            {/* Section body */}
            <Box sx={{ p: 3 }}>
              {!section.lectures?.length ? (
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 1,
                    border: "1px dashed rgba(99,102,241,0.35)",
                    background: "rgba(99,102,241,0.04)",
                  }}
                >
                  <Typography fontWeight={900}>No lectures yet</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    Click the <b>+</b> button to add a lecture to this section.
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {section.lectures.map((lec, idx) => {
                    const videoLink = lec.video_link || "";
                    const thumb = getLectureThumb(videoLink);
                    const yt = isYoutube(videoLink);

                    return (
                      <Paper
                        key={lec.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          borderRadius: 1,
                          border: "1px solid rgba(15,23,42,0.06)",
                          boxShadow: "0 8px 22px rgba(15,23,42,0.06)",
                          transition: "transform 140ms ease, box-shadow 140ms ease",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 16px 38px rgba(15,23,42,0.10)",
                          },
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          src={thumb}
                          sx={{
                            width: 98,
                            height: 56,
                            borderRadius: 0.5,
                            flexShrink: 0,
                            border: "1px solid rgba(99,102,241,0.14)",
                            bgcolor: "rgba(99,102,241,0.08)",
                          }}
                        />

                        <Box flexGrow={1} minWidth={0}>
                          <Typography fontWeight={950} noWrap>
                            {idx + 1}. {lec.title}
                          </Typography>

                          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                            <Chip
                              icon={<OndemandVideoIcon />}
                              label={yt ? "YouTube" : "Video File"}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                bgcolor: yt ? "rgba(244,63,94,0.10)" : "rgba(99,102,241,0.10)",
                                border: yt
                                  ? "1px solid rgba(244,63,94,0.18)"
                                  : "1px solid rgba(99,102,241,0.18)",
                              }}
                            />

                            {lec.files?.length > 0 && (
                              <Chip
                                icon={<PictureAsPdfIcon />}
                                label={`PDF × ${lec.files.length}`}
                                size="small"
                                sx={{
                                  fontWeight: 900,
                                  bgcolor: "rgba(245,158,11,0.12)",
                                  border: "1px solid rgba(245,158,11,0.20)",
                                }}
                                onClick={() => window.open(lec.files[0].file_url, "_blank")}
                                clickable
                              />
                            )}

                            {lec.duration ? (
                              <Chip
                                label={`Duration: ${lec.duration}`}
                                size="small"
                                sx={{
                                  fontWeight: 800,
                                  bgcolor: "rgba(15,23,42,0.06)",
                                  border: "1px solid rgba(15,23,42,0.08)",
                                }}
                              />
                            ) : null}

                            {lec.is_preview ? (
                              <Chip
                                label="Preview"
                                size="small"
                                sx={{
                                  fontWeight: 900,
                                  bgcolor: "rgba(16,185,129,0.12)",
                                  border: "1px solid rgba(16,185,129,0.20)",
                                }}
                              />
                            ) : null}
                          </Stack>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          {yt && (
                            <Tooltip title="Open YouTube">
                              <IconButton
                                onClick={() => window.open(videoLink, "_blank")}
                                sx={{
                                  bgcolor: "rgba(99,102,241,0.10)",
                                  "&:hover": { bgcolor: "rgba(99,102,241,0.16)" },
                                }}
                              >
                                <LaunchIcon />
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="Manage Quiz">
                            <IconButton
                              component={RouterLink}
                              to={`/instructor/lectures/${lec.id}/quiz`}
                              sx={{
                                bgcolor: "rgba(16,185,129,0.10)",
                                "&:hover": { bgcolor: "rgba(16,185,129,0.18)" },
                              }}
                            >
                              <QuizIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit lecture">
                            <IconButton
                              onClick={() => openEditLecture(section.id, lec)}
                              sx={{
                                bgcolor: "rgba(15,23,42,0.06)",
                                "&:hover": { bgcolor: "rgba(15,23,42,0.10)" },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete lecture">
                            <IconButton
                              color="error"
                              onClick={() => askDeleteLecture(lec.id, lec.title)}
                              sx={{
                                bgcolor: "rgba(239,68,68,0.10)",
                                "&:hover": { bgcolor: "rgba(239,68,68,0.16)" },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>

                          </Tooltip>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Paper>
        ))}

        {/* PDF Delete Confirmation Dialog */}
        <Dialog
          open={pdfDeleteDialog.open}
          onClose={() =>
            setPdfDeleteDialog({ open: false, fileId: null, fileName: "" })
          }
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 1,
              padding: 1.5,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 900 }}>
            Remove PDF
          </DialogTitle>

          <DialogContent>
            <Typography>
              Are you sure you want to remove:
            </Typography>

            <Typography fontWeight={900} sx={{ mt: 1 }}>
              {pdfDeleteDialog.fileName}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() =>
                setPdfDeleteDialog({ open: false, fileId: null, fileName: "" })
              }
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={confirmRemovePdf}
              disabled={busy}
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, type: null, id: null, title: "" })}
          PaperProps={{
            sx: {
              borderRadius: 1.5,
              p: 1,
              boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 900 }}>
            Confirm Delete
          </DialogTitle>

          <DialogContent>
            <Typography>
              Are you sure you want to delete{" "}
              <b>{deleteDialog.title}</b>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ px: 2, pb: 2 }}>
            <Button
              onClick={() => setDeleteDialog({ open: false, type: null, id: null, title: "" })}
              sx={{ textTransform: "none", fontWeight: 800 }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmDelete}
              disabled={busy}
              sx={{
                textTransform: "none",
                fontWeight: 900,
                borderRadius: 1,
                boxShadow: "0 8px 18px rgba(239,68,68,0.35)",
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lecture Modal */}
        <Dialog
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            resetModalState();
          }}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 1,
              overflow: "hidden",
              boxShadow: "0 24px 70px rgba(15,23,42,0.20)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))",
              borderBottom: "1px solid rgba(15,23,42,0.06)",
              fontWeight: 950,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography fontWeight={950} sx={{ lineHeight: 1.1 }}>
                {editingLecture ? "Edit Lecture" : "Add Lecture"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingLecture ? "Update title / video / PDF" : "Add a new lecture to this section"}
              </Typography>
            </Box>

            <IconButton
              onClick={() => {
                setOpenModal(false);
                resetModalState();
              }}
              sx={{ bgcolor: "rgba(15,23,42,0.06)" }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent
            sx={{
              pt: "20px !important",
              pb: 3,
            }}
          >
            <Stack spacing={2.5}>
              {error && (
                <Paper sx={{ p: 1.5, borderRadius: 1, border: "1px solid rgba(239,68,68,0.25)", bgcolor: "rgba(239,68,68,0.08)" }}>
                  <Typography color="error" fontWeight={800}>
                    {error}
                  </Typography>
                </Paper>
              )}

              {success && (
                <Paper sx={{ p: 1.5, borderRadius: 1, border: "1px solid rgba(16,185,129,0.25)", bgcolor: "rgba(16,185,129,0.10)" }}>
                  <Typography sx={{ color: "rgba(16,185,129,1)" }} fontWeight={900}>
                    {success}
                  </Typography>
                </Paper>
              )}

              <TextField
                label="Lecture Title"
                fullWidth
                value={lectureData.title}
                onChange={(e) => setLectureData({ ...lectureData, title: e.target.value })}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 1, background: "#fff" },
                }}
              />

              <Box>
                <Typography fontWeight={900} sx={{ mb: 1 }}>
                  Video source
                </Typography>

                <ToggleButtonGroup
                  exclusive
                  value={lectureData.mode}
                  onChange={(_, v) => {
                    if (v !== null) {
                      setLectureData((prev) => ({
                        ...prev,
                        mode: v,
                        // when switching mode, don't keep wrong field visible:
                        videoFile: v === "file" ? prev.videoFile : null,
                        videoUrl: v === "url" ? prev.videoUrl : "",
                      }));
                    }
                  }}
                  sx={{
                    "& .MuiToggleButtonGroup-grouped": {
                      textTransform: "none",
                      fontWeight: 900,
                      px: 2,
                      borderRadius: "5px !important",
                      borderColor: "rgba(99,102,241,0.25) !important",
                    },
                  }}
                >
                  <ToggleButton value="file">Upload Video</ToggleButton>
                  <ToggleButton value="url">YouTube Link</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {lectureData.mode === "file" ? (
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: "1px dashed rgba(99,102,241,0.35)",
                    background: "rgba(99,102,241,0.04)",
                  }}
                >
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                    <Box flexGrow={1}>
                      <Typography fontWeight={900}>Upload a video file</Typography>
                      <Typography variant="body2" color="text.secondary">
                        MP4 / MOV supported
                      </Typography>
                      {lectureData.videoFile && (
                        <Typography variant="body2" sx={{ mt: 0.6, fontWeight: 800 }}>
                          Selected: {lectureData.videoFile.name}
                        </Typography>
                      )}
                    </Box>

                    <Button
                      component="label"
                      variant="contained"
                      disabled={busy}
                      sx={{
                        borderRadius: 1,
                        textTransform: "none",
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                      }}
                    >
                      Choose File
                      <input
                        hidden
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setLectureData({ ...lectureData, videoFile: e.target.files?.[0] || null })
                        }
                      />
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: "1px dashed rgba(244,63,94,0.35)",
                    background: "rgba(244,63,94,0.04)",
                  }}
                >
                  <Typography fontWeight={900}>Paste YouTube URL</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Example: https://youtu.be/abc123 or https://www.youtube.com/watch?v=abc123
                  </Typography>

                  <TextField
                    label="YouTube URL"
                    fullWidth
                    value={lectureData.videoUrl}
                    onChange={(e) => setLectureData({ ...lectureData, videoUrl: e.target.value })}
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 1, background: "#fff" },
                    }}
                  />

                  {lectureData.videoUrl && isYoutube(lectureData.videoUrl) && (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }}>
                      <Avatar
                        variant="rounded"
                        src={getYoutubeThumbnail(lectureData.videoUrl)}
                        sx={{
                          width: 110,
                          height: 62,
                          borderRadius: 0.5,
                          border: "1px solid rgba(244,63,94,0.18)",
                        }}
                      />
                      <Link
                        component="button"
                        onClick={() => window.open(lectureData.videoUrl, "_blank")}
                        underline="hover"
                        sx={{ fontWeight: 900 }}
                      >
                        Preview on YouTube
                      </Link>
                    </Stack>
                  )}
                </Paper>
              )}

              <Divider sx={{ my: 0.5 }} />

              <Box>
                <Typography fontWeight={900} sx={{ mb: 1 }}>
                  Lecture Files (Multiple PDFs)
                </Typography>

                {/* EXISTING PDFs */}
                {existingFiles.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography
                      fontWeight={900}
                      sx={{ mb: 1, color: "text.secondary" }}
                    >
                      Existing PDFs
                    </Typography>

                    {existingFiles.map((f) => {
                      const displayName =
                        f.original_name ||
                        f.file_name ||
                        f.name ||
                        f.filename ||
                        (f.file ? f.file.split("/").pop() : "PDF file");

                      return (
                        <Paper
                          key={f.id}
                          sx={{
                            p: 1.2,
                            mb: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderRadius: 1,
                            border: "1px solid rgba(245,158,11,0.25)",
                            bgcolor: "rgba(245,158,11,0.08)",
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                            <PictureAsPdfIcon color="warning" />
                            <Typography fontWeight={700} noWrap sx={{ maxWidth: 320 }}>
                              {displayName}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={0.5}>
                            <Button
                              size="small"
                              onClick={() => window.open(f.file_url, "_blank")}
                            >
                              Open
                            </Button>

                            <IconButton
                              size="small"
                              onClick={() => handleRemoveExistingPdf(f.id, displayName)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Box>
                )}

                <Button
                  component="label"
                  variant="outlined"
                  disabled={busy}
                  sx={{
                    borderRadius: 0.8,
                    textTransform: "none",
                    fontWeight: 900,
                  }}
                >
                  Attach PDFs
                  <input
                    hidden
                    type="file"
                    multiple
                    accept="application/pdf"
                    onChange={(e) =>
                      setLectureData({
                        ...lectureData,
                        files: Array.from(e.target.files),
                      })
                    }
                  />
                </Button>


                {lectureData.files.length > 0 && (
                  <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                    {lectureData.files.map((f, i) => (
                      <Paper
                        key={i}
                        sx={{
                          px: 1.5,
                          py: 1,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 1.2,
                          border: "1px solid rgba(245,158,11,0.25)",
                          bgcolor: "rgba(245,158,11,0.08)",
                        }}
                      >
                        {/* Left side: icon + name */}
                        <Stack direction="row" spacing={1.2} alignItems="center" minWidth={0}>
                          <PictureAsPdfIcon sx={{ color: "rgba(245,158,11,1)" }} />

                          <Typography
                            variant="body2"
                            fontWeight={900}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {f.name}
                          </Typography>
                        </Stack>

                        {/* Right side: remove button */}
                        <IconButton
                          size="small"
                          onClick={() =>
                            setLectureData((prev) => ({
                              ...prev,
                              files: prev.files.filter((_, index) => index !== i),
                            }))
                          }
                          sx={{
                            bgcolor: "rgba(239,68,68,0.10)",
                            "&:hover": { bgcolor: "rgba(239,68,68,0.18)" },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid rgba(15,23,42,0.06)",
              background: "rgba(255,255,255,0.92)",
            }}
          >
            <Button
              onClick={() => {
                setOpenModal(false);
                resetModalState();
              }}
              sx={{ textTransform: "none", fontWeight: 900, borderRadius: 999 }}
              disabled={busy}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={saveLecture}
              disabled={busy}
              sx={{
                px: 3,
                borderRadius: 0.8,
                textTransform: "none",
                fontWeight: 950,
                background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                boxShadow: "0 12px 25px rgba(99,102,241,0.25)",
                "&:hover": {
                  background: "linear-gradient(135deg, #6d28d9, #4f46e5)",
                },
              }}
            >
              {editingLecture ? "Save Changes" : "Add Lecture"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ mb: 2, ml: 2 }}
      >
        <Alert
          onClose={handleSnackbarClose}
          variant="filled"
          sx={{
            borderRadius: "14px",
            fontWeight: 800,
            fontSize: "0.95rem",
            px: 2.5,
            py: 1.4,
            backdropFilter: "blur(12px)",
            boxShadow: "0 18px 40px rgba(15,23,42,0.18)",

            // 🎨 Premium gradients (same style)
            background:
              snackbar.severity === "success"
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : snackbar.severity === "error"
                  ? "linear-gradient(135deg, #ef4444, #dc2626)"
                  : snackbar.severity === "warning"
                    ? "linear-gradient(135deg, #f59e0b, #d97706)"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",

            color: "#fff",

            "& .MuiAlert-icon": {
              fontSize: 20,
            },

            "& .MuiAlert-action": {
              alignItems: "center",
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
