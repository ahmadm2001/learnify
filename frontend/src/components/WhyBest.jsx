// src/sections/WhyBest.jsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";
import TeamImg from "../assets/why-team.png";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const greenActive = "#9991f4"; // active pill full background
const greenBadge = "#ebe6ff";  // number badge bg for non-active pills

// Pill Component
const Item = ({ n, title, desc, active = false, index = 0 }) => (
  <MotionPaper
    elevation={0}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ duration: 0.4, delay: 0.15 * index }}
    sx={{
      px: { xs: 2, sm: 2.8 },
      py: { xs: 1.8, sm: 2.2 },
      borderRadius: 1.5,
      border: "1.5px solid #111827",
      bgcolor: active ? greenActive : "#ffffff",
      boxShadow: active ? "0 10px 24px rgba(0,0,0,.08)" : "none",
      display: "flex",
      alignItems: "center",
      width: "100%",
    }}
  >
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          width: 46,
          height: 46,
          flex: "0 0 46px",
          borderRadius: 0.75,
          border: "1.5px solid #111827",
          bgcolor: active ? "#ffffff" : greenBadge,
          fontWeight: 800,
          fontSize: 16,
          display: "grid",
          placeItems: "center",
        }}
      >
        {n}
      </Box>

      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            color: "#0f172a",
            mb: desc ? 0.4 : 0,
            fontSize: { xs: 16, sm: 18 },
          }}
        >
          {title}
        </Typography>

        {desc && (
          <Typography
            sx={{
              color: "#374151",
              fontSize: { xs: 13.5, sm: 14 },
              lineHeight: 1.55,
            }}
          >
            {desc}
          </Typography>
        )}
      </Box>
    </Stack>
  </MotionPaper>
);

export default function WhyBest() {
  return (
    <Box sx={{ py: { xs: 8, md: 14 }, bgcolor: "#f5f7ff" }}>
      <Container maxWidth="lg">
        <MotionBox
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            gap: { xs: 5, md: 10 },
            px: { xs: 1, md: 2 },
          }}
        >
          {/* LEFT — IMAGE BLOCK */}
          <MotionBox
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            sx={{
              flex: { xs: "0 0 auto", md: "0 0 48%" },
              width: { xs: "100%", md: "48%" },
              maxWidth: { xs: "100%", md: 520 },
              mx: { xs: "auto", md: 0 },
            }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                border: "2.5px solid #111827",
                overflow: "hidden",
                aspectRatio: { xs: "4 / 3", sm: "4 / 3", md: "4 / 5" },
                bgcolor: "#ffffff",
                boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              }}
            >
              {/* Decorative cloud shape */}
              <Box
                aria-hidden
                sx={{
                  display: { xs: "none", sm: "block" },
                  position: "absolute",
                  top: -48,
                  left: -48,
                  width: 200,
                  height: 200,
                  borderTopLeftRadius: 999,
                  background:
                    "radial-gradient(circle at 90px 90px, transparent 82px, #111827 82px 84px, transparent 84px), " +
                    "radial-gradient(circle at 140px 50px, transparent 82px, #111827 82px 84px, transparent 84px), " +
                    "radial-gradient(circle at 50px 140px, transparent 82px, #111827 82px 84px, transparent 84px)",
                  zIndex: 2,
                }}
              />

              {/* Image */}
              <Box
                component="img"
                src={TeamImg}
                alt="Team learning"
                sx={{
                  position: "absolute",
                  inset: 12,
                  width: "calc(100% - 24px)",
                  height: "calc(100% - 24px)",
                  objectFit: "cover",
                  borderRadius: 1.5,
                }}
              />
            </Box>
          </MotionBox>

          {/* RIGHT — TEXT + PILL BOXES */}
          <MotionBox
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            sx={{
              flex: { xs: "0 0 auto", md: "0 0 52%" },
              width: { xs: "100%", md: "52%" },

              // ⭐ Fixed spacing from the right
              pr: { xs: 2, sm: 3, md: 6, lg: 10 },

              // ⭐ Some breathing room on the left
              pl: { xs: 2, sm: 3, md: 2 },

              // ⭐ Limit width to keep UI clean
              maxWidth: 560,

              textAlign: { xs: "center", md: "left" },
              mx: { xs: "auto", md: 0 },
            }}
          >
            {/* Heading */}
            <Typography
              component="h2"
              sx={{
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.1,
                fontSize: {
                  xs: "clamp(26px, 6vw, 34px)",
                  md: "46px",
                },
                mb: { xs: 1.5, md: 2 },
              }}
            >
              Why we are best
              <br />
              from others?
            </Typography>

            {/* Sub text */}
            <Typography
              sx={{
                color: "#4b5563",
                mb: { xs: 3, md: 4 },
                fontSize: { xs: 14, sm: 15, md: 16 },
                maxWidth: { xs: 520, md: "100%" },
                mx: { xs: "auto", md: 0 },
              }}
            >
              Education that empowers skills that last a lifetime—join the best
              platform for learning, unlock your potential with us, and build
              the future you deserve.
            </Typography>

            {/* Pills */}
            <Stack
              spacing={2.4}
              sx={{
                maxWidth: 520,
                mx: { xs: "auto", md: 0 },
              }}
            >
              <Item
                n="1"
                index={0}
                active
                title="Discover Courses"
                desc="Your journey begins with just one click—from basics to pro. Whatever your goal, start something great anytime, anywhere."
              />
              <Item n="2" index={1} title="Flexible course plan" />
              <Item n="3" index={2} title="Best Class Instructors" />
              <Item n="4" index={3} title="Align Skills & Goals" />
            </Stack>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
}
