// frontend/src/pages/student/Cart.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../lib/api";
import Swal from "sweetalert2";

import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Stack,
  Paper,
  TextField,
  Divider,
} from "@mui/material";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

import { useCart } from "../../context/CartContext.jsx";

export default function Cart() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  const loadCart = async () => {
    try {
      const { data } = await API.get("/api/cart/");
      setItems(data);
      refreshCartCount();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleRemove = async (id) => {
    const res = await Swal.fire({
      title: "Remove course?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Remove",
    });

    if (!res.isConfirmed) return;

    await API.delete(`/api/cart/item/${id}/`);
    setItems((prev) => prev.filter((i) => i.id !== id));
    refreshCartCount();
  };

  const total = items.reduce(
    (sum, i) => sum + Number(i.course?.price || 0),
    0
  );

  const handleCheckout = () => {
    const id = items[0]?.course?.id;
    navigate(`/billing/${id}`);
  };

  /* ================= EMPTY ================= */
  if (!items.length) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(180deg,#f5f3ff,#eef2ff,#fff)",
        }}
      >
        <Box textAlign="center">
          <ShoppingCartOutlinedIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography fontSize="1.8rem" fontWeight={900}>
            Your cart is empty
          </Typography>

          <Button
            sx={{
              mt: 3,
              px: 4,
              height: 50,
              borderRadius: 999,
              background:
                "linear-gradient(135deg,#7c3aed,#6366f1)",
              color: "#fff",
              fontWeight: 800,
            }}
            onClick={() => navigate("/courses")}
          >
            Browse courses
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        background:
          "linear-gradient(180deg,#f5f3ff 0%,#eef2ff 40%,#ffffff 100%)",
      }}
    >
      <Container maxWidth="xl">

        {/* HEADER */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={5}
        >
          <Box>
            <Typography fontSize="2.4rem" fontWeight={900}>
              Shopping Cart
            </Typography>
            <Typography color="text.secondary">
              {items.length} courses selected
            </Typography>
          </Box>

          <Button onClick={() => navigate("/courses")}>
            Continue browsing →
          </Button>
        </Stack>

        {/* GRID */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2.5fr 1fr" },
            gap: 4,
          }}
        >
          {/* LEFT */}
          <Stack spacing={2}>
            {items.map((item) => {
              const c = item.course;
              const price = Number(c?.price || 0);

              const thumb = c.thumbnail_url || c.thumbnail;

              return (
                <Card
                  key={item.id}
                  sx={{
                    display: "flex",
                    gap: 2,
                    p: 2,
                    borderRadius: "24px",
                    alignItems: "center",
                    transition: "0.3s",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  {/* IMAGE */}
                  {thumb ? (
                    <CardMedia
                      component="img"
                      image={thumb}
                      sx={{
                        width: 140,
                        height: 90,
                        borderRadius: "16px",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 140,
                        height: 90,
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background:
                          "linear-gradient(135deg,#7c3aed,#6366f1)",
                        color: "#fff",
                        fontWeight: 800,
                      }}
                    >
                      {c.title}
                    </Box>
                  )}

                  {/* CONTENT */}
                  <Box flex={1}>
                    <Typography fontWeight={900}>
                      {c.title}
                    </Typography>

                    <Typography fontSize={13} color="text.secondary">
                      {c.teacher_name}
                    </Typography>

                    <Stack direction="row" spacing={2} mt={1}>
                      <Button size="small">Save</Button>

                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => handleRemove(item.id)}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </Box>

                  {/* PRICE */}
                  <Typography fontWeight={900} fontSize="1.2rem">
                    ${price.toFixed(2)}
                  </Typography>
                </Card>
              );
            })}
          </Stack>

          {/* RIGHT PANEL */}
          <Paper
            sx={{
              p: 3,
              borderRadius: "24px",
              position: "sticky",
              top: 100,
              height: "fit-content",
              background:
                "linear-gradient(180deg,#ffffff,#f8fafc)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            }}
          >
            <Typography fontWeight={700}>Total</Typography>

            <Typography fontSize="2.5rem" fontWeight={900}>
              ${total.toFixed(2)}
            </Typography>

            <Button
              fullWidth
              onClick={handleCheckout}
              endIcon={<ArrowOutwardIcon />}
              sx={{
                mt: 3,
                height: 55,
                borderRadius: 999,
                fontWeight: 900,
                fontSize: "1rem",
                background:
                  "linear-gradient(135deg,#7c3aed,#6366f1)",
                color: "#fff",
                boxShadow: "0 12px 30px rgba(99,102,241,0.4)",
              }}
            >
              Proceed to Checkout
            </Button>

            <Divider sx={{ my: 3 }} />

            {/* COUPON */}
            <Typography fontWeight={700} mb={1}>
              Coupon Code
            </Typography>

            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter code"
              />
              <Button
                sx={{
                  borderRadius: 999,
                  textTransform: "none",
                }}
                variant="outlined"
              >
                Apply
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}