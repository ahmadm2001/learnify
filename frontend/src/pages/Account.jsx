import HomeFeedSection from "../components/social/HomeFeedSection";
import { Box, Typography, Paper, Container } from "@mui/material";

export default function Account() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3f0ff 0%, #ffffff 60%)",
        py: { xs: 3, md: 5 },
      }}
    >
      {/* ================= FEED ================= */}
      <Container maxWidth="md">
        <HomeFeedSection />
      </Container>

      {/* ================= FOOTER ================= */}
      <Box
        sx={{
          textAlign: "center",
          mt: 6,
          pb: 3,
          color: "text.secondary",
          fontSize: "0.85rem",
        }}
      >
        Learnify © {new Date().getFullYear()}
      </Box>
    </Box>
  );
}
