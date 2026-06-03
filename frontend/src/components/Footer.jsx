// src/components/Footer.jsx
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Stack,
  Divider,
  Link as MLink,
} from "@mui/material";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import { motion } from "framer-motion";

/* ---- motion helpers ---- */
const MotionBox = motion(Box);
const MotionStack = motion(Stack);
const MotionDivider = motion(Divider);
const MotionGridItem = motion(Box);
const MotionLink = motion(MLink);
const MotionIconButton = motion(IconButton);

const containerStagger = {
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const itemRise = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Footer() {
  return (
    <MotionBox
      component="footer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.2 }}
      sx={{
        bgcolor: "#0b0b0b",
        color: "#fff",
        pt: { xs: 8, md: 10 },
        pb: { xs: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <MotionBox
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid
            container
            spacing={{ xs: 6, md: 8 }}
            justifyContent="space-between"
            alignItems="flex-start"
          >
            {/* Brand + socials */}
            <Grid item xs={12} sm={6} md={3.5}>
              <MotionGridItem variants={itemRise}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, letterSpacing: "-.01em", mb: 2 }}
                >
                  Learnify
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.8)",
                    lineHeight: 1.7,
                    mb: 3,
                    pr: { md: 4 },
                  }}
                >
                  Education that empowers skills that
                  <br /> last. Join best platform career growth
                </Typography>

                <Typography sx={{ fontWeight: 600, mb: 1.5 }}>
                  Join our social media
                </Typography>

                <Stack direction="row" spacing={2.2}>
                  {[FacebookOutlinedIcon, LinkedInIcon, InstagramIcon, TwitterIcon].map(
                    (Icon, i) => (
                      <MotionIconButton
                        key={i}
                        whileHover={{
                          y: -2,
                          scale: 1.06,
                          transition: { type: "spring", stiffness: 300, damping: 18 },
                        }}
                        whileTap={{ scale: 0.95 }}
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: "#fff",
                          color: "#0b0b0b",
                          borderRadius: "50%",
                          ":hover": { bgcolor: "rgba(255,255,255,.9)" },
                          boxShadow: "0 6px 16px rgba(0,0,0,.24)",
                        }}
                      >
                        <Icon fontSize="medium" />
                      </MotionIconButton>
                    )
                  )}
                </Stack>
              </MotionGridItem>
            </Grid>

            {/* Home */}
            <Grid item xs={6} sm={3} md={2}>
              <MotionGridItem variants={itemRise}>
                <SectionTitle>Home</SectionTitle>

                <FooterLink to="/">Home</FooterLink>
                <FooterLink to="/about">About Us</FooterLink>
                <FooterLink to="/courses">Courses</FooterLink>
                <FooterLink to="/contact">Contact Us </FooterLink>
              </MotionGridItem>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} sm={3} md={2.5}>
              <MotionGridItem variants={itemRise}>
                <SectionTitle>Quicks Links</SectionTitle>
                <FooterLink>Privacy Policy</FooterLink>
                <FooterLink>Discussion</FooterLink>
                <FooterLink>Terms &amp; Conditions</FooterLink>
                <FooterLink>FAQ</FooterLink>
              </MotionGridItem>
            </Grid>

            {/* Resources */}
            <Grid item xs={6} sm={3} md={2.5}>
              <MotionGridItem variants={itemRise}>
                <SectionTitle>Resources</SectionTitle>
                <FooterLink>Feedback</FooterLink>
                <FooterLink>Support</FooterLink>
                <FooterLink>Community</FooterLink>
                <FooterLink>Guides</FooterLink>
              </MotionGridItem>
            </Grid>

            {/* Contact */}
            <Grid item xs={6} sm={3} md={2.5}>
              <MotionGridItem variants={itemRise}>
                <SectionTitle>Contact us</SectionTitle>

                <MotionStack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <MailOutlineIcon sx={{ opacity: 0.9 }} />
                  <Typography sx={{ color: "rgba(255,255,255,.9)" }}>
                    learnifyam@gmail.com
                  </Typography>
                </MotionStack>

                <MotionStack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                  <LocalPhoneOutlinedIcon sx={{ opacity: 0.9 }} />
                  <Typography sx={{ color: "rgba(255,255,255,.9)" }}>
                    +972-53-3031883
                  </Typography>
                </MotionStack>
              </MotionGridItem>
            </Grid>
          </Grid>
        </MotionBox>

        {/* Divider */}
        <MotionDivider
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          sx={{ my: { xs: 5, md: 7 }, borderColor: "rgba(255,255,255,.15)" }}
        />

        {/* Bottom bar */}
        <MotionStack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={{ xs: 3, md: 0 }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <Typography sx={{ color: "rgba(255,255,255,.9)", fontSize: 15 }}>
            Copyright © <b>Learnify</b> All Rights Reserved
          </Typography>

          <Stack direction="row" spacing={4}>
            <BottomLink to="/privacy">Privacy</BottomLink>
            <BottomLink to="/security">Security</BottomLink>
            <BottomLink to="/terms">Terms</BottomLink>
          </Stack>
        </MotionStack>
      </Container>
    </MotionBox>
  );
}

/* ===== Reusable subcomponents ===== */

function SectionTitle({ children }) {
  return (
    <Typography
      variant="h6"
      sx={{ fontWeight: 700, mb: 2.2, fontSize: { xs: 17, md: 18 } }}
    >
      {children}
    </Typography>
  );
}

function FooterLink({ children, to }) {
  return (
    <MotionLink
      component={RouterLink}   // 🔥 THIS IS THE KEY
      to={to}                  // 🔥 ROUTE PATH
      underline="none"
      whileHover={{ x: 4 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      style={{ display: "block" }}
      sx={{
        color: "rgba(255,255,255,.8)",
        mb: 1.4,
        fontSize: 15,
        "&:hover": { color: "#fff" },
      }}
    >
      {children}
    </MotionLink>
  );
}

function BottomLink({ children, to }) {
  return (
    <MotionLink
      component={RouterLink}
      to={to}
      underline="none"
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      sx={{
        color: "rgba(255,255,255,.85)",
        fontWeight: 600,
        "&:hover": { color: "#fff" },
      }}
    >
      {children}
    </MotionLink>
  );
}
