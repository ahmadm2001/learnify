// src/components/Testimonials.jsx
import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Container,
    Paper,
    Avatar,
    Typography,
    Stack,
    Rating,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

export default function Testimonials({
    title = "What students say about skillz",
    subtitle = "Discover the impact of skillz—learn from real student experiences; their success is the proof. Their stories are our pride. Your journey starts right here: skills that shape the future, voices that speak truth.",
    items = [
        {
            name: "Ronald Richards",
            role: "Data Analyst",
            quote:
                "As a student, I found this e-learning platform incredibly user-friendly and intuitive. The course content is well-organized, engaging & easy to follow. The interactive features make learning enjoyable.",
            avatar:
                "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=256&auto=format&fit=crop",
            rating: 5,
        },
        {
            name: "Annette Black",
            role: "Product Admin",
            quote:
                "This platform is really easy to use and the lessons are clearly structured. I love how interactive the courses are — they keep me interested and make it easier to remember what I’ve learned.",
            avatar:
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
            rating: 5,
        },
        {
            name: "Cody Fisher",
            role: "User Interface Developer",
            quote:
                "Being a student, I truly appreciate how smooth and accessible this e-learning platform is. The layout is clear, the content engaging, and the interactive tools really support my learning process.",
            avatar:
                "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=256&auto=format&fit=crop",
            rating: 5,
        },
        {
            name: "Ronald Richards",
            role: "Data Analyst",
            quote:
                "As a student, I found this e-learning platform incredibly user-friendly and intuitive. The course content is well-organized, engaging & easy to follow. The interactive features make learning enjoyable.",
            avatar:
                "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=256&auto=format&fit=crop",
            rating: 5,
        },
        {
            name: "Annette Black",
            role: "Product Admin",
            quote:
                "This platform is really easy to use and the lessons are clearly structured. I love how interactive the courses are — they keep me interested and make it easier to remember what I’ve learned.",
            avatar:
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
            rating: 5,
        },
        {
            name: "Cody Fisher",
            role: "User Interface Developer",
            quote:
                "Being a student, I truly appreciate how smooth and accessible this e-learning platform is. The layout is clear, the content is engaging, and the interactive tools really support my learning process.",
            avatar:
                "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=256&auto=format&fit=crop",
            rating: 5,
        },
    ],
}) {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));          // <600
    const isSm = useMediaQuery(theme.breakpoints.between("sm", "md")); // 600–900

    const cardsPerPage = isXs ? 1 : isSm ? 2 : 3;
    const totalPages = items.length
        ? Math.ceil(items.length / cardsPerPage)
        : 0;

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [activePage, setActivePage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const sliderRef = useRef(null);

    // Auto slider every 2 seconds (per PAGE)
    useEffect(() => {
        if (isPaused || totalPages <= 1) return;

        const interval = setInterval(() => {
            setActivePage((prev) => (prev + 1) % totalPages);
        }, 3000);

        return () => clearInterval(interval);
    }, [isPaused, totalPages]);

    // Scroll the first card of the active page into view
    useEffect(() => {
        const container = sliderRef.current;
        if (!container || totalPages === 0) return;

        const firstIndex = activePage * cardsPerPage;
        const card = container.querySelector(
            `[data-card-index="${firstIndex}"]`
        );
        if (!card) return;

        const cardRect = card.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const offset =
            card.offsetLeft -
            (containerRect.width / 2 - cardRect.width / 2);

        container.scrollTo({ left: offset, behavior: "smooth" });
    }, [activePage, cardsPerPage, totalPages]);

    return (
        <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 10 } }}>
            <Container maxWidth="lg">
                {/* ===== Heading ===== */}
                <MotionBox
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    viewport={{ once: true }}
                    sx={{ textAlign: "center", mb: { xs: 5, md: 6 } }}
                >
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 900,
                            fontSize: { xs: 30, sm: 38, md: 48 },
                            mb: 1.5,
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            maxWidth: 900,
                            mx: "auto",
                            color: "text.secondary",
                            fontSize: { xs: 14, md: 15 },
                            lineHeight: 1.6,
                        }}
                    >
                        {subtitle}
                    </Typography>
                </MotionBox>

                {/* ===== Cards Row ===== */}
                <Box
                    ref={sliderRef}
                    sx={{
                        display: "flex",
                        overflowX: "auto",
                        gap: 3,
                        scrollSnapType: "x mandatory",
                        "&::-webkit-scrollbar": { display: "none" },
                    }}
                >
                    {items.map((t, i) => {
                        const isHovered = hoveredIndex === i;
                        const someoneHovered = hoveredIndex !== null;
                        const dim = someoneHovered && !isHovered;

                        return (
                            <MotionPaper
                                key={i}
                                data-card-index={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.03,
                                    boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
                                }}
                                elevation={0}
                                onMouseEnter={() => {
                                    setHoveredIndex(i);
                                    setIsPaused(true);
                                }}
                                onMouseLeave={() => {
                                    setHoveredIndex(null);
                                    setIsPaused(false);
                                }}
                                sx={{
                                    flex: "0 0 360px",
                                    minHeight: 260,
                                    maxWidth: 360,
                                    p: 3,
                                    borderRadius: 2,
                                    border: "1px solid #e5e7eb",
                                    scrollSnapAlign: "center",
                                    transition: "0.25s ease",
                                    opacity: dim ? 0.4 : 1,
                                    filter: dim ? "blur(1.5px)" : "none",
                                    backgroundColor: "#fff",
                                }}
                            >
                                {/* TOP: Avatar + Name + Role */}
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{ mb: 1 }}
                                >
                                    <Avatar
                                        src={t.avatar}
                                        alt={t.name}
                                        sx={{ width: 56, height: 56, borderRadius: 2 }}
                                    />
                                    <Box sx={{ lineHeight: 1.1 }}>
                                        <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                                            {t.name}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: 13,
                                                mt: 0.3,
                                            }}
                                        >
                                            {t.role}
                                        </Typography>
                                    </Box>
                                </Stack>

                                {/* ⭐ Rating */}
                                <Rating
                                    value={t.rating}
                                    readOnly
                                    size="small"
                                    sx={{
                                        color: "#fbbf24",
                                        mt: 0.3,
                                        mb: 1,
                                        "& .MuiRating-icon": { fontSize: 20 },
                                    }}
                                />

                                {/* Quote */}
                                <Typography
                                    sx={{
                                        color: "text.primary",
                                        fontSize: 14.5,
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {t.quote}
                                </Typography>
                            </MotionPaper>
                        );
                    })}
                </Box>

                {/* ===== Slider Dots (per PAGE, not per card) ===== */}
                {totalPages > 1 && (
                    <Box
                        sx={{
                            mt: 4,
                            display: "flex",
                            justifyContent: "center",
                            gap: 1.5,
                        }}
                    >
                        {Array.from({ length: totalPages }).map((_, i) => {
                            const active = activePage === i;
                            return (
                                <MotionBox
                                    key={i}
                                    onClick={() => setActivePage(i)}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.8 }}
                                    sx={{
                                        width: active ? 14 : 10,
                                        height: active ? 14 : 10,
                                        borderRadius: "50%",
                                        bgcolor: active ? "#111827" : "#a1a1aa",
                                        cursor: "pointer",
                                        transition: "0.25s ease",
                                    }}
                                />
                            );
                        })}
                    </Box>
                )}
            </Container>
        </Box>
    );
}
