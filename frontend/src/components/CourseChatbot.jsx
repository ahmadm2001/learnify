import { useEffect, useMemo, useRef, useState } from "react";
import API from "../lib/api";
import {
    Box,
    IconButton,
    TextField,
    Typography,
    CircularProgress,
    Chip,
    Fade,
    Zoom,
    Tooltip,
    Divider,
} from "@mui/material";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import OpenInFullRoundedIcon from "@mui/icons-material/OpenInFullRounded";
import CloseFullscreenRoundedIcon from "@mui/icons-material/CloseFullscreenRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

const QUICK_PROMPTS = [
    "Explain this lecture in simple words",
    "Give me a short summary",
    "What are the important points?",
    "Can you give me an example?",
];

function formatTime(date = new Date()) {
    try {
        return new Intl.DateTimeFormat([], {
            hour: "numeric",
            minute: "2-digit",
        }).format(date);
    } catch {
        return "";
    }
}

function TypingDots() {
    return (
        <Box
            sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                px: 1,
            }}
        >
            {[0, 1, 2].map((i) => (
                <Box
                    key={i}
                    sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "rgba(71,85,105,0.7)",
                        animation: "chatbotBounce 1.2s infinite ease-in-out",
                        animationDelay: `${i * 0.15}s`,
                    }}
                />
            ))}
        </Box>
    );
}

function EmptyState({ onPromptClick }) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                height: "100%",
                px: 2.5,
                py: 4,
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "24px",
                    display: "grid",
                    placeItems: "center",
                    background:
                        "linear-gradient(135deg, rgba(34,197,94,0.16), rgba(16,185,129,0.10))",
                    border: "1px solid rgba(34,197,94,0.18)",
                    boxShadow: "0 12px 28px rgba(151, 154, 228, 0.12)",
                    mb: 2,
                }}
            >
                <SmartToyRoundedIcon sx={{ fontSize: 34, color: "#7C3AED" }} />
            </Box>

            <Typography
                sx={{
                    fontSize: "1rem",
                    fontWeight: 900,
                    color: "#0f172a",
                    mb: 0.8,
                }}
            >
                Your AI course helper is ready
            </Typography>

            <Typography
                sx={{
                    fontSize: "0.92rem",
                    color: "#64748b",
                    lineHeight: 1.7,
                    maxWidth: 280,
                    mb: 2.2,
                }}
            >
                Ask for summaries, simple explanations, examples, key concepts, or
                help understanding the current lecture.
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: 1,
                    maxWidth: 300,
                }}
            >
                {QUICK_PROMPTS.map((prompt) => (
                    <Chip
                        key={prompt}
                        label={prompt}
                        onClick={() => onPromptClick(prompt)}
                        clickable
                        sx={{
                            borderRadius: "999px",
                            fontWeight: 800,
                            px: 0.6,
                            background: "rgba(255,255,255,0.85)",
                            border: "1px solid rgba(15,23,42,0.08)",
                            boxShadow: "0 6px 16px rgba(15,23,42,0.05)",
                            "&:hover": {
                                background: "rgba(240,253,244,1)",
                                borderColor: "rgba(34,197,94,0.28)",
                            },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default function CourseChatbot({ courseId, lectureTitle }) {
    const [open, setOpen] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const nowLabel = useMemo(() => formatTime(), [open, fullscreen, minimized]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, loading]);

    useEffect(() => {
        if (open && !minimized) {
            const timer = setTimeout(() => inputRef.current?.focus(), 220);
            return () => clearTimeout(timer);
        }
    }, [open, minimized, fullscreen]);

    const handleQuickPrompt = (prompt) => {
        setInput(prompt);
        setTimeout(() => inputRef.current?.focus(), 120);
    };

    const handleRefreshChat = () => {
        setMessages([]);
        setInput("");
    };

    const sendMessage = async (forcedText) => {
        const currentInput = (forcedText ?? input).trim();
        if (!currentInput || loading) return;

        const userMsg = {
            id: `${Date.now()}-user`,
            role: "user",
            text: currentInput,
            time: formatTime(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await API.post("/api/ai/chat/", {
                message: currentInput,
                course_id: courseId,
                lecture_title: lectureTitle,
            });

            const botMsg = {
                id: `${Date.now()}-bot`,
                role: "bot",
                text: res?.data?.reply || "No response received.",
                time: formatTime(),
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            const errorText =
                err?.response?.data?.detail ||
                err?.response?.data?.reply ||
                "Something went wrong 😢";

            const botErrorMsg = {
                id: `${Date.now()}-error`,
                role: "bot",
                text: errorText,
                time: formatTime(),
            };

            setMessages((prev) => [...prev, botErrorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleOpen = () => {
        if (!open) {
            setOpen(true);
            setMinimized(false);
            return;
        }

        if (minimized) {
            setMinimized(false);
            return;
        }

        setOpen(false);
        setFullscreen(false);
    };

    const chatContainerSx = fullscreen
        ? {
            position: "fixed",
            inset: { xs: 12, sm: 18, md: 28 },
            borderRadius: { xs: "16px", md: "18px" },
        }
        : {
            position: "fixed",
            right: { xs: 12, sm: 24 },
            bottom: { xs: 90, sm: 100 },
            width: { xs: "calc(100vw - 24px)", sm: 390 },
            height: minimized ? 86 : 620,
            maxWidth: "100vw",
            borderRadius: "18px",
        };

    return (
        <>
            <Box
                component="style"
                sx={{
                    "@keyframes chatbotBounce": {
                        "0%, 80%, 100%": {
                            transform: "translateY(0)",
                            opacity: 0.4,
                        },
                        "40%": {
                            transform: "translateY(-4px)",
                            opacity: 1,
                        },
                    },
                    "@keyframes chatbotFloat": {
                        "0%": { transform: "translateY(0px)" },
                        "50%": { transform: "translateY(-6px)" },
                        "100%": { transform: "translateY(0px)" },
                    },
                    "@keyframes chatbotGlow": {
                        "0%": { boxShadow: "0 15px 40px rgba(34,197,94,0.35)" },
                        "50%": { boxShadow: "0 20px 54px rgba(34,197,94,0.5)" },
                        "100%": { boxShadow: "0 15px 40px rgba(34,197,94,0.35)" },
                    },
                }}
            />

            {/* Floating launcher */}
            <Zoom in={!open || minimized} timeout={220}>
                <IconButton
                    onClick={handleToggleOpen}
                    sx={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        width: 72,
                        height: 72,
                        color: "#fff",
                        zIndex: 9999,
                        background: "linear-gradient(135deg,#7C3AED,#8B5CF6,#6366F1)",
                        boxShadow: "0 18px 42px rgba(124,58,237,0.35)",
                        animation: "chatbotGlow 2.8s infinite ease-in-out",
                        transition: "all .25s ease",
                        "&:hover": {
                            transform: "scale(1.06)",
                            background:
                                "linear-gradient(135deg,#6D28D9,#7C3AED,#5B21B6)", // ✅ FIXED
                        },
                    }}
                >
                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 32 }} />
                </IconButton>
            </Zoom>

            {/* Chat panel */}
            <Fade in={open} timeout={250} unmountOnExit>
                <Box
                    sx={{
                        ...chatContainerSx,
                        zIndex: 9999,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        background:
                            "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.92))",
                        border: "1px solid rgba(255,255,255,0.45)",
                        backdropFilter: "blur(22px)",
                        boxShadow: "0 26px 80px rgba(15,23,42,0.18)",
                    }}
                >
                    {/* Decorative background */}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            background:
                                "radial-gradient(circle at top right, rgba(130, 135, 222, 0.16), transparent 24%), radial-gradient(circle at bottom left, rgba(16,185,129,0.08), transparent 28%)",
                        }}
                    />

                    {/* Header */}
                    <Box
                        sx={{
                            position: "relative",
                            px: 2.4,
                            py: 1.9,
                            color: "#fff",
                            background: "linear-gradient(135deg,#7C3AED 0%, #8B5CF6 45%, #6366F1 100%)",
                            boxShadow: "0 12px 28px rgba(22,163,74,0.24)",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                top: -25,
                                right: -20,
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.15)",
                                filter: "blur(14px)",
                            }}
                        />

                        <Box
                            sx={{
                                position: "relative",
                                zIndex: 2,
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                gap: 1.5,
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 1.3, minWidth: 0 }}>
                                <Box
                                    sx={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: "15px",
                                        display: "grid",
                                        placeItems: "center",
                                        background: "rgba(255,255,255,0.18)",
                                        border: "1px solid rgba(255,255,255,0.24)",
                                        animation: "chatbotFloat 3s infinite ease-in-out",
                                        flexShrink: 0,
                                    }}
                                >
                                    <SmartToyRoundedIcon sx={{ fontSize: 24 }} />
                                </Box>

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 950,
                                            fontSize: { xs: "1.08rem", sm: "1.2rem" },
                                            lineHeight: 1.1,
                                            mb: 0.35,
                                        }}
                                    >
                                        Course Assistant 🤖
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "0.85rem",
                                            opacity: 0.92,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Ask anything about this course
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "0.76rem",
                                            opacity: 0.8,
                                            mt: 0.45,
                                        }}
                                    >
                                        {lectureTitle || "Current lesson"} • {nowLabel}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.35,
                                    flexShrink: 0,
                                }}
                            >
                                <Tooltip title="Refresh chat">
                                    <IconButton
                                        onClick={handleRefreshChat}
                                        size="small"
                                        sx={{
                                            color: "#fff",
                                            background: "rgba(255,255,255,0.1)",
                                            "&:hover": {
                                                background: "rgba(255,255,255,0.18)",
                                            },
                                        }}
                                    >
                                        <RefreshRoundedIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={fullscreen ? "Restore" : "Expand"}>
                                    <IconButton
                                        onClick={() => setFullscreen((prev) => !prev)}
                                        size="small"
                                        sx={{
                                            color: "#fff",
                                            background: "rgba(255,255,255,0.1)",
                                            "&:hover": {
                                                background: "rgba(255,255,255,0.18)",
                                            },
                                        }}
                                    >
                                        {fullscreen ? (
                                            <CloseFullscreenRoundedIcon sx={{ fontSize: 19 }} />
                                        ) : (
                                            <OpenInFullRoundedIcon sx={{ fontSize: 19 }} />
                                        )}
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title={minimized ? "Restore" : "Minimize"}>
                                    <IconButton
                                        onClick={() => setMinimized((prev) => !prev)}
                                        size="small"
                                        sx={{
                                            color: "#fff",
                                            background: "rgba(255,255,255,0.1)",
                                            "&:hover": {
                                                background: "rgba(255,255,255,0.18)",
                                            },
                                        }}
                                    >
                                        <RemoveRoundedIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Close">
                                    <IconButton
                                        onClick={() => {
                                            setOpen(false);
                                            setMinimized(false);
                                            setFullscreen(false);
                                        }}
                                        size="small"
                                        sx={{
                                            color: "#fff",
                                            background: "rgba(255,255,255,0.1)",
                                            "&:hover": {
                                                background: "rgba(255,255,255,0.18)",
                                            },
                                        }}
                                    >
                                        <CloseRoundedIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>

                    {!minimized && (
                        <>
                            {/* Suggestions row */}
                            <Box
                                sx={{
                                    px: 2,
                                    pt: 1.5,
                                    pb: 1.2,
                                    position: "relative",
                                    zIndex: 2,
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 1,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    {QUICK_PROMPTS.slice(0, fullscreen ? 4 : 3).map((prompt) => (
                                        <Chip
                                            key={prompt}
                                            icon={<AutoAwesomeRoundedIcon />}
                                            label={prompt}
                                            onClick={() => handleQuickPrompt(prompt)}
                                            clickable
                                            sx={{
                                                borderRadius: "999px",
                                                fontWeight: 800,
                                                background: "rgba(255,255,255,0.88)",
                                                border: "1px solid rgba(15,23,42,0.08)",
                                                boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
                                                "& .MuiChip-icon": {
                                                    color: "#7C3AED",
                                                },
                                                "&:hover": {
                                                    background: "rgba(124,58,237,0.08)",
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            <Divider sx={{ borderColor: "rgba(15,23,42,0.05)" }} />

                            {/* Messages */}
                            <Box
                                sx={{
                                    flex: 1,
                                    position: "relative",
                                    zIndex: 2,
                                    overflowY: "auto",
                                    px: 2,
                                    py: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.6,
                                }}
                            >
                                {messages.length === 0 ? (
                                    <EmptyState onPromptClick={handleQuickPrompt} />
                                ) : (
                                    <>
                                        {messages.map((msg) => {
                                            const isUser = msg.role === "user";

                                            return (
                                                <Box
                                                    key={msg.id}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: isUser
                                                            ? "flex-end"
                                                            : "flex-start",
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "flex-end",
                                                            gap: 1,
                                                            maxWidth: fullscreen
                                                                ? "75%"
                                                                : "82%",
                                                            flexDirection: isUser
                                                                ? "row-reverse"
                                                                : "row",
                                                        }}
                                                    >
                                                        {!isUser && (
                                                            <Box
                                                                sx={{
                                                                    width: 34,
                                                                    height: 34,
                                                                    borderRadius: "12px",
                                                                    display: "grid",
                                                                    placeItems: "center",
                                                                    background:
                                                                        "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.10))",
                                                                    border:
                                                                        "1px solid rgba(34,197,94,0.18)",
                                                                    color: "#7C3AED",
                                                                    flexShrink: 0,
                                                                    mb: 0.3,
                                                                }}
                                                            >
                                                                <SmartToyRoundedIcon
                                                                    sx={{ fontSize: 19 }}
                                                                />
                                                            </Box>
                                                        )}

                                                        <Box>
                                                            <Box
                                                                sx={{
                                                                    px: 2,
                                                                    py: 1.5,
                                                                    borderRadius: isUser
                                                                        ? "20px 20px 8px 20px"
                                                                        : "20px 20px 20px 8px",
                                                                    fontSize: "0.98rem",
                                                                    lineHeight: 1.7,
                                                                    whiteSpace: "pre-wrap",
                                                                    wordBreak: "break-word",
                                                                    color: isUser
                                                                        ? "#fff"
                                                                        : "#111827",
                                                                    background: isUser
                                                                        ? "linear-gradient(135deg,#7C3AED,#8B5CF6)"
                                                                        : "rgba(255,255,255,0.94)",
                                                                    border: isUser
                                                                        ? "none"
                                                                        : "1px solid rgba(15,23,42,0.06)",
                                                                    boxShadow: isUser
                                                                        ? "0 10px 28px rgba(124,58,237,0.35)"
                                                                        : "0 10px 24px rgba(15,23,42,0.06)",
                                                                }}
                                                            >
                                                                {msg.text}
                                                            </Box>

                                                            <Typography
                                                                sx={{
                                                                    mt: 0.5,
                                                                    px: 0.5,
                                                                    fontSize: "0.72rem",
                                                                    color: "#94a3b8",
                                                                    textAlign: isUser
                                                                        ? "right"
                                                                        : "left",
                                                                }}
                                                            >
                                                                {msg.time}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            );
                                        })}

                                        {loading && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "flex-start",
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "flex-end",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: "12px",
                                                            display: "grid",
                                                            placeItems: "center",
                                                            background:
                                                                "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(16,185,129,0.10))",
                                                            border:
                                                                "1px solid rgba(34,197,94,0.18)",
                                                            color: "#7C3AED",
                                                            flexShrink: 0,
                                                            mb: 0.3,
                                                        }}
                                                    >
                                                        <SmartToyRoundedIcon
                                                            sx={{ fontSize: 19 }}
                                                        />
                                                    </Box>

                                                    <Box>
                                                        <Box
                                                            sx={{
                                                                px: 1.4,
                                                                py: 1.2,
                                                                borderRadius: "20px 20px 20px 8px",
                                                                background: "rgba(255,255,255,0.94)",
                                                                border:
                                                                    "1px solid rgba(15,23,42,0.06)",
                                                                boxShadow:
                                                                    "0 10px 24px rgba(15,23,42,0.06)",
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <TypingDots />
                                                            <Typography
                                                                sx={{
                                                                    fontSize: "0.88rem",
                                                                    color: "#475569",
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                Thinking...
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        )}

                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </Box>

                            {/* Input area */}
                            <Box
                                sx={{
                                    position: "relative",
                                    zIndex: 2,
                                    p: 1.6,
                                    borderTop: "1px solid rgba(15,23,42,0.05)",
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.92))",
                                    backdropFilter: "blur(12px)",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.1,
                                        p: 0.8,
                                        borderRadius: "22px",
                                        background: "rgba(255,255,255,0.95)",
                                        border: "1px solid rgba(15,23,42,0.08)",
                                        boxShadow: "0 8px 24px rgba(15,23,42,0.05)",
                                    }}
                                >
                                    <TextField
                                        inputRef={inputRef}
                                        fullWidth
                                        size="small"
                                        placeholder="Ask anything..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !loading) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        multiline
                                        maxRows={fullscreen ? 5 : 3}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "16px",
                                                background: "transparent",
                                                "& fieldset": {
                                                    border: "none",
                                                },
                                            },
                                            "& .MuiInputBase-input": {
                                                py: 1.1,
                                                fontSize: "0.98rem",
                                            },
                                        }}
                                    />

                                    <IconButton
                                        onClick={() => sendMessage()}
                                        disabled={loading || !input.trim()}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            color: "#fff",
                                            flexShrink: 0,
                                            background: "linear-gradient(135deg,#7C3AED,#8B5CF6)",
                                            boxShadow: "0 10px 22px rgba(124,58,237,0.35)",
                                            transition: "all .2s ease",
                                            "&:hover": {
                                                transform: "scale(1.05)",
                                                background: "linear-gradient(135deg,#6D28D9,#7C3AED)",
                                            },
                                            "&.Mui-disabled": {
                                                color: "rgba(255,255,255,0.8)",
                                                background: "rgba(148,163,184,0.8)",
                                            },
                                        }}
                                    >
                                        <SendRoundedIcon sx={{ fontSize: 26 }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        </>
                    )}
                </Box>
            </Fade>
        </>
    );
}