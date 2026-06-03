// src/pages/AboutUs.jsx
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    Avatar,
    Stack,
    Chip,
} from "@mui/material";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import EmojiObjectsRoundedIcon from "@mui/icons-material/EmojiObjectsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PlayCircleRoundedIcon from "@mui/icons-material/PlayCircleRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const stats = [
    { value: "10K+", label: "Active Learners" },
    { value: "500+", label: "Premium Courses" },
    { value: "100+", label: "Expert Mentors" },
    { value: "95%", label: "Student Satisfaction" },
];

const features = [
    {
        title: "Practical Learning",
        desc: "Every course is built around real outcomes, useful projects, and skills students can apply in real life.",
        icon: <AutoStoriesRoundedIcon />,
    },
    {
        title: "Expert Mentors",
        desc: "Our mentors bring strong teaching experience and real industry knowledge into every learning journey.",
        icon: <WorkspacePremiumRoundedIcon />,
    },
    {
        title: "Career Growth",
        desc: "We focus on helping students grow with confidence through structured content and smart skill development.",
        icon: <TrendingUpRoundedIcon />,
    },
    {
        title: "Modern Experience",
        desc: "Learnify is designed to feel clean, premium, simple, and motivating from the first click to the last lesson.",
        icon: <EmojiObjectsRoundedIcon />,
    },

    // 🔥 NEW 1
    {
        title: "Interactive Learning",
        desc: "Quizzes, assignments, and real-time feedback keep students engaged and actively learning.",
        icon: <CheckCircleRoundedIcon />,
    },

    // 🔥 NEW 2
    {
        title: "Flexible Access",
        desc: "Learn anytime, anywhere with a fully responsive platform designed for all devices.",
        icon: <PublicRoundedIcon />,
    },
];

const values = [
    {
        title: "Student First",
        desc: "We build every part of Learnify around what actually helps students learn better.",
        icon: <FavoriteRoundedIcon />,
    },
    {
        title: "Growth Mindset",
        desc: "We believe progress comes from consistency, smart practice, and supportive guidance.",
        icon: <RocketLaunchRoundedIcon />,
    },
    {
        title: "Accessible Learning",
        desc: "We want high-quality education to feel clear, welcoming, and easy to use.",
        icon: <PublicRoundedIcon />,
    },
];

const team = [
    {
        name: "Sarah Johnson",
        role: "Lead Mentor",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
        name: "Michael Chen",
        role: "Course Director",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
        name: "Emma Williams",
        role: "Learning Strategist",
        image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
];

function useCountUp(end, duration = 1500) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            },
            { threshold: 0.4 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;

        let start = 0;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [visible, end, duration]);

    return { count, ref };
}

export default function AboutUs() {
    const navigate = useNavigate();
    return (
        <Box
            sx={{
                background:
                    "linear-gradient(180deg, #f7f5ff 0%, #ffffff 38%, #fcfbff 100%)",
                overflow: "hidden",
            }}
        >
            {/* HERO */}
            <Box sx={{ position: "relative", pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
                <Box
                    sx={{
                        position: "absolute",
                        width: 420,
                        height: 420,
                        borderRadius: "50%",
                        background: "rgba(124,108,244,0.18)",
                        filter: "blur(120px)",
                        top: -120,
                        left: -100,
                        zIndex: 0,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        width: 380,
                        height: 380,
                        borderRadius: "50%",
                        background: "rgba(167,139,250,0.18)",
                        filter: "blur(120px)",
                        right: -120,
                        top: 40,
                        zIndex: 0,
                    }}
                />

                <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
                    <Grid container spacing={{ xs: 5, md: 7 }} alignItems="center">
                        <Grid item xs={12} lg={6}>
                            <Chip
                                label="About Learnify"
                                sx={{
                                    mb: 3,
                                    px: 1,
                                    fontWeight: 800,
                                    color: "#6d5dfc",
                                    background: "rgba(109, 93, 252, 0.10)",
                                    border: "1px solid rgba(109,93,252,0.10)",
                                }}
                            />

                            <Typography
                                sx={{
                                    fontWeight: 900,
                                    lineHeight: 1.02,
                                    color: "#0f172a",
                                    fontSize: {
                                        xs: "2.5rem",
                                        sm: "3rem",
                                        md: "4rem",
                                        lg: "4.5rem",
                                    },
                                    letterSpacing: "-0.03em",
                                }}
                            >
                                We build learning
                                <Box
                                    component="span"
                                    sx={{
                                        display: "block",
                                        background: "linear-gradient(135deg, #8b7cff, #6d5dfc)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    that feels modern,
                                </Box>
                                human, and powerful.
                            </Typography>

                            <Typography
                                sx={{
                                    mt: 3,
                                    color: "#667085",
                                    fontSize: { xs: "1rem", md: "1.08rem" },
                                    maxWidth: 660,
                                    lineHeight: 1.9,
                                }}
                            >
                                Learnify is built for students who want more than just videos.
                                We combine premium courses, expert mentors, practical learning,
                                and a polished digital experience that helps people grow with
                                confidence.
                            </Typography>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={2}
                                sx={{ mt: 4 }}
                            >
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<SchoolRoundedIcon />}
                                    onClick={() => navigate("/courses")}
                                    sx={{
                                        borderRadius: "999px",
                                        px: 4,
                                        py: 1.6,
                                        fontWeight: 800,
                                        textTransform: "none",
                                        background: "linear-gradient(135deg, #8b7cff, #6d5dfc)",
                                        boxShadow: "0 16px 40px rgba(109,93,252,0.32)",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #8172ff, #5f51ef)",
                                            boxShadow: "0 20px 46px rgba(109,93,252,0.38)",
                                        },
                                    }}
                                >
                                    Explore Courses
                                </Button>

                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => navigate("/contact")}
                                    startIcon={<PlayCircleRoundedIcon />}
                                    sx={{
                                        borderRadius: "999px",
                                        px: 4,
                                        py: 1.6,
                                        fontWeight: 800,
                                        textTransform: "none",
                                        borderColor: "rgba(109,93,252,0.22)",
                                        color: "#6d5dfc",
                                        background: "rgba(255,255,255,0.62)",
                                        backdropFilter: "blur(10px)",
                                        "&:hover": {
                                            borderColor: "#6d5dfc",
                                            background: "rgba(109,93,252,0.04)",
                                        },
                                    }}
                                >
                                    Contact Us
                                </Button>
                            </Stack>

                            <Grid container spacing={2.2} sx={{ mt: 4 }}>
                                {stats.slice(0, 2).map((item, i) => (
                                    <Grid item xs={6} key={i}>
                                        <Card
                                            sx={{
                                                borderRadius: "22px",
                                                background: "rgba(255,255,255,0.72)",
                                                backdropFilter: "blur(14px)",
                                                border: "1px solid rgba(124,108,244,0.08)",
                                                boxShadow: "0 18px 50px rgba(15,23,42,0.05)",
                                            }}
                                        >
                                            <CardContent sx={{ p: 2.5 }}>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 900,
                                                        fontSize: { xs: "1.5rem", md: "1.8rem" },
                                                        color: "#6d5dfc",
                                                    }}
                                                >
                                                    {item.value}
                                                </Typography>
                                                <Typography color="#667085" fontWeight={500}>
                                                    {item.label}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Grid item xs={12} lg={6}>
                            <Box
                                sx={{
                                    position: "relative",
                                    maxWidth: 680,
                                    mx: "auto",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "absolute",
                                        inset: -16,
                                        borderRadius: "40px",
                                        background:
                                            "linear-gradient(135deg, rgba(139,124,255,.18), rgba(255,255,255,.55))",
                                        filter: "blur(8px)",
                                    }}
                                />
                                <Box
                                    sx={{
                                        position: "relative",
                                        borderRadius: "36px",
                                        overflow: "hidden",
                                        p: 1.5,
                                        background:
                                            "linear-gradient(135deg, rgba(139,124,255,.28), rgba(255,255,255,.85))",
                                        boxShadow: "0 36px 90px rgba(124,108,244,0.18)",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400&auto=format&fit=crop"
                                        alt="About Learnify"
                                        sx={{
                                            width: "100%",
                                            height: { xs: 320, sm: 420, md: 560 },
                                            objectFit: "cover",
                                            borderRadius: "28px",
                                            display: "block",
                                        }}
                                    />

                                    <Card
                                        sx={{
                                            position: "absolute",
                                            bottom: { xs: 18, md: 24 },
                                            left: { xs: 18, md: 24 },
                                            right: { xs: 18, sm: "auto" },
                                            maxWidth: 290,
                                            borderRadius: "22px",
                                            background: "rgba(255,255,255,0.94)",
                                            backdropFilter: "blur(14px)",
                                            boxShadow: "0 18px 40px rgba(16,24,40,.14)",
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                p: "16px !important",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 52,
                                                    height: 52,
                                                    borderRadius: "16px",
                                                    display: "grid",
                                                    placeItems: "center",
                                                    background:
                                                        "linear-gradient(135deg, rgba(139,124,255,.15), rgba(109,93,252,.16))",
                                                    color: "#6d5dfc",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <SchoolRoundedIcon />
                                            </Box>
                                            <Box>
                                                <Typography fontWeight={900} color="#101828">
                                                    Premium Learning
                                                </Typography>
                                                <Typography variant="body2" color="#667085">
                                                    Built for modern students
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        sx={{
                                            position: "absolute",
                                            top: { xs: 18, md: 24 },
                                            right: { xs: 18, md: 24 },
                                            borderRadius: "20px",
                                            background: "rgba(15,23,42,0.86)",
                                            color: "white",
                                            boxShadow: "0 18px 40px rgba(16,24,40,.24)",
                                            display: { xs: "none", sm: "block" },
                                        }}
                                    >
                                        <CardContent sx={{ p: "16px !important" }}>
                                            <Typography fontSize=".9rem" sx={{ opacity: 0.76 }}>
                                                Trusted by
                                            </Typography>
                                            <Typography fontWeight={900} fontSize="1.25rem">
                                                10,000+ learners
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* STATS */}
            <Box
                sx={{
                    position: "relative",
                    py: { xs: 10, md: 14 },
                    background: "linear-gradient(180deg, #fcfbff 0%, #f7f5ff 100%)",
                    overflow: "hidden",
                }}
            >
                {/* 🔥 Soft glow */}
                <Box
                    sx={{
                        position: "absolute",
                        width: 320,
                        height: 320,
                        borderRadius: "50%",
                        background: "rgba(124,108,244,0.15)",
                        filter: "blur(100px)",
                        top: -80,
                        left: -80,
                    }}
                />

                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                    {/* HEADER */}
                    <Box textAlign="center" mb={{ xs: 6, md: 8 }}>
                        <Chip
                            label="Our Impact"
                            sx={{
                                mb: 2,
                                fontWeight: 800,
                                color: "#6d5dfc",
                                background: "rgba(109,93,252,0.10)",
                                border: "1px solid rgba(109,93,252,0.15)",
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: { xs: "2rem", md: "2.8rem" },
                                fontWeight: 900,
                                color: "#0f172a",
                                lineHeight: 1.1,
                            }}
                        >
                            Trusted by thousands of learners worldwide
                        </Typography>

                        <Typography
                            sx={{
                                color: "#667085",
                                maxWidth: 600,
                                mx: "auto",
                                mt: 2,
                                lineHeight: 1.8,
                            }}
                        >
                            Our platform continues to grow with students, mentors, and
                            courses designed to create real impact in learning journeys.
                        </Typography>
                    </Box>

                    {/* CARDS */}
                    <Grid container spacing={4} justifyContent="center">
                        {stats.map((item, i) => {
                            const numericValue = parseInt(item.value);
                            const { count, ref } = useCountUp(numericValue);

                            return (
                                <Grid
                                    item
                                    xs={6}
                                    sm={6}
                                    md={3}
                                    key={i}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Card
                                        ref={ref}
                                        sx={{
                                            width: "100%",
                                            maxWidth: 200,
                                            height: 160,

                                            borderRadius: "24px",
                                            textAlign: "center",

                                            background:
                                                i === 0
                                                    ? "linear-gradient(135deg, #8b7cff, #6d5dfc)"
                                                    : "white",

                                            color: i === 0 ? "white" : "inherit",

                                            border: "1px solid rgba(124,108,244,0.08)",

                                            boxShadow:
                                                i === 0
                                                    ? "0 20px 60px rgba(124,108,244,0.25)"
                                                    : "0 15px 40px rgba(17,24,39,0.05)",

                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",

                                            transition: "all .35s ease",

                                            "&:hover": {
                                                transform: "translateY(-8px) scale(1.04)",
                                                boxShadow:
                                                    i === 0
                                                        ? "0 25px 70px rgba(124,108,244,0.35)"
                                                        : "0 25px 60px rgba(17,24,39,0.08)",
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 2 }}>
                                            <Typography
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: { xs: "1.7rem", md: "2.3rem" },
                                                    mb: 0.5,
                                                }}
                                            >
                                                {count}
                                                {item.value.includes("+") && "+"}
                                                {item.value.includes("%") && "%"}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontSize: "0.9rem",
                                                    fontWeight: 600,
                                                    opacity: i === 0 ? 0.9 : 1,
                                                }}
                                            >
                                                {item.label}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Container>
            </Box>

            {/* STORY + MISSION FINAL PREMIUM */}
            <Box
                sx={{
                    py: { xs: 10, md: 14 },
                    background: "linear-gradient(180deg, #ffffff 0%, #f5f3ff 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* 🔥 background glow */}
                <Box
                    sx={{
                        position: "absolute",
                        width: 500,
                        height: 500,
                        borderRadius: "50%",
                        background: "rgba(124,108,244,0.18)",
                        filter: "blur(140px)",
                        bottom: -150,
                        right: -120,
                    }}
                />

                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                    <Grid container spacing={6} alignItems="center">

                        {/* 🔥 LEFT CONTENT */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ pr: { md: 4 } }}>

                                <Chip
                                    label="Our Story"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 800,
                                        color: "#6d5dfc",
                                        background: "rgba(109,93,252,0.10)",
                                    }}
                                />

                                <Typography
                                    sx={{
                                        fontSize: { xs: "2rem", md: "3rem" },
                                        fontWeight: 900,
                                        lineHeight: 1.1,
                                        color: "#0f172a",
                                        mb: 2,
                                    }}
                                >
                                    Learning should feel inspiring,
                                    not overwhelming.
                                </Typography>

                                <Typography
                                    sx={{
                                        color: "#667085",
                                        fontSize: "1.05rem",
                                        lineHeight: 1.9,
                                        mb: 3,
                                    }}
                                >
                                    Learnify transforms digital learning into a premium experience —
                                    combining mentorship, real-world skills, and a beautifully designed journey.
                                </Typography>

                                {/* 🔥 bullets */}
                                <Stack spacing={2}>
                                    {[
                                        "Clean and intuitive learning experience",
                                        "Real-world focused courses",
                                        "Mentor-guided journey",
                                        "Premium quality you can trust",
                                    ].map((item, i) => (
                                        <Stack key={i} direction="row" spacing={1.5} alignItems="center">
                                            <CheckCircleRoundedIcon sx={{ color: "#7c6cf4" }} />
                                            <Typography sx={{ color: "#475467" }}>{item}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>

                            </Box>
                        </Grid>

                        {/* 🔥 RIGHT IMAGE */}
                        <Grid item xs={12} md={6}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "flex-end", // 🔥 push to right
                                    width: "100%",
                                }}
                            >
                                <Box
                                    sx={{
                                        position: "relative",
                                        width: { xs: "100%", md: "95%" },
                                    }}
                                >
                                    {/* 🔥 main image */}
                                    <Box
                                        component="img"
                                        src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1400&auto=format&fit=crop"
                                        alt="Students Learning"
                                        sx={{
                                            width: "100%",
                                            height: { xs: 300, md: 460 },
                                            objectFit: "cover",
                                            borderRadius: "30px",
                                            boxShadow: "0 30px 80px rgba(0,0,0,0.18)",
                                            transition: "all .4s ease",

                                            "&:hover": {
                                                transform: "scale(1.03)",
                                            },
                                        }}
                                    />

                                    {/* 🔥 mission overlay */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            bottom: 20,
                                            left: 20,
                                            right: 20,
                                            borderRadius: "20px",
                                            p: 2.5,

                                            background: "rgba(15,16,32,0.85)",
                                            backdropFilter: "blur(10px)",
                                            color: "white",

                                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                                        }}
                                    >
                                        <Typography fontWeight={800} fontSize="0.9rem">
                                            Our Mission
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.85rem", opacity: 0.8 }}>
                                            Helping every student grow with clarity & confidence.
                                        </Typography>
                                    </Box>

                                    {/* 🔥 floating badge */}
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: -15,
                                            right: -10,
                                            borderRadius: "16px",
                                            px: 2,
                                            py: 1,

                                            background: "rgba(255,255,255,0.95)",
                                            backdropFilter: "blur(10px)",

                                            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                                        }}
                                    >
                                        <Typography fontWeight={800} color="#6d5dfc">
                                            Learnify
                                        </Typography>
                                        <Typography fontSize="0.75rem" color="#667085">
                                            Premium Learning
                                        </Typography>
                                    </Box>

                                </Box>
                            </Box>
                        </Grid>

                    </Grid>
                </Container>
            </Box>

            

            {/* VALUES */}
            <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
                <Box textAlign="center" mb={{ xs: 5, md: 7 }}>
                    <Chip
                        label="Our Values"
                        sx={{
                            mb: 2,
                            fontWeight: 800,
                            color: "#6d5dfc",
                            background: "rgba(109,93,252,0.10)",
                            border: "1px solid rgba(109,93,252,0.15)",
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: { xs: "2rem", md: "3rem" },
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.1,
                        }}
                    >
                        What shapes the Learnify experience
                    </Typography>

                    <Typography
                        sx={{
                            color: "#667085",
                            maxWidth: 720,
                            mx: "auto",
                            mt: 2,
                            lineHeight: 1.8,
                        }}
                    >
                        Our values influence how we design courses, support students, and build
                        a platform that feels more thoughtful, modern, and useful.
                    </Typography>
                </Box>

                {/* 🔥 FIXED GRID */}
                <Grid
                    container
                    spacing={3}
                    justifyContent="center"
                >
                    {values.map((item, i) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}   // ✅ KEY CHANGE
                            key={i}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Card
                                sx={{
                                    width: "100%",
                                    maxWidth: 320, // ✅ VERY IMPORTANT (fixes ugly stretch)
                                    borderRadius: "24px",
                                    background: "white",
                                    border: "1px solid rgba(124,108,244,0.08)",
                                    boxShadow: "0 18px 40px rgba(17,24,39,0.05)",
                                    transition: "all 0.3s ease",

                                    "&:hover": {
                                        transform: "translateY(-8px)",
                                        boxShadow: "0 25px 60px rgba(17,24,39,0.08)",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box
                                        sx={{
                                            width: 55,
                                            height: 55,
                                            borderRadius: "16px",
                                            display: "grid",
                                            placeItems: "center",
                                            mb: 2,
                                            color: "#6d5dfc",
                                            background:
                                                "linear-gradient(135deg, rgba(139,124,255,.15), rgba(109,93,252,.10))",
                                        }}
                                    >
                                        {item.icon}
                                    </Box>

                                    <Typography
                                        sx={{
                                            fontSize: "1.2rem",
                                            fontWeight: 800,
                                            color: "#0f172a",
                                            mb: 1,
                                        }}
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#667085",
                                            fontSize: "0.95rem",
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {item.desc}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* FEATURES */}
            <Box
                sx={{
                    background: "linear-gradient(180deg, #0f1017 0%, #11131b 100%)",
                    py: { xs: 8, md: 12 },
                    mt: { xs: 6, md: 8 },
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Glow */}
                <Box
                    sx={{
                        position: "absolute",
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: "rgba(124,108,244,0.18)",
                        filter: "blur(120px)",
                        top: -120,
                        right: -80,
                    }}
                />

                <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
                    {/* HEADER */}
                    <Box textAlign="center" mb={8}>
                        <Chip
                            label="Why Students Choose Us"
                            sx={{
                                mb: 2,
                                fontWeight: 800,
                                color: "#c9c2ff",
                                background: "rgba(255,255,255,0.08)",
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: { xs: "2rem", md: "3rem" },
                                fontWeight: 900,
                                color: "white",
                                lineHeight: 1.1,
                            }}
                        >
                            Built to make learning feel exciting and valuable
                        </Typography>

                        <Typography
                            sx={{
                                color: "rgba(255,255,255,0.72)",
                                maxWidth: 700,
                                mx: "auto",
                                mt: 2,
                                lineHeight: 1.8,
                            }}
                        >
                            Every part of Learnify is designed to help students stay engaged,
                            understand better, and grow through a modern learning journey.
                        </Typography>
                    </Box>

                    {/* ✅ CLEAN GRID */}
                    <Grid
                        container
                        spacing={4}
                        justifyContent="center"
                    >
                        {features.map((item, i) => (
                            <Grid
                                item
                                xs={12}
                                sm={6}
                                md={6}
                                lg={3} // 🔥 4 in row on desktop
                                key={i}
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                }}
                            >
                                <Card
                                    sx={{
                                        width: "100%",
                                        maxWidth: 280, // ✅ SAME SIZE FOR ALL
                                        height: 260,   // ✅ FIXED HEIGHT (VERY IMPORTANT)

                                        borderRadius: "24px",
                                        background:
                                            i === 1
                                                ? "linear-gradient(135deg, #9587ff, #7868ff)"
                                                : "rgba(255,255,255,0.05)",
                                        color: "white",

                                        border: "1px solid rgba(255,255,255,0.08)",
                                        boxShadow:
                                            i === 1
                                                ? "0 25px 70px rgba(124,108,244,0.35)"
                                                : "0 10px 30px rgba(0,0,0,0.25)",

                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",

                                        transition: "all .35s ease",

                                        "&:hover": {
                                            transform: "translateY(-8px)",
                                            boxShadow:
                                                i === 1
                                                    ? "0 30px 80px rgba(124,108,244,0.4)"
                                                    : "0 20px 50px rgba(0,0,0,0.35)",
                                        },
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box
                                            sx={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: "14px",
                                                display: "grid",
                                                placeItems: "center",
                                                mb: 2,
                                                background: "rgba(255,255,255,0.12)",
                                            }}
                                        >
                                            {item.icon}
                                        </Box>

                                        <Typography
                                            sx={{
                                                fontSize: "1.1rem",
                                                fontWeight: 800,
                                                mb: 1,
                                            }}
                                        >
                                            {item.title}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                opacity: 0.8,
                                                fontSize: "0.9rem",
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {item.desc}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* TEAM */}
            <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
                <Box textAlign="center" mb={8}>
                    <Chip
                        label="Meet Our Team"
                        sx={{
                            mb: 2,
                            fontWeight: 800,
                            color: "#6d5dfc",
                            background: "rgba(109,93,252,0.10)",
                            border: "1px solid rgba(109,93,252,0.15)",
                        }}
                    />

                    <Typography
                        sx={{
                            fontSize: { xs: "2rem", md: "3rem" },
                            fontWeight: 900,
                            color: "#0f172a",
                            lineHeight: 1.1,
                        }}
                    >
                        The people behind Learnify
                    </Typography>

                    <Typography
                        sx={{
                            color: "#667085",
                            maxWidth: 700,
                            mx: "auto",
                            mt: 2,
                            lineHeight: 1.8,
                        }}
                    >
                        Our team is focused on building a more inspiring, more effective, and
                        more student-centered learning experience.
                    </Typography>
                </Box>

                {/* 🔥 FIXED GRID */}
                <Grid container spacing={4} justifyContent="center">
                    {team.map((member, i) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={i}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Card
                                sx={{
                                    width: "100%",
                                    maxWidth: 280,        // ✅ SAME WIDTH
                                    height: 320,          // ✅ SAME HEIGHT

                                    borderRadius: "26px",
                                    textAlign: "center",

                                    background:
                                        i === 1
                                            ? "linear-gradient(135deg, #8b7cff, #6d5dfc)"
                                            : "white",

                                    color: i === 1 ? "white" : "inherit",

                                    border: "1px solid rgba(124,108,244,0.08)",

                                    boxShadow:
                                        i === 1
                                            ? "0 25px 70px rgba(124,108,244,0.25)"
                                            : "0 18px 50px rgba(17,24,39,0.05)",

                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",

                                    transition: "all .35s ease",

                                    "&:hover": {
                                        transform: "translateY(-10px) scale(1.02)",
                                        boxShadow:
                                            i === 1
                                                ? "0 30px 80px rgba(124,108,244,0.35)"
                                                : "0 25px 60px rgba(17,24,39,0.08)",
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Avatar
                                        src={member.image}
                                        alt={member.name}
                                        sx={{
                                            width: 90,
                                            height: 90,
                                            mx: "auto",
                                            mb: 2,

                                            border: i === 1
                                                ? "3px solid rgba(255,255,255,0.5)"
                                                : "3px solid rgba(124,108,244,0.15)",

                                            boxShadow:
                                                i === 1
                                                    ? "0 10px 25px rgba(0,0,0,0.2)"
                                                    : "0 12px 30px rgba(124,108,244,0.18)",
                                        }}
                                    />

                                    <Typography
                                        sx={{
                                            fontSize: "1.15rem",
                                            fontWeight: 900,
                                            color: i === 1 ? "white" : "#101828",
                                        }}
                                    >
                                        {member.name}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            mb: 1.2,
                                            color: i === 1 ? "#e0dbff" : "#7c6cf4",
                                        }}
                                    >
                                        {member.role}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontSize: "0.9rem",
                                            lineHeight: 1.6,
                                            color: i === 1
                                                ? "rgba(255,255,255,0.85)"
                                                : "#667085",
                                        }}
                                    >
                                        Passionate about helping students learn better through
                                        clarity, structure, and strong educational design.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* CTA */}
            <Container maxWidth="lg" sx={{ pb: { xs: 8, md: 12 } }}>
                <Card
                    sx={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: "36px",
                        background: "linear-gradient(135deg, #978aff 0%, #7464ff 100%)",
                        color: "white",
                        boxShadow: "0 30px 80px rgba(116,100,255,0.25)",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            width: 300,
                            height: 300,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.14)",
                            filter: "blur(80px)",
                            top: -100,
                            right: -80,
                        }}
                    />
                    <CardContent
                        sx={{
                            position: "relative",
                            zIndex: 1,
                            p: { xs: 4, md: 7 },
                            textAlign: "center",
                        }}
                    >
                        <Chip
                            label="Start Today"
                            sx={{
                                mb: 2.2,
                                fontWeight: 800,
                                color: "white",
                                background: "rgba(255,255,255,0.14)",
                            }}
                        />
                        <Typography
                            sx={{
                                fontSize: { xs: "2rem", md: "3.2rem" },
                                fontWeight: 900,
                                lineHeight: 1.08,
                                mb: 2,
                            }}
                        >
                            Ready to start your learning journey?
                        </Typography>
                        <Typography
                            sx={{
                                opacity: 0.92,
                                maxWidth: 760,
                                mx: "auto",
                                mb: 4,
                                lineHeight: 1.85,
                            }}
                        >
                            Discover premium courses, expert mentors, practical learning, and
                            a smarter way to build your skills with confidence.
                        </Typography>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            justifyContent="center"
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate("/courses")}
                                sx={{
                                    borderRadius: "999px",
                                    px: 4.5,
                                    py: 1.6,
                                    fontWeight: 800,
                                    textTransform: "none",
                                    backgroundColor: "white",
                                    color: "#6d5dfc",
                                    boxShadow: "none",
                                    "&:hover": {
                                        backgroundColor: "#f5f3ff",
                                        boxShadow: "none",
                                    },
                                }}
                            >
                                Browse Courses
                            </Button>

                            <Button
                                variant="outlined"
                                size="large"
                                onClick={() => navigate("/contact")}
                                sx={{
                                    borderRadius: "999px",
                                    px: 4.5,
                                    py: 1.6,
                                    fontWeight: 800,
                                    textTransform: "none",
                                    borderColor: "rgba(255,255,255,0.35)",
                                    color: "white",
                                    "&:hover": {
                                        borderColor: "white",
                                        background: "rgba(255,255,255,0.08)",
                                    },
                                }}
                            >
                                Contact Our Team
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>

            <Footer />
        </Box>
    );
}