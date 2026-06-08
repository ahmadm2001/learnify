import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Divider,
  Dialog,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  InputBase,
  CircularProgress,
  Paper,
  Chip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ImageIcon from "@mui/icons-material/Image";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import PhotoIcon from "@mui/icons-material/Photo";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

import { socialApi } from "../../lib/socialApi";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const palette = {
  primary: "#7c3aed",
  secondary: "#6366f1",
  background:
    "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 28%), radial-gradient(circle at top right, rgba(99,102,241,0.10), transparent 22%), linear-gradient(180deg, #fcfbff 0%, #f8f5ff 45%, #f3ecff 100%)",
  card: "rgba(255,255,255,0.88)",
  border: "rgba(124,58,237,0.14)",
  textMuted: "#6b7280",
  dark: "#1f2937",
  soft: "#faf7ff",
  like: "#7c3aed",
};

/* ================= POST TEXT WITH ...MORE ================= */
function PostContent({ text }) {
  const [expanded, setExpanded] = useState(false);
  const value = text || "";
  const isLong = value.length > 120;

  return (
    <>
      <Typography
        sx={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 3,
          WebkitBoxOrient: "vertical",
          whiteSpace: "pre-line",
          color: palette.dark,
          lineHeight: 1.8,
          fontSize: "0.98rem",
        }}
      >
        {value}
      </Typography>

      {isLong && (
        <Button
          size="small"
          sx={{
            textTransform: "none",
            pl: 0,
            mt: 0.5,
            color: palette.primary,
            fontWeight: 700,
          }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "...more"}
        </Button>
      )}
    </>
  );
}

/* ================= COMMENT TEXT WITH ...MORE ================= */
function CommentText({ text }) {
  const [expanded, setExpanded] = useState(false);
  const value = text || "";
  const isLong = value.length > 120;

  return (
    <>
      <Typography
        variant="body2"
        sx={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          whiteSpace: "pre-line",
          color: palette.dark,
          lineHeight: 1.7,
        }}
      >
        {value}
      </Typography>

      {isLong && (
        <Typography
          variant="caption"
          sx={{
            cursor: "pointer",
            color: palette.primary,
            userSelect: "none",
            fontWeight: 700,
            mt: 0.5,
            display: "inline-block",
          }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "...more"}
        </Typography>
      )}
    </>
  );
}

/* ================= IMAGE GRID ================= */
function ImageGrid({ images, onImageClick }) {
  if (!images || images.length === 0) return null;

  const count = images.length;
  const showImages = images.slice(0, 4);

  return (
    <Box mt={2.25}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: count === 1 ? "1fr" : "1fr 1fr",
          gap: "6px",
          borderRadius: 1,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        }}
      >
        {showImages.map((img, idx) => {
          const isLast = idx === 3 && count > 4;

          return (
            <Box
              key={img?.id ?? idx}
              onClick={() => onImageClick(images, idx)}
              sx={{
                position: "relative",
                cursor: "pointer",
                height: count === 1 ? 380 : 210,
                bgcolor: "#eee",
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={img.image}
                alt=""
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.35s ease",
                  "&:hover": {
                    transform: "scale(1.03)",
                  },
                }}
              />

              {isLast && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,0.55)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 34,
                    fontWeight: 800,
                    backdropFilter: "blur(2px)",
                  }}
                >
                  +{count - 4}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

/* ================= EMPTY STATE ================= */
function EmptyFeedState({ onCreate }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 5,
        textAlign: "center",
        borderRadius: 1,
        bgcolor: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${palette.border}`,
        boxShadow: "0 16px 40px rgba(124,58,237,0.08)",
      }}
    >
      <Avatar
        sx={{
          mx: "auto",
          mb: 2,
          width: 58,
          height: 58,
          bgcolor: "rgba(124,58,237,0.14)",
          color: palette.primary,
        }}
      >
        <AutoAwesomeOutlinedIcon />
      </Avatar>

      <Typography
        variant="h6"
        sx={{ fontWeight: 800, color: palette.dark, mb: 1 }}
      >
        No posts yet
      </Typography>

      <Typography
        sx={{ color: palette.textMuted, maxWidth: 420, mx: "auto", mb: 3 }}
      >
        Start sharing your thoughts, questions, achievements, or updates with
        others.
      </Typography>

      <Button
        variant="contained"
        onClick={onCreate}
        sx={{
          textTransform: "none",
          borderRadius: 999,
          px: 3,
          py: 1.1,
          fontWeight: 800,
          background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
          boxShadow: "0 14px 28px rgba(124,58,237,0.24)",
          "&:hover": {
            background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
          },
        }}
      >
        Create first post
      </Button>
    </Paper>
  );
}

/* ================= FEED ================= */
export default function StudentFeed() {
  const { user } = useAuth();
  const api = socialApi();

  if (!user) return null;

  if (user.role !== "STUDENT") {
    return <Navigate to="/instructor/dashboard" replace />;
  }

  // posts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // create/edit post modal
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  // new uploaded files
  const [images, setImages] = useState([]);

  /**
   * previewImages holds:
   * - existing images: { id: number, url: string, file: null }
   * - new images:      { id: null,   url: string, file: File }
   */
  const [previewImages, setPreviewImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  const [posting, setPosting] = useState(false);

  // edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  // menu (post actions)
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  // comments
  const [openComments, setOpenComments] = useState(null);
  const [comments, setComments] = useState({});
  const [commentsLoading, setCommentsLoading] = useState({});
  const [commentText, setCommentText] = useState("");

  // comment actions menu
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [commentMenuCtx, setCommentMenuCtx] = useState(null);

  // image viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  const myUsername = useMemo(() => user?.username || "", [user]);

  /* ================= FETCH POSTS ================= */
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/posts/");
      setPosts(res.data);
    } finally {
      setLoading(false);
    }
  };

  /* ================= REMOVE PREVIEW IMAGE ================= */
  const removePreviewImage = (imgObj) => {
    setPreviewImages((prev) =>
      prev.filter((p) => !(p.id === imgObj.id && p.url === imgObj.url))
    );

    if (imgObj.id) {
      setRemovedImageIds((prev) =>
        prev.includes(imgObj.id) ? prev : [...prev, imgObj.id]
      );
      return;
    }

    if (imgObj.file) {
      setImages((prev) => prev.filter((f) => f !== imgObj.file));
    }

    if (imgObj.url?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(imgObj.url);
      } catch {
        // ignore
      }
    }
  };

  /* ================= CREATE / EDIT MODAL OPEN ================= */
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingPostId(null);
    setText("");
    setImages([]);
    setPreviewImages([]);
    setRemovedImageIds([]);
    setOpen(true);
  };

  const resetCreateModal = () => {
    setOpen(false);
    setText("");
    setImages([]);
    setPreviewImages([]);
    setRemovedImageIds([]);
    setPosting(false);
    setIsEditing(false);
    setEditingPostId(null);
  };

  /* ================= EDIT POST OPEN ================= */
  const openEditPost = (post) => {
    if (!post) return;

    closeMenu();

    setIsEditing(true);
    setEditingPostId(post.id);
    setText(post.content || "");

    const existing = (post.images || []).map((i) => ({
      id: i.id,
      url: i.image,
      file: null,
    }));

    setPreviewImages(existing);
    setImages([]);
    setRemovedImageIds([]);
    setOpen(true);
  };

  /* ================= IMAGE PICKER ================= */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviews = files.map((file) => ({
      id: null,
      url: URL.createObjectURL(file),
      file,
    }));

    setPreviewImages((prev) => [...prev, ...newPreviews]);
    setImages((prev) => [...prev, ...files]);

    e.target.value = "";
  };

  /* ================= CREATE OR UPDATE POST ================= */
  const createOrUpdatePost = async () => {
    if (posting) return;

    try {
      setPosting(true);

      const formData = new FormData();
      formData.append("content", text);

      images.forEach((img) => formData.append("images", img));
      removedImageIds.forEach((id) =>
        formData.append("removed_images", String(id))
      );

      if (isEditing && editingPostId) {
        try {
          await api.patch(`/posts/${editingPostId}/`, formData);
        } catch (errPatch) {
          try {
            await api.put(`/posts/${editingPostId}/`, formData);
          } catch (errPut) {
            console.error(errPut);
            alert(
              "Edit failed. Your backend may not support PATCH/PUT for /posts/<id>/. Tell me your edit endpoint and I will wire it."
            );
            setPosting(false);
            return;
          }
        }
      } else {
        await api.post("/posts/", formData);
      }

      resetCreateModal();
      fetchPosts();
    } catch (err) {
      console.error(err);
      setPosting(false);
      alert("Failed to submit post. Check console for error.");
    }
  };

  /* ================= LIKE ================= */
  const likePost = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like/`);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= POST MENU ================= */
  const openMenu = (e, post) => {
    setMenuAnchor(e.currentTarget);
    setSelectedPost(post);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setSelectedPost(null);
  };

  const deletePost = async () => {
    if (!selectedPost) return;
    if (!confirm("Delete this post?")) return;

    try {
      await api.delete(`/posts/${selectedPost.id}/`);
      closeMenu();
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to delete post.");
    }
  };

  /* ================= COMMENTS ================= */
  const loadComments = async (postId) => {
    try {
      setCommentsLoading((prev) => ({ ...prev, [postId]: true }));
      const res = await api.get(`/posts/${postId}/comments/`);
      setComments((prev) => ({ ...prev, [postId]: res.data }));
    } catch (err) {
      console.error(err);
      alert("Failed to load comments.");
    } finally {
      setCommentsLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId) => {
    if (openComments === postId) {
      setOpenComments(null);
      setCommentText("");
      return;
    }
    setOpenComments(postId);
    setCommentText("");
    await loadComments(postId);
  };

  const addComment = async (postId) => {
    const value = commentText.trim();
    if (!value) return;

    try {
      await api.post(`/posts/${postId}/comments/`, { text: value });
      setCommentText("");
      await loadComments(postId);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Failed to add comment.");
    }
  };

  const deleteComment = async (postId, commentId) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await api.delete(`/comments/${commentId}/`);
      await loadComments(postId);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert(
        "Delete comment failed. If your backend doesn't have /comments/<id>/ delete endpoint, tell me the correct URL and I will update this file."
      );
    }
  };

  const openCommentMenu = (e, postId, commentId) => {
    setCommentMenuAnchor(e.currentTarget);
    setCommentMenuCtx({ postId, commentId });
  };

  const closeCommentMenu = () => {
    setCommentMenuAnchor(null);
    setCommentMenuCtx(null);
  };

  const deleteCommentFromMenu = async () => {
    if (!commentMenuCtx) return;
    closeCommentMenu();
    await deleteComment(commentMenuCtx.postId, commentMenuCtx.commentId);
  };

  /* ================= IMAGE VIEWER ================= */
  const openViewer = (imgs, idx) => {
    setViewerImages(imgs || []);
    setViewerIndex(idx || 0);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setViewerImages([]);
    setViewerIndex(0);
  };

  const prevImage = () => {
    setViewerIndex((i) => (i === 0 ? viewerImages.length - 1 : i - 1));
  };

  const nextImage = () => {
    setViewerIndex((i) => (i === viewerImages.length - 1 ? 0 : i + 1));
  };

  useEffect(() => {
    if (!viewerOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") closeViewer();
      if (
        viewerImages.length > 1 &&
        (e.key === "ArrowLeft" || e.key === "ArrowRight")
      ) {
        e.preventDefault();
        e.key === "ArrowLeft" ? prevImage() : nextImage();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerOpen, viewerImages.length]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: palette.background,
        py: { xs: 2, md: 4 },
      }}
    >
      <Box
        maxWidth={760}
        mx="auto"
        sx={{
          px: { xs: 1.5, md: 2 },
        }}
      >
        {/* ===== PAGE HEADER ===== */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: { xs: 2.2, md: 3 },
            borderRadius: 1,
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(14px)",
            border: `1px solid ${palette.border}`,
            boxShadow: "0 18px 42px rgba(124,58,237,0.07)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: palette.dark,
                  mb: 0.5,
                  letterSpacing: "-0.02em",
                }}
              >
                Student Feed
              </Typography>

              <Typography sx={{ color: palette.textMuted }}>
                Stay connected with announcements, updates, and student posts
              </Typography>
            </Box>

            <Chip
              icon={<AutoAwesomeOutlinedIcon />}
              label="Community Feed"
              sx={{
                bgcolor: "rgba(124,58,237,0.10)",
                color: palette.primary,
                fontWeight: 700,
                borderRadius: 999,
                "& .MuiChip-icon": {
                  color: palette.primary,
                },
              }}
            />
          </Stack>
        </Paper>

        {/* ===== START POST CARD ===== */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 1,
            cursor: "pointer",
            bgcolor: palette.card,
            backdropFilter: "blur(14px)",
            border: `1px solid ${palette.border}`,
            boxShadow: "0 16px 36px rgba(124,58,237,0.08)",
            overflow: "hidden",
          }}
          onClick={openCreateModal}
        >
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "rgba(124,58,237,0.16)",
                  color: palette.primary,
                  fontWeight: 800,
                }}
              >
                {myUsername?.[0]?.toUpperCase()}
              </Avatar>

              <Box
                sx={{
                  flex: 1,
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 999,
                  px: 2,
                  py: 1.35,
                  color: palette.textMuted,
                  bgcolor: "#fafafa",
                  fontWeight: 500,
                  transition: "all 0.25s ease",
                  "&:hover": {
                    borderColor: "rgba(124,58,237,0.22)",
                    bgcolor: "#fff",
                  },
                }}
              >
                Start a post
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={{ xs: 1.5, md: 3 }}
              mt={2.5}
              ml={{ xs: 0, sm: 7.5 }}
              flexWrap="wrap"
              useFlexGap
              sx={{ color: palette.textMuted }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <PhotoIcon fontSize="small" sx={{ color: palette.primary }} />
                <Typography variant="body2" fontWeight={600}>
                  Photo
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <ImageIcon fontSize="small" sx={{ color: palette.secondary }} />
                <Typography variant="body2" fontWeight={600}>
                  Media
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <EditOutlinedIcon
                  fontSize="small"
                  sx={{ color: palette.primary }}
                />
                <Typography variant="body2" fontWeight={600}>
                  Write article
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ===== CREATE / EDIT POST MODAL ===== */}
        <Dialog
          open={open}
          onClose={resetCreateModal}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 1,
              overflow: "hidden",
              background: "linear-gradient(180deg, #ffffff 0%, #fcfaff 100%)",
            },
          }}
        >
          <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" justifyContent="space-between" mb={2.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "rgba(124,58,237,0.16)",
                    color: palette.primary,
                    fontWeight: 800,
                  }}
                >
                  {myUsername?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight={800} color={palette.dark}>
                    {isEditing ? "Edit post" : myUsername}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Post to Anyone
                  </Typography>
                </Box>
              </Stack>

              <IconButton onClick={resetCreateModal}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <TextField
              fullWidth
              multiline
              minRows={5}
              placeholder="What do you want to talk about?"
              variant="standard"
              value={text}
              onChange={(e) => setText(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{
                "& .MuiInputBase-root": {
                  fontSize: "1rem",
                  color: palette.dark,
                  lineHeight: 1.8,
                },
              }}
            />

            {previewImages.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                mt={2.5}
                flexWrap="wrap"
                useFlexGap
              >
                {previewImages.map((img, idx) => (
                  <Box
                    key={`${img.id ?? "new"}-${idx}-${img.url}`}
                    sx={{
                      position: "relative",
                      width: 92,
                      height: 92,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 8px 18px rgba(15,23,42,0.06)",
                    }}
                  >
                    <Box
                      component="img"
                      src={img.url}
                      alt=""
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    <IconButton
                      size="small"
                      onClick={() => removePreviewImage(img)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.6)",
                        color: "white",
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.8)",
                        },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            <Stack direction="row" spacing={2} mt={3} alignItems="center">
              <Button
                component="label"
                startIcon={<ImageIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: palette.primary,
                }}
              >
                Add photos
                <input
                  hidden
                  multiple
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </Button>
            </Stack>

            <Box display="flex" justifyContent="flex-end" mt={3}>
              <Button
                variant="contained"
                disabled={
                  posting ||
                  (!text.trim() && images.length === 0 && !isEditing)
                }
                onClick={createOrUpdatePost}
                sx={{
                  minWidth: 120,
                  textTransform: "none",
                  borderRadius: 999,
                  px: 3,
                  py: 1.1,
                  fontWeight: 800,
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                  boxShadow: "0 14px 28px rgba(124,58,237,0.24)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                  },
                }}
              >
                {posting ? "Saving..." : isEditing ? "Save" : "Post"}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* ===== POSTS LIST ===== */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : posts.length === 0 ? (
          <EmptyFeedState onCreate={openCreateModal} />
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              sx={{
                mb: 3,
                borderRadius: 1,
                bgcolor: palette.card,
                backdropFilter: "blur(14px)",
                border: `1px solid ${palette.border}`,
                boxShadow: "0 16px 36px rgba(124,58,237,0.08)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                {/* HEADER */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: "rgba(124,58,237,0.16)",
                        color: palette.primary,
                        fontWeight: 800,
                      }}
                    >
                      {post.author_name?.[0]?.toUpperCase()}
                    </Avatar>

                    <Box>
                      <Typography fontWeight={800} color={palette.dark}>
                        {post.author_name} {post.is_owner && "• You"}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: palette.textMuted }}
                      >
                        {new Date(post.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Stack>

                  {post.is_owner && (
                    <IconButton
                      onClick={(e) => openMenu(e, post)}
                      sx={{ color: palette.textMuted }}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  )}
                </Stack>

                {/* TEXT */}
                <Box mt={2.25}>
                  <PostContent text={post.content} />
                </Box>

                {/* IMAGES */}
                <ImageGrid images={post.images} onImageClick={openViewer} />

                {/* COUNTS */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2.25,
                    color: palette.textMuted,
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {post.likes_count} likes
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {post.comments_count} comments
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* LIKE & COMMENT */}
                <Box sx={{ display: "flex", justifyContent: "space-around", gap: 1 }}>
                  <Button
                    startIcon={
                      post.liked_by_me ? (
                        <ThumbUpIcon fontSize="small" />
                      ) : (
                        <ThumbUpOutlinedIcon fontSize="small" />
                      )
                    }
                    onClick={() => likePost(post.id)}
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1,
                      borderRadius: 2.5,
                      color: post.liked_by_me ? palette.like : palette.textMuted,
                      bgcolor: post.liked_by_me
                        ? "rgba(124,58,237,0.08)"
                        : "transparent",
                      "&:hover": {
                        bgcolor: "rgba(124,58,237,0.08)",
                      },
                    }}
                  >
                    Like
                  </Button>

                  <Button
                    startIcon={<ChatBubbleOutlineIcon fontSize="small" />}
                    onClick={() => toggleComments(post.id)}
                    sx={{
                      flex: 1,
                      textTransform: "none",
                      fontWeight: 700,
                      py: 1,
                      borderRadius: 2.5,
                      color:
                        openComments === post.id
                          ? palette.primary
                          : palette.textMuted,
                      bgcolor:
                        openComments === post.id
                          ? "rgba(124,58,237,0.08)"
                          : "transparent",
                      "&:hover": {
                        bgcolor: "rgba(124,58,237,0.08)",
                      },
                    }}
                  >
                    Comment
                  </Button>
                </Box>

                {/* COMMENTS PANEL */}
                {openComments === post.id && (
                  <Box mt={2.25}>
                    <Divider sx={{ mb: 2 }} />

                    {/* Add comment input */}
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "rgba(124,58,237,0.16)",
                          color: palette.primary,
                          fontWeight: 800,
                        }}
                      >
                        {myUsername?.[0]?.toUpperCase()}
                      </Avatar>

                      <Box
                        sx={{
                          flex: 1,
                          border: "1px solid rgba(15,23,42,0.10)",
                          borderRadius: 999,
                          px: 2,
                          py: 0.7,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: "white",
                          boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
                        }}
                      >
                        <InputBase
                          placeholder="Add a comment..."
                          sx={{ flex: 1, fontSize: 14 }}
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              addComment(post.id);
                            }
                          }}
                        />

                        <IconButton
                          size="small"
                          sx={{ color: "text.secondary" }}
                        >
                          <InsertEmoticonIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          sx={{ color: "text.secondary" }}
                        >
                          <PhotoIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Button
                        size="small"
                        variant="text"
                        sx={{
                          textTransform: "none",
                          color: palette.primary,
                          fontWeight: 800,
                        }}
                        onClick={() => addComment(post.id)}
                      >
                        Post
                      </Button>
                    </Stack>

                    {/* Comments list */}
                    <Box mt={2}>
                      {commentsLoading[post.id] ? (
                        <Box display="flex" justifyContent="center" py={2}>
                          <CircularProgress size={22} />
                        </Box>
                      ) : (
                        <Stack spacing={1.6}>
                          {(comments[post.id] || []).map((c) => {
                            const isMine =
                              (c.user_name || "").toLowerCase() ===
                              myUsername.toLowerCase();

                            return (
                              <Box key={c.id} sx={{ display: "flex", gap: 1.1 }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: "rgba(124,58,237,0.12)",
                                    color: palette.primary,
                                    fontWeight: 800,
                                  }}
                                >
                                  {(c.user_name || "?")[0]?.toUpperCase()}
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                  <Box
                                    sx={{
                                      bgcolor: palette.soft,
                                      borderRadius: 1,
                                      px: 1.4,
                                      py: 1.15,
                                      border: "1px solid rgba(124,58,237,0.08)",
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      justifyContent="space-between"
                                      alignItems="flex-start"
                                      spacing={1}
                                    >
                                      <Typography
                                        variant="body2"
                                        fontWeight={800}
                                        color={palette.dark}
                                      >
                                        {c.user_name}
                                      </Typography>

                                      {isMine && (
                                        <IconButton
                                          size="small"
                                          sx={{ color: "text.secondary" }}
                                          onClick={(e) =>
                                            openCommentMenu(e, post.id, c.id)
                                          }
                                        >
                                          <MoreHorizIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Stack>

                                    <CommentText text={c.text} />
                                  </Box>
                                </Box>
                              </Box>
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        )}

        {/* POST MENU */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={closeMenu}
        >
          <MenuItem onClick={() => openEditPost(selectedPost)}>✏️ Edit</MenuItem>
          <MenuItem onClick={deletePost}>🗑 Delete</MenuItem>
        </Menu>

        {/* COMMENT MENU */}
        <Menu
          anchorEl={commentMenuAnchor}
          open={Boolean(commentMenuAnchor)}
          onClose={closeCommentMenu}
        >
          <MenuItem onClick={deleteCommentFromMenu}>🗑 Delete</MenuItem>
        </Menu>

        {/* IMAGE VIEWER */}
        <Dialog
          open={viewerOpen}
          onClose={closeViewer}
          fullWidth
          maxWidth="lg"
          sx={{
            "& .MuiDialog-paper": {
              backgroundColor: "black",
              overflow: "hidden",
              borderRadius: 0,
              maxWidth: "100vw",
              margin: 0,
            },
          }}
        >
          <DialogContent
            sx={{
              p: 0,
              height: "100vh",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <IconButton
              onClick={closeViewer}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                color: "white",
                bgcolor: "rgba(0,0,0,0.6)",
                zIndex: 10,
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
              }}
            >
              <CloseIcon />
            </IconButton>

            {viewerImages.length > 1 && (
              <IconButton
                onClick={prevImage}
                sx={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.6)",
                  zIndex: 10,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                }}
              >
                <ChevronLeftIcon fontSize="large" />
              </IconButton>
            )}

            <Box
              component="img"
              src={viewerImages[viewerIndex]?.image}
              alt=""
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />

            {viewerImages.length > 1 && (
              <IconButton
                onClick={nextImage}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.6)",
                  zIndex: 10,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                }}
              >
                <ChevronRightIcon fontSize="large" />
              </IconButton>
            )}

            {viewerImages.length > 1 && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.6)",
                  px: 2,
                  py: 0.6,
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {viewerIndex + 1} / {viewerImages.length}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}