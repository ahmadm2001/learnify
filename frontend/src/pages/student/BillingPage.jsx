// frontend/src/pages/student/BillingPage.jsx

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/api";

import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Stack,
  Divider,
  Chip,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

/* ================= CARD DETECTION ================= */
function detectCardBrand(value) {
  const v = value.replace(/\D/g, ""); // 🔥 remove everything except digits

  if (v.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(v)) return "mastercard";

  return null;
}

export default function BillingPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const brand = detectCardBrand(cardNumber);
  const [name, setName] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});
  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "") // only numbers
      .slice(0, 16) // max 16 digits
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, "").slice(0, 4);

    if (v.length <= 2) return v;
    return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
  };

  useEffect(() => {
    api.get("/api/cart/").then((res) => setItems(res.data || []));
  }, []);

  const total = items.reduce(
    (sum, item) => sum + Number(item.course?.price || 0),
    0
  );
  const validateForm = () => {
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
      newErrors.cardNumber = "Valid card number required";
    }

    const [month, year] = expiry.split("/");

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (!month || !year) {
      newErrors.expiry = "Expiry date required";
    } else if (Number(month) < 1 || Number(month) > 12) {
      newErrors.expiry = "Invalid month";
    } else if (
      Number(year) < currentYear ||
      (Number(year) === currentYear && Number(month) < currentMonth)
    ) {
      newErrors.expiry = "Card expired";
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = "CVV must be 3 digits";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const handleDemoPayment = async () => {
    // 🔥 ADD THIS LINE
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 🔥 STEP 1: check if already purchased
      for (const item of items) {
        if (item.course.is_enrolled) {
          alert("You already purchased this course");
          setLoading(false);
          return;
        }
      }

      // 🔥 STEP 2: normal payment
      for (const item of items) {
        await api.post(`/api/payment/success/${item.course.id}/`);
      }

      navigate(`/payment-success/${items[0].course.id}`);

    } catch (error) {
      console.log(error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const hasPurchasedCourse = items.some(
    (item) => item.course.is_enrolled
  );


  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#f5f3ff 0%,#eef2ff 40%,#ffffff 100%)",
        py: 6,
      }}
    >
      <Box maxWidth={1200} mx="auto" px={3}>

        {/* HEADER */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/cart")}
          sx={{ mb: 4 }}
        >
          Back to cart
        </Button>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
            gap: 5,
          }}
        >

          {/* LEFT */}
          <Box>
            <Typography fontWeight={900} fontSize="1.4rem" mb={2}>
              Order summary
            </Typography>

            <Paper
              sx={{
                p: 3,
                borderRadius: "20px",
                boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
              }}
            >
              {items.map((item) => (
                <Stack key={item.id} mb={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography fontWeight={700}>
                      {item.course.title}
                    </Typography>

                    <Typography fontWeight={800}>
                      ${item.course.price}
                    </Typography>
                  </Stack>

                  <Typography fontSize={13} color="text.secondary">
                    {item.course.teacher_name}
                  </Typography>

                  {/* 🔥 NEW PART */}
                  {item.course.is_enrolled && (
                    <Typography color="green" fontSize={12} mt={0.5}>
                      ✔ Already Purchased
                    </Typography>
                  )}

                  <Divider sx={{ mt: 1 }} />
                </Stack>
              ))}

              <Stack
                direction="row"
                justifyContent="space-between"
                mt={2}
              >
                <Typography fontWeight={900}>Total</Typography>
                <Typography fontWeight={900} color="primary">
                  ${total.toFixed(2)}
                </Typography>
              </Stack>
            </Paper>

            {/* PAYMENT METHOD */}
            <Typography fontWeight={800} mt={4} mb={1}>
              Payment method
            </Typography>

            <Stack direction="row" spacing={1}>
              {[
                {
                  key: "card",
                  label: "Card",
                  icon: <CreditCardIcon />,
                },
                {
                  key: "paypal",
                  label: "PayPal",
                  icon: <AccountBalanceWalletIcon />,
                },
              ].map((item) => {
                const active = method === item.key;

                return (
                  <Chip
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    onClick={() => setMethod(item.key)}
                    clickable
                    sx={{
                      px: 1.5,
                      height: 44,
                      borderRadius: 999,
                      fontWeight: 800,
                      transition: "all 0.25s ease",

                      // ✅ DARK ACTIVE BACKGROUND
                      background: active
                        ? "linear-gradient(135deg,#4c1d95,#7c3aed)"
                        : "rgba(124,58,237,0.08)",

                      color: active ? "#fff" : "#5b21b6",

                      boxShadow: active
                        ? "0 8px 20px rgba(124,58,237,0.35)"
                        : "none",

                      // ✅ ICON COLOR FIX
                      "& .MuiChip-icon": {
                        color: active ? "#fff" : "#7c3aed",
                      },

                      "&:hover": {
                        background: active
                          ? "linear-gradient(135deg,#4c1d95,#7c3aed)"
                          : "rgba(124,58,237,0.15)",
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          {/* RIGHT */}
          <Box>
            <Typography fontWeight={900} fontSize="2rem" mb={3}>
              Checkout
            </Typography>

            <Paper
              sx={{
                p: 4,
                borderRadius: "24px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
              }}
            >
              <Stack spacing={2}>
                <TextField
                  label="Name on Card"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                />

                <TextField
                  label="Card Number ( 4111 1111 1111 1111)"
                  fullWidth
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value))
                  }
                  error={!!errors.cardNumber}
                  helperText={errors.cardNumber}
                  InputProps={{
                    endAdornment: brand && (
                      <Box
                        component="img"
                        src={
                          brand === "visa"
                            ? "https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                            : "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                        }
                        sx={{ height: 22 }}
                      />
                    ),
                  }}
                />

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="MM/YY"
                    fullWidth
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    error={!!errors.expiry}
                    helperText={errors.expiry}
                  />
                  <TextField
                    label="CVV"
                    fullWidth
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, ""))
                    }
                    error={!!errors.cvv}
                    helperText={errors.cvv}
                    inputProps={{ maxLength: 3 }}
                  />
                </Stack>

                <Button
                  fullWidth
                  size="large"
                  disabled={
                    loading ||
                    hasPurchasedCourse ||
                    !name ||
                    !cardNumber ||
                    cardNumber.replace(/\s/g, "").length < 16 ||
                    !expiry ||
                    !cvv
                  }
                  onClick={handleDemoPayment}
                  startIcon={!loading && <LockIcon />}
                  sx={{
                    mt: 2,
                    height: 56,
                    borderRadius: 999,
                    fontWeight: 900,
                    background:
                      "linear-gradient(135deg,#7c3aed,#6366f1)",
                    color: "#fff",
                    boxShadow:
                      "0 15px 35px rgba(99,102,241,0.4)",
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : hasPurchasedCourse ? (
                    "Already Purchased"
                  ) : (
                    `Pay $${total.toFixed(2)}`
                  )}
                </Button>

                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="center"
                >
                  🔒 Secure checkout • Demo only
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}