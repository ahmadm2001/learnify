// src/pages/ContactUs.jsx
import { useState } from "react";
import {
    Box,
    Container,
    Grid,
    Typography,
    TextField,
    Button,
    Chip,
} from "@mui/material";
import Footer from "../components/Footer";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";

export default function ContactUs() {
    const [form, setForm] = useState({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        message: "",
    });

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Message sent 🚀");
    };

    return (
        <Box sx={{ bgcolor: "#f8f7ff", minHeight: "100vh" }}>

            {/* ================= HEADER ================= */}
            <Box sx={{ position: "relative", overflow: "hidden", py: 12 }}>
                <Box
                    sx={{
                        position: "absolute",
                        width: 400,
                        height: 400,
                        bgcolor: "#7c6cf4",
                        filter: "blur(120px)",
                        top: -100,
                        left: -100,
                        opacity: 0.4,
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        width: 400,
                        height: 400,
                        bgcolor: "#a78bfa",
                        filter: "blur(120px)",
                        bottom: -100,
                        right: -100,
                        opacity: 0.4,
                    }}
                />

                <Container maxWidth="md">
                    <Box textAlign="center">
                        <Chip
                            label="Contact Learnify"
                            sx={{
                                mb: 3,
                                fontWeight: 700,
                                bgcolor: "rgba(124,108,244,0.12)",
                                color: "#6d5dfc",
                            }}
                        />

                        <Typography
                            sx={{
                                fontWeight: 900,
                                fontSize: { xs: "2.5rem", md: "3.8rem" },
                                color: "#0f172a",
                            }}
                        >
                            Let’s talk about your
                            <Box component="span" sx={{ color: "#7c6cf4" }}>
                                {" "}learning journey
                            </Box>
                        </Typography>

                        <Typography sx={{ mt: 3, color: "#667085" }}>
                            Have questions or need help? We’re here for you.
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {/* ================= PREMIUM CONTACT ================= */}
            <Container maxWidth="lg" sx={{ mt: 6, pb: 12 }}>
                <Grid
                    container
                    sx={{
                        borderRadius: "32px",
                        overflow: "hidden",
                        background: "white",
                        boxShadow: "0 40px 120px rgba(0,0,0,0.12)",
                        minHeight: { xs: "auto", md: "720px" },
                        flexDirection: { xs: "column", lg: "row" }// 🔥 KEY FIX
                    }}
                >

                    {/* LEFT PANEL */}
                    <Box
                        sx={{
                            flex: 1,
                            width: { xs: "100%", md: "auto" },
                            p: { xs: 4, md: 6 },
                            background: "linear-gradient(135deg, #6d5dfc, #5b4ad6)",
                            color: "white",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <Typography fontSize="2.3rem" fontWeight={900} mb={2}>
                            Contact Us
                        </Typography>

                        <Typography sx={{ opacity: 0.85, mb: 4 }}>
                            Not sure what you need? Our team is ready to help you and guide
                            you with the best learning solutions.
                        </Typography>

                        <Box display="flex" alignItems="center" mb={2}>
                            <EmailRoundedIcon sx={{ mr: 1 }} />
                            <Typography> learnifyam@gmail.com</Typography>
                        </Box>

                        <Box display="flex" alignItems="center">
                            <CallRoundedIcon sx={{ mr: 1 }} />
                            <Typography>+972-53-3031883</Typography>
                        </Box>
                    </Box>

                    {/* RIGHT FORM */}
                    <Box
                        sx={{
                            flex: 1.5,
                            width: { xs: "100%", md: "auto" },
                            p: { xs: 3, md: 5 },
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: { xs: "flex-start", md: "center" }, // 🔥 MAGIC LINE
                        }}
                    >
                        <Typography fontSize="1.8rem" fontWeight={900} mb={3}>
                            We’d love to hear from you! Let’s get in touch
                        </Typography>

                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                height: "auto",
                            }}
                        >
                            {/* TOP INPUTS */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="First Name" name="fname" onChange={handleChange} sx={inputStyle} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Last Name" name="lname" onChange={handleChange} sx={inputStyle} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Email" name="email" onChange={handleChange} sx={inputStyle} />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField fullWidth label="Phone number" name="phone" onChange={handleChange} sx={inputStyle} />
                                </Grid>
                            </Grid>

                            {/* 🔥 FULL HEIGHT MESSAGE */}
                            <Box sx={{ mt: 3 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={5}
                                    label="Your Message"
                                    name="message"
                                    onChange={handleChange}
                                    sx={inputStyle}
                                />
                            </Box>

                            {/* BUTTON */}
                            <Box
                                sx={{
                                    pt: 3,
                                    display: "flex",
                                    justifyContent: { xs: "center", md: "flex-end" }
                                }}
                            >
                                <Button
                                    type="submit"
                                    sx={{
                                        px: 5,
                                        py: 1.6,
                                        borderRadius: "16px",
                                        fontWeight: 800,
                                        fontSize: "1rem",
                                        background: "linear-gradient(135deg, #6d5dfc, #5b4ad6)",
                                        color: "white",
                                        boxShadow: "0 15px 35px rgba(109,93,252,0.4)",
                                        transition: "0.3s",

                                        "&:hover": {
                                            transform: "translateY(-2px)",
                                            boxShadow: "0 20px 45px rgba(109,93,252,0.5)",
                                        },
                                    }}
                                >
                                    Send Message
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Container>
            <Footer />
        </Box>
    );
}

const inputStyle = {
    "& .MuiInputLabel-root": {
        color: "#7a8099",
        fontWeight: 500,
    },

    "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        background: "linear-gradient(180deg, #ffffff, #f4f5ff)",
        transition: "all 0.25s ease",

        "& fieldset": {
            borderColor: "rgba(0,0,0,0.06)",
        },

        "&:hover fieldset": {
            borderColor: "#6d5dfc",
        },

        "&.Mui-focused": {
            background: "#ffffff",
            boxShadow: "0 8px 25px rgba(109,93,252,0.15)",
        },

        "&.Mui-focused fieldset": {
            borderColor: "#6d5dfc",
            borderWidth: "2px",
        },

        "& input, & textarea": {
            fontWeight: 500,
            color: "#1a1f36",
        },
    },
};