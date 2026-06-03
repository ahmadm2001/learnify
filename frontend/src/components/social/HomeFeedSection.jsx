import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Avatar,
    Stack,
    Divider,
    CircularProgress,
    InputBase,
    Button,
    IconButton,
    Dialog,
    DialogContent,
    Container,
    Chip,
    Paper,
} from "@mui/material";

import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { socialApi } from "../../lib/socialApi";
import { useAuth } from "../../context/AuthContext";

const palette = {
    primary: "#7c3aed",
    secondary: "#6366f1",
    soft: "#f6f0ff",
    soft2: "#faf7ff",
    border: "rgba(124,58,237,0.14)",
    textMuted: "#6b7280",
    dark: "#111827",
    white: "#ffffff",
    bg: "linear-gradient(180deg, #fcfbff 0%, #f8f5ff 45%, #f4eeff 100%)",
};

/* ================= POST TEXT WITH ...MORE ================= */
function PostContent({ text }) {
    const [expanded, setExpanded] = useState(false);
    const isLong = (text || "").length > 120;

    return (
        <Box>
            <Typography
                sx={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: expanded ? "unset" : 3,
                    WebkitBoxOrient: "vertical",
                    whiteSpace: "pre-line",
                    color: "#374151",
                    lineHeight: 1.8,
                    fontSize: "0.98rem",
                }}
            >
                {text}
            </Typography>

            {isLong && (
                <Button
                    size="small"
                    onClick={() => setExpanded((v) => !v)}
                    sx={{
                        textTransform: "none",
                        pl: 0,
                        mt: 0.5,
                        fontWeight: 700,
                        color: palette.primary,
                    }}
                >
                    {expanded ? "Show less" : "Read more"}
                </Button>
            )}
        </Box>
    );
}

/* ================= IMAGE GRID ================= */
function ImageGrid({ images, onOpen }) {
    if (!images || images.length === 0) return null;

    const count = images.length;
    const show = images.slice(0, 4);

    return (
        <Box mt={2.2}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: count === 1 ? "1fr" : "1fr 1fr",
                    gap: "6px",
                    borderRadius: 1,
                    overflow: "hidden",
                    bgcolor: "#ede9fe",
                }}
            >
                {show.map((img, idx) => {
                    const isLast = idx === 3 && count > 4;

                    return (
                        <Box
                            key={img.id ?? idx}
                            onClick={() => onOpen(images, idx)}
                            sx={{
                                position: "relative",
                                cursor: "pointer",
                                height: count === 1 ? 420 : 210,
                                bgcolor: "#eee",
                                overflow: "hidden",
                                "&:hover img": {
                                    transform: "scale(1.04)",
                                },
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
                                    display: "block",
                                }}
                            />

                            {isLast && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: 0,
                                        bgcolor: "rgba(17,24,39,0.55)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: 32,
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

/* ================= COMMENT ITEM ================= */
function CommentItem({ comment }) {
    return (
        <Stack direction="row" spacing={1.2} alignItems="flex-start">
            <Avatar
                sx={{
                    width: 34,
                    height: 34,
                    fontSize: 14,
                    bgcolor: "rgba(124,58,237,0.12)",
                    color: palette.primary,
                    fontWeight: 700,
                }}
            >
                {comment.user_name?.[0]?.toUpperCase()}
            </Avatar>

            <Box
                sx={{
                    flex: 1,
                    px: 1.5,
                    py: 1.2,
                    borderRadius: 1,
                    bgcolor: "#f9fafb",
                    border: "1px solid rgba(15,23,42,0.06)",
                }}
            >
                <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: palette.dark, mb: 0.3 }}
                >
                    {comment.user_name}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: "#4b5563", lineHeight: 1.7, whiteSpace: "pre-line" }}
                >
                    {comment.text}
                </Typography>
            </Box>
        </Stack>
    );
}

/* ================= POST CARD ================= */
function FeedPostCard({
    post,
    user,
    comments,
    openComments,
    toggleComments,
    likePost,
    commentText,
    setCommentText,
    addComment,
    onOpenViewer,
}) {
    return (
        <Card
            sx={{
                maxWidth: 760,
                mx: "auto",
                mb: 3.5,
                borderRadius: 1,
                border: `1px solid ${palette.border}`,
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 18px 45px rgba(17,24,39,0.06)",
                overflow: "hidden",
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Header */}
                <Stack direction="row" spacing={1.8} alignItems="center">
                    <Avatar
                        sx={{
                            width: 52,
                            height: 52,
                            fontWeight: 800,
                            bgcolor: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                            background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                            boxShadow: "0 10px 20px rgba(124,58,237,0.22)",
                        }}
                    >
                        {post.author_name?.[0]?.toUpperCase()}
                    </Avatar>

                    <Box flex={1} minWidth={0}>
                        <Typography
                            sx={{
                                fontWeight: 800,
                                color: palette.dark,
                                fontSize: "1rem",
                            }}
                        >
                            {post.author_name}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Typography variant="caption" sx={{ color: palette.textMuted }}>
                                {new Date(post.created_at).toLocaleDateString()}
                            </Typography>
                            <Box
                                sx={{
                                    width: 4,
                                    height: 4,
                                    borderRadius: "50%",
                                    bgcolor: "#c4b5fd",
                                }}
                            />
                            <Typography variant="caption" sx={{ color: palette.textMuted }}>
                                Community post
                            </Typography>
                        </Stack>
                    </Box>
                </Stack>

                {/* Content */}
                <Box mt={2.2}>
                    <PostContent text={post.content} />
                </Box>

                {/* Images */}
                <ImageGrid images={post.images} onOpen={onOpenViewer} />

                {/* Stats */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 2.2 }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                display: "grid",
                                placeItems: "center",
                                background:
                                    "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.18) 100%)",
                            }}
                        >
                            <FavoriteBorderIcon sx={{ fontSize: 14, color: palette.primary }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: "#4b5563", fontWeight: 600 }}>
                            {post.likes_count} likes
                        </Typography>
                    </Stack>

                    <Typography variant="body2" sx={{ color: "#6b7280", fontWeight: 600 }}>
                        {post.comments_count} comments
                    </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Actions */}
                <Stack direction="row" spacing={1.2}>
                    <Button
                        onClick={() => likePost(post.id)}
                        startIcon={
                            post.liked_by_me ? (
                                <ThumbUpIcon fontSize="small" />
                            ) : (
                                <ThumbUpOutlinedIcon fontSize="small" />
                            )
                        }
                        sx={{
                            flex: 1,
                            borderRadius: 999,
                            textTransform: "none",
                            py: 1.1,
                            fontWeight: 700,
                            color: post.liked_by_me ? palette.primary : "#4b5563",
                            background: post.liked_by_me
                                ? "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(99,102,241,0.08) 100%)"
                                : "#f9fafb",
                            border: post.liked_by_me
                                ? "1px solid rgba(124,58,237,0.16)"
                                : "1px solid rgba(15,23,42,0.06)",
                            "&:hover": {
                                background: post.liked_by_me
                                    ? "linear-gradient(135deg, rgba(124,58,237,0.13) 0%, rgba(99,102,241,0.11) 100%)"
                                    : "#f3f4f6",
                            },
                        }}
                    >
                        Like
                    </Button>

                    <Button
                        onClick={() => toggleComments(post.id)}
                        startIcon={<ChatBubbleOutlineIcon fontSize="small" />}
                        sx={{
                            flex: 1,
                            borderRadius: 999,
                            textTransform: "none",
                            py: 1.1,
                            fontWeight: 700,
                            color: openComments === post.id ? palette.primary : "#4b5563",
                            background:
                                openComments === post.id
                                    ? "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(99,102,241,0.08) 100%)"
                                    : "#f9fafb",
                            border:
                                openComments === post.id
                                    ? "1px solid rgba(124,58,237,0.16)"
                                    : "1px solid rgba(15,23,42,0.06)",
                            "&:hover": {
                                background:
                                    openComments === post.id
                                        ? "linear-gradient(135deg, rgba(124,58,237,0.13) 0%, rgba(99,102,241,0.11) 100%)"
                                        : "#f3f4f6",
                            },
                        }}
                    >
                        Comment
                    </Button>
                </Stack>

                {/* Comments */}
                {openComments === post.id && (
                    <Box
                        mt={2.4}
                        sx={{
                            borderRadius: 1,
                            p: 2,
                            background: "linear-gradient(180deg, #fcfbff 0%, #faf7ff 100%)",
                            border: "1px solid rgba(124,58,237,0.10)",
                        }}
                    >
                        <Typography
                            sx={{
                                fontWeight: 800,
                                color: palette.dark,
                                mb: 1.6,
                                fontSize: "0.98rem",
                            }}
                        >
                            Comments
                        </Typography>

                        <Stack spacing={1.5}>
                            {(comments[post.id] || []).length > 0 ? (
                                (comments[post.id] || []).map((c) => (
                                    <CommentItem key={c.id} comment={c} />
                                ))
                            ) : (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: "#fff",
                                        border: "1px dashed rgba(124,58,237,0.18)",
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: palette.textMuted }}>
                                        No comments yet. Start the conversation.
                                    </Typography>
                                </Paper>
                            )}
                        </Stack>

                        {user && (
                            <Stack
                                direction="row"
                                spacing={1}
                                mt={2}
                                alignItems="center"
                            >
                                <Avatar
                                    sx={{
                                        width: 38,
                                        height: 38,
                                        fontSize: 15,
                                        bgcolor: "rgba(124,58,237,0.12)",
                                        color: palette.primary,
                                        fontWeight: 700,
                                    }}
                                >
                                    {user?.username?.[0]?.toUpperCase() || "U"}
                                </Avatar>

                                <Box
                                    sx={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        border: "1px solid rgba(15,23,42,0.08)",
                                        background: "#fff",
                                        px: 1.5,
                                        py: 0.8,
                                        borderRadius: 999,
                                    }}
                                >
                                    <InputBase
                                        placeholder="Write a thoughtful comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        sx={{
                                            flex: 1,
                                            fontSize: "0.95rem",
                                        }}
                                    />

                                    <IconButton
                                        onClick={() => addComment(post.id)}
                                        sx={{
                                            bgcolor: palette.primary,
                                            color: "#fff",
                                            width: 36,
                                            height: 36,
                                            "&:hover": {
                                                bgcolor: "#6d28d9",
                                            },
                                        }}
                                    >
                                        <SendRoundedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            </Stack>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

/* ================= HOME FEED ================= */
export default function HomeFeedSection() {
    const { user } = useAuth();
    const api = socialApi();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openComments, setOpenComments] = useState(null);
    const [comments, setComments] = useState({});
    const [commentText, setCommentText] = useState("");

    /* image viewer */
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerImages, setViewerImages] = useState([]);
    const [viewerIndex, setViewerIndex] = useState(0);

    const myUsername = useMemo(() => user?.username || "", [user]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/posts/home/");
            setPosts(res.data);
        } finally {
            setLoading(false);
        }
    };

    const likePost = async (id) => {
        await api.post(`/posts/${id}/like/`);
        fetchPosts();
    };

    const toggleComments = async (id) => {
        if (openComments === id) {
            setOpenComments(null);
            return;
        }
        const res = await api.get(`/posts/${id}/comments/`);
        setComments((p) => ({ ...p, [id]: res.data }));
        setOpenComments(id);
    };

    const addComment = async (id) => {
        if (!commentText.trim()) return;
        await api.post(`/posts/${id}/comments/`, { text: commentText });
        setCommentText("");
        const res = await api.get(`/posts/${id}/comments/`);
        setComments((p) => ({ ...p, [id]: res.data }));
        fetchPosts();
    };

    /* IMAGE VIEWER */
    const openViewer = (imgs, idx) => {
        setViewerImages(imgs);
        setViewerIndex(idx);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
        setViewerImages([]);
        setViewerIndex(0);
    };

    const prev = () =>
        setViewerIndex((i) => (i === 0 ? viewerImages.length - 1 : i - 1));

    const next = () =>
        setViewerIndex((i) => (i === viewerImages.length - 1 ? 0 : i + 1));

    return (
        <Box
            sx={{
                minHeight: "100vh",
                pt: { xs: 8, md: 10 },
                pb: 8,
                background:
                    "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 24%), radial-gradient(circle at top right, rgba(99,102,241,0.10), transparent 20%), linear-gradient(180deg, #fcfbff 0%, #f8f5ff 45%, #f4eeff 100%)",
            }}
        >
            <Container maxWidth="md">
                {/* Hero */}
                <Paper
                    elevation={0}
                    sx={{
                        mb: 4,
                        borderRadius: 1,
                        p: { xs: 2.5, md: 4 },
                        background: "rgba(255,255,255,0.82)",
                        backdropFilter: "blur(12px)",
                        border: `1px solid ${palette.border}`,
                        boxShadow: "0 20px 50px rgba(124,58,237,0.07)",
                        overflow: "hidden",
                        position: "relative",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            top: -30,
                            right: -30,
                            width: 140,
                            height: 140,
                            borderRadius: "50%",
                            background: "rgba(124,58,237,0.08)",
                            filter: "blur(10px)",
                        }}
                    />
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: -40,
                            left: -20,
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: "rgba(99,102,241,0.08)",
                            filter: "blur(10px)",
                        }}
                    />

                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", sm: "center" }}
                        sx={{ position: "relative", zIndex: 1 }}
                    >
                        <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.2 }}>
                                <Chip
                                    icon={<AutoAwesomeIcon />}
                                    label="Social Learning"
                                    sx={{
                                        borderRadius: 999,
                                        bgcolor: "rgba(124,58,237,0.10)",
                                        color: palette.primary,
                                        fontWeight: 700,
                                    }}
                                />
                            </Stack>

                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 900,
                                    color: palette.dark,
                                    lineHeight: 1.1,
                                    fontSize: { xs: "2rem", md: "2.5rem" },
                                    mb: 1,
                                }}
                            >
                                Community Feed
                            </Typography>

                            <Typography
                                sx={{
                                    color: palette.textMuted,
                                    maxWidth: 640,
                                    lineHeight: 1.8,
                                    fontSize: "1rem",
                                }}
                            >
                                Discover what students and instructors are sharing, exchange ideas,
                                and stay connected with your learning community.
                            </Typography>
                        </Box>

                        <Paper
                            elevation={0}
                            sx={{
                                px: 2.2,
                                py: 1.8,
                                borderRadius: 4,
                                minWidth: 180,
                                bgcolor: "linear-gradient(135deg, #fff 0%, #faf7ff 100%)",
                                background: "linear-gradient(135deg, #fff 0%, #faf7ff 100%)",
                                border: "1px solid rgba(124,58,237,0.12)",
                            }}
                        >
                            <Stack direction="row" spacing={1.3} alignItems="center">
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 3,
                                        display: "grid",
                                        placeItems: "center",
                                        background:
                                            "linear-gradient(135deg, rgba(124,58,237,0.14) 0%, rgba(99,102,241,0.14) 100%)",
                                    }}
                                >
                                    <ForumOutlinedIcon sx={{ color: palette.primary }} />
                                </Box>

                                <Box>
                                    <Typography sx={{ fontWeight: 800, color: palette.dark }}>
                                        {posts.length}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: palette.textMuted }}>
                                        Posts loaded
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Stack>
                </Paper>

                {/* Feed */}
                {loading ? (
                    <Box display="flex" justifyContent="center" py={8}>
                        <Stack spacing={2} alignItems="center">
                            <CircularProgress sx={{ color: palette.primary }} />
                            <Typography sx={{ color: palette.textMuted }}>
                                Loading community posts...
                            </Typography>
                        </Stack>
                    </Box>
                ) : posts.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 1,
                            p: 5,
                            textAlign: "center",
                            background: "rgba(255,255,255,0.82)",
                            border: `1px solid ${palette.border}`,
                            boxShadow: "0 18px 45px rgba(17,24,39,0.05)",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: palette.dark, mb: 1 }}
                        >
                            No posts yet
                        </Typography>
                        <Typography sx={{ color: palette.textMuted }}>
                            When your community starts sharing, posts will appear here.
                        </Typography>
                    </Paper>
                ) : (
                    posts.map((post) => (
                        <FeedPostCard
                            key={post.id}
                            post={post}
                            user={user}
                            comments={comments}
                            openComments={openComments}
                            toggleComments={toggleComments}
                            likePost={likePost}
                            commentText={commentText}
                            setCommentText={setCommentText}
                            addComment={addComment}
                            onOpenViewer={openViewer}
                        />
                    ))
                )}
            </Container>

            {/* IMAGE VIEWER */}
            <Dialog
                open={viewerOpen}
                onClose={closeViewer}
                fullWidth
                maxWidth="lg"
                scroll="body"
                PaperProps={{
                    sx: {
                        bgcolor: "transparent",
                        boxShadow: "none",
                        overflow: "visible",
                    },
                }}
            >
                <DialogContent
                    sx={{
                        p: 0,
                        bgcolor: "rgba(0,0,0,0.94)",
                        borderRadius: 1,
                        minHeight: { xs: 340, md: 600 },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <IconButton
                        onClick={closeViewer}
                        sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                            color: "white",
                            bgcolor: "rgba(255,255,255,0.12)",
                            zIndex: 2,
                            "&:hover": {
                                bgcolor: "rgba(255,255,255,0.18)",
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {viewerImages.length > 1 && (
                        <IconButton
                            onClick={prev}
                            sx={{
                                position: "absolute",
                                left: 16,
                                color: "white",
                                bgcolor: "rgba(255,255,255,0.10)",
                                zIndex: 2,
                                "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.18)",
                                },
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
                            maxWidth: "100%",
                            maxHeight: "78vh",
                            objectFit: "contain",
                            display: "block",
                        }}
                    />

                    {viewerImages.length > 1 && (
                        <IconButton
                            onClick={next}
                            sx={{
                                position: "absolute",
                                right: 16,
                                color: "white",
                                bgcolor: "rgba(255,255,255,0.10)",
                                zIndex: 2,
                                "&:hover": {
                                    bgcolor: "rgba(255,255,255,0.18)",
                                },
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
                                px: 2,
                                py: 0.8,
                                borderRadius: 999,
                                bgcolor: "rgba(255,255,255,0.12)",
                                color: "#fff",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                backdropFilter: "blur(8px)",
                            }}
                        >
                            {viewerIndex + 1} / {viewerImages.length}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}