// src/pages/Home.jsx
import Swal from "sweetalert2";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import FlagCircleOutlinedIcon from "@mui/icons-material/FlagCircleOutlined";
import { InputBase } from "@mui/material";
import Footer from "../components/Footer";
import Testimonials from "../components/Testimonials";
import WhyBest from "../components/WhyBest";
import React, { useState } from "react";
import API from "../lib/api";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Stack,
  Avatar,
  Chip,
  Paper,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

import StudentHero from "../assets/hero-student.png";
import GoogleIcon from "../assets/google.png";
import UdemyIcon from "../assets/udemy.png";
import SlackIcon from "../assets/slack.png";
import HarvardIcon from "../assets/harvard.png";
import SkillshareIcon from "../assets/skillshare.png";
import MembershipBg from "../assets/bannar.png"; // background image

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

// 🔹 Simple color system for the whole page
const COLORS = {
  pageBg: "#F5F3FF",
  surface: "#FFFFFF",
  primary: "#9E82F7",
  primaryDark: "#6C5DD3",
  primarySoft: "#F1EEFF",
  trustBg: "#F1EEFF",
  darkSection: "#0D0D0D",
  textMain: "#0F172A",
  textMuted: "#6B7280",
  accentBlueBg: "#E0F2FE",
  accentBlueText: "#0284C7",
  accentRedBg: "#FEE2E2",
  accentRedText: "#DC2626",
};

export default function Home() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const scrollRef = React.useRef(null);

  const logos = [
    { src: GoogleIcon, alt: "Google" },
    { src: UdemyIcon, alt: "Udemy" },
    { src: SlackIcon, alt: "Slack" },
    { src: HarvardIcon, alt: "Harvard" },
    { src: SkillshareIcon, alt: "Skillshare" },
  ];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true); // ✅ START LOADING

      await API.post("/api/subscribe/", { email });

      Swal.fire({
        title: "Success 🎉",
        text: "Check your email for confirmation 📩",
        icon: "success",
      });

      setEmail("");
    } catch (err) {
      console.error(err);
      Swal.fire("Error ❌", "Subscription failed", "error");
    } finally {
      setLoading(false); // ✅ STOP LOADING
    }
  };

  const scrollByDir = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.7);
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <Box sx={{ bgcolor: COLORS.pageBg, overflowX: "hidden" }}>
      {/* ===== HERO (2 COLUMN PERFECT RESPONSIVE) ===== */}
      <Box
        sx={{
          bgcolor: COLORS.surface,
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          overflowX: "hidden",
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            minHeight: { xs: "auto", md: 650, lg: 700 },
            py: { xs: 6, md: 8, lg: 10 },
            display: "flex",
            alignItems: "center",
          }}
        >
          <Grid
            container
            alignItems="center"
            spacing={{ xs: 4, sm: 3, md: 3, lg: 6 }} // 🔥 balanced spacing
          >
            {/* ================= LEFT ================= */}
            <Grid item xs={12} sm={6}>
              <MotionBox
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                sx={{
                  textAlign: { xs: "center", sm: "left" },

                  // 🔥 VERY IMPORTANT FOR TABLET BALANCE
                  maxWidth: { xs: "100%", sm: 360, md: 420, lg: 560 },
                  mx: { xs: "auto", sm: 0 },
                }}
              >
                <Typography
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.15,
                    color: COLORS.textMain,
                    letterSpacing: "-.02em",
                    mb: { xs: 2, md: 2.5 },

                    // 🔥 PERFECT SCALING
                    fontSize: {
                      xs: "2rem",
                      sm: "2.2rem",   // 👈 FIX FOR iPad Mini
                      md: "2.6rem",
                      lg: "3.6rem",
                    },
                  }}
                >
                  Let&apos;s Learn New
                  <br />
                  <Box component="span" sx={{ color: COLORS.primary }}>
                    Course &amp; Gain
                  </Box>
                  <br />
                  More Skills
                </Typography>

                <Typography
                  sx={{
                    color: COLORS.textMuted,
                    fontSize: { xs: "0.95rem", sm: "0.95rem", md: "1rem", lg: "1.05rem" },
                    mb: 4,
                  }}
                >
                  A learning platform based on practical knowledge with the best
                  &amp; world-class mentors.
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={3}
                  alignItems="center"
                  justifyContent={{ xs: "center", sm: "flex-start" }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate("/student/courses")} // ✅ ADD THIS
                    sx={{
                      px: 4,
                      py: 1.4,
                      borderRadius: 999,
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: COLORS.primary,
                      ":hover": { bgcolor: COLORS.primaryDark },
                      width: { xs: "100%", sm: "auto" },
                      maxWidth: { xs: 260, sm: "none" },
                    }}
                  >
                    Enroll Now
                  </Button>
                </Stack>
              </MotionBox>
            </Grid>

            {/* ================= RIGHT ================= */}
            <Grid item xs={12} sm={6}>
              <MotionBox
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                sx={{
                  position: "relative",
                  width: "100%",
                  display: "flex",

                  // 🔥 CENTER on tablet, RIGHT on desktop
                  justifyContent: {
                    xs: "center",
                    sm: "center",
                    lg: "flex-end",
                  },

                  mt: { xs: 2, sm: 0 },
                }}
              >
                {/* 🔥 BACKGROUND SHAPE */}
                <Box
                  sx={{
                    position: "absolute",
                    right: { xs: "-10%", sm: "0%", md: "5%", lg: "6%" },
                    bottom: { xs: -20, sm: -10, md: -20, lg: -36 },

                    width: {
                      xs: "80%",
                      sm: "75%",
                      md: "75%",
                      lg: "78%",
                    },

                    height: {
                      xs: 180,
                      sm: 200,
                      md: 220,
                      lg: 320,
                    },

                    bgcolor: COLORS.primaryDark,
                    borderBottomLeftRadius: "100% 100%",
                    borderTopRightRadius: "100% 100%",
                    transform: "rotate(-8deg)",
                    filter: "drop-shadow(0 10px 24px rgba(108,93,211,.35))",
                    zIndex: 0,
                  }}
                />

                {/* 🔥 HERO IMAGE */}
                <Box
                  component="img"
                  src={StudentHero}
                  alt="Student"
                  sx={{
                    width: "100%",

                    // 🔥 PERFECT TABLET SIZE FIX
                    maxWidth: {
                      xs: 260,
                      sm: 280,   // 👈 KEY FIX FOR iPad Mini
                      md: 360,
                      lg: 520,
                    },

                    height: "auto",
                    zIndex: 1,
                  }}
                />

                {/* BADGE 1 */}
                <Paper
                  elevation={3}
                  sx={{
                    position: "absolute",
                    top: { xs: -8, sm: 0 },
                    left: { xs: "8%", sm: "10%", md: "12%" },
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    display: "flex",
                    gap: 1,
                    zIndex: 2,
                  }}
                >
                  <Chip label="100+" />
                  <Typography variant="body2">Expert Mentors</Typography>
                </Paper>

                {/* BADGE 2 */}
                <Paper
                  elevation={3}
                  sx={{
                    position: "absolute",
                    right: { xs: "6%", sm: "8%", md: "10%" },
                    bottom: { xs: -8, sm: -6, md: -10 },
                    px: 2,
                    py: 1,
                    borderRadius: 3,
                    display: "flex",
                    gap: 1,
                    zIndex: 2,
                  }}
                >
                  <Chip label="1k+" />
                  <Typography variant="body2">Courses</Typography>
                </Paper>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>


      {/* ===== TRUSTED COMPANIES SECTION ===== */}
      <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: COLORS.trustBg,
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Grid container alignItems="center" spacing={{ xs: 4, md: 6 }}>
            {/* LEFT: Heading */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  color: COLORS.textMain,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                Trusted By Top 100+
                <br />
                Companies &amp; Universities
              </Typography>
            </Grid>

            {/* RIGHT: Auto-scrolling logos */}
            <Grid item xs={12} md={8}>
              <Box
                className="scroll-container"
                sx={{
                  position: "relative",
                  width: "100%",
                  overflow: "hidden",
                  "&:hover .scroll-track": {
                    animationPlayState: "paused",
                  },
                }}
              >
                <Box
                  className="scroll-track"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 6, sm: 8, md: 10 },
                    animation: "scroll 30s linear infinite",
                    "@keyframes scroll": {
                      "0%": { transform: "translateX(0)" },
                      "100%": { transform: "translateX(-50%)" },
                    },
                  }}
                >
                  {[...Array(2)].map((_, i) => (
                    <React.Fragment key={i}>
                      {logos.map((item, index) => (
                        <Box
                          key={`${i}-${index}`}
                          component="img"
                          src={item.src}
                          alt={item.alt}
                          sx={{
                            width: { xs: 120, sm: 140, md: 160 },
                            height: "auto",
                            objectFit: "contain",
                            filter: "grayscale(1) contrast(1.1)",
                            opacity: 0.9,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              filter: "none",
                              opacity: 1,
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== FEATURES SECTION ===== */}
      <MotionBox
        sx={{
          bgcolor: COLORS.darkSection,
          color: "#fff",
          py: { xs: 8, md: 10 },
        }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, amount: 0.25 }}
      >
        <Container maxWidth="lg">
          {/* Heading */}
          <MotionBox
            sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: "-.01em",
                fontSize: { xs: 32, sm: 40, md: 48 },
                mb: 1.5,
              }}
            >
              Our features special for you
            </Typography>

            <Typography
              sx={{
                maxWidth: 860,
                mx: "auto",
                color: "rgba(255,255,255,.75)",
                fontSize: { xs: 14, md: 15.5 },
                lineHeight: 1.6,
              }}
            >
              Crafted with care to match your needs, packed with tools that help you
              grow smart, simple and easy to use — accessible anytime, anywhere. Built
              for comfort, speed and style, helping you every step of the way.
            </Typography>
          </MotionBox>

          {/* Cards */}
          <MotionBox
            variants={{
              show: {
                transition: { staggerChildren: 0.08, delayChildren: 0.1 },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: { xs: 3, md: 4 },
              alignItems: "stretch",
            }}
          >
            {[
              {
                title: "Recorded Sessions",
                desc:
                  "Learn anytime anywhere with ease pause rewind and never miss a moment",
                accent: false,
                Icon: VideocamOutlinedIcon,
              },
              {
                title: "Schedule Learning",
                desc:
                  "Plan your lessons to fit your life learn when you’re most focused stay organized & stress",
                accent: true,
                Icon: EventAvailableOutlinedIcon,
              },
              {
                title: "Study Community",
                desc:
                  "Connect with like minded learners share ideas and insight freely get support",
                accent: false,
                Icon: ForumOutlinedIcon,
              },
              {
                title: "Interactive Quizzes",
                desc:
                  "Challenge yourself after every lesson get instant feedback track progress in real time",
                accent: false,
                Icon: QuizOutlinedIcon,
              },
              {
                title: "Practical Learning",
                desc:
                  "Go beyond theory dive into action real-world skills for real success hands-on projects",
                accent: false,
                Icon: MenuBookOutlinedIcon,
              },
              {
                title: "Daily Challenges",
                desc:
                  "Never miss a moment of learning access every class anytime study from anywhere",
                accent: false,
                Icon: FlagCircleOutlinedIcon,
              },
            ].map(({ title, desc, accent, Icon }, i) => (
              <MotionPaper
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.98 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={{
                  y: -6,
                  boxShadow: accent
                    ? "0 22px 46px rgba(158,130,247,.45)"
                    : "0 16px 36px rgba(0,0,0,.35)",
                }}
                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                elevation={0}
                sx={{
                  minWidth: 0,
                  height: "100%",
                  p: { xs: 3, md: 4 },
                  borderRadius: 2,
                  bgcolor: accent ? COLORS.primary : COLORS.surface,
                  boxShadow: "0 10px 22px rgba(0,0,0,.10)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: 2.2,
                }}
              >
                {/* Icon block */}
                <MotionBox
                  whileHover={{ scale: 1.06 }}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 2,
                    bgcolor: accent ? COLORS.surface : COLORS.primarySoft,
                    display: "grid",
                    placeItems: "center",
                    color: COLORS.primaryDark,
                    flex: "0 0 auto",
                  }}
                >
                  <Icon sx={{ fontSize: 42 }} />
                </MotionBox>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: accent ? COLORS.surface : "#0b0b0b",
                  }}
                >
                  {title}
                </Typography>

                <Typography
                  sx={{
                    color: accent ? "rgba(255,255,255,.90)" : "rgba(0,0,0,.70)",
                    lineHeight: 1.6,
                    fontSize: { xs: 14, md: 15 },
                    maxWidth: 460,
                  }}
                >
                  {desc}
                </Typography>
              </MotionPaper>
            ))}
          </MotionBox>
        </Container>
      </MotionBox>
      <WhyBest />
      <Testimonials />


      {/* ===== MEMBERSHIP CTA (MATCH DESIGN) ===== */}
      <MotionBox
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 10, md: 14 },

          backgroundImage: `url(${MembershipBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: "center" }}>

          {/* TITLE */}
          <Typography
            sx={{
              fontWeight: 800,
              color: "#fff",
              fontSize: { xs: 32, sm: 42, md: 64 },
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            Membership that
          </Typography>

          <Typography
            sx={{
              fontWeight: 800,
              color: "#fff",
              fontSize: { xs: 32, sm: 42, md: 64 },
              lineHeight: 1.1,
              mb: 2,
            }}
          >
            brings people together
          </Typography>

          {/* SUBTEXT */}
          <Typography
            sx={{
              color: "rgba(255,255,255,0.85)",
              maxWidth: 800,
              mx: "auto",
              mb: 5,
              fontSize: { xs: 14, md: 16 },
            }}
          >
            Build lasting relationships, grow together, learn together, find your people,
            find your purpose, share ideas, gain insights, support and be supported —
            every member matters here.
          </Typography>

          {/* FORM */}
          <Box
            component="form"
            onSubmit={handleSubscribe}
            sx={{
              mx: "auto",
              width: "100%",
              maxWidth: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",

              bgcolor: "#fff",
              borderRadius: "12px",
              p: "8px",
            }}
          >
            {/* INPUT */}
            <InputBase
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                flex: 1,
                px: 2,
                py: 1.5,
                fontSize: 15,
                color: "#111827",
              }}
            />

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={loading} // ✅ disable while loading
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: "8px",
                fontWeight: 700,
                textTransform: "none",
                color: "#fff",
                backgroundColor: "#8B7CF6",
                minWidth: 140,

                "&:hover": {
                  backgroundColor: "#7C6CF0",
                },

                ...(loading && {
                  backgroundColor: "#a5b4fc",
                }),
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={18}
                    sx={{ color: "#fff", mr: 1 }}
                  />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </Box>
        </Container>
      </MotionBox>

      <Footer />
    </Box>
  );
}
