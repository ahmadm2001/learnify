import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stepper,
  Step,
  StepLabel,
  Stack,
  Chip,
  Card,
  CardActionArea,
  Divider,
  Avatar,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

const categories = [
  "Development",
  "Business",
  "IT & Software",
  "Design",
  "Marketing",
  "Teaching & Academics",
];

const steps = [
  "Course type",
  "Working title",
  "Category",
  "Time per week",
  "Details",
];
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const weeklyOptions = [
  { value: "0-2 hours", label: "0–2 hours", desc: "Best for light weekly planning" },
  { value: "2-4 hours", label: "2–4 hours", desc: "A balanced pace for most courses" },
  { value: "5+ hours", label: "5+ hours", desc: "Great for fast content development" },
  { value: "not_sure", label: "Not sure yet", desc: "You can decide your pace later" },
];

const palette = {
  primary: "#7c3aed",
  secondary: "#6366f1",
  soft: "#f6f0ff",
  soft2: "#faf7ff",
  border: "rgba(124,58,237,0.14)",
  textMuted: "#6b7280",
  dark: "#1f2937",
  white: "#ffffff",
};

const pageMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
};

function SectionHeading({ title, subtitle }) {
  return (
    <Box textAlign="center" sx={{ mb: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          color: palette.dark,
          mb: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          color: palette.textMuted,
          maxWidth: 620,
          mx: "auto",
          lineHeight: 1.7,
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
}

function ChoiceCard({ selected, title, subtitle, onClick }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1,
        border: selected
          ? `2px solid ${palette.primary}`
          : "1px solid rgba(15,23,42,0.08)",
        background: selected
          ? "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(99,102,241,0.08) 100%)"
          : "#fff",
        boxShadow: selected
          ? "0 18px 40px rgba(124,58,237,0.14)"
          : "0 8px 24px rgba(15,23,42,0.05)",
        transition: "all 0.25s ease",
        height: "100%",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          p: 3,
          height: "100%",
          borderRadius: 1,
        }}
      >
        <Stack spacing={1.2}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: palette.dark,
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ color: palette.textMuted, lineHeight: 1.7 }}>
            {subtitle}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

function RadioCard({ value, selectedValue, label, desc, onChange }) {
  const selected = selectedValue === value;

  return (
    <Paper
      elevation={0}
      onClick={() => onChange(value)}
      sx={{
        p: 2,
        borderRadius: 1,
        border: selected
          ? `2px solid ${palette.primary}`
          : "1px solid rgba(15,23,42,0.08)",
        background: selected
          ? "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(99,102,241,0.07) 100%)"
          : "#fff",
        cursor: "pointer",
        transition: "all 0.22s ease",
        boxShadow: selected
          ? "0 12px 28px rgba(124,58,237,0.12)"
          : "0 6px 18px rgba(15,23,42,0.04)",
        "&:hover": {
          transform: "translateY(-1px)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Radio checked={selected} value={value} />
        <Box>
          <Typography sx={{ fontWeight: 700, color: palette.dark }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: palette.textMuted }}>
            {desc}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function CreateCourseWizard() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const [courseType, setCourseType] = useState("COURSE");
  const [workingTitle, setWorkingTitle] = useState("");
  const [category, setCategory] = useState("");
  const [timePerWeek, setTimePerWeek] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [thumbnail, setThumbnail] = useState(null);

  const [errors, setErrors] = useState({});

  const validateStep = (stepIndex) => {
    const e = {};

    switch (stepIndex) {
      case 1:
        e.workingTitle = workingTitle ? "" : "Working title is required";
        break;

      case 2:
        e.category = category ? "" : "Select a category";
        break;

      case 3:
        e.timePerWeek = timePerWeek ? "" : "Choose an option";
        break;

      case 4:
        e.title = title || workingTitle ? "" : "Course title is required";
        const plainText = description.replace(/<[^>]+>/g, "").trim();
        e.description = plainText ? "" : "Description required";

        if (price === "") e.price = "Price required";
        else if (Number(price) < 0) e.price = "Price cannot be negative";
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, ...e }));
    return Object.values(e).every((msg) => !msg);
  };

  const handleNext = () => {

    // 🚀 IF LIVE SESSION SELECTED → GO DIRECTLY
    if (activeStep === 0 && courseType === "LIVE_SESSION") {
      navigate(`/instructor/create-schedule`);
      return;
    }

    if (activeStep !== 0 && !validateStep(activeStep)) return;

    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((s) => s - 1);
  };

  const handleCreateCourse = async () => {
    if (!validateStep(4)) {
      setActiveStep(4);
      return;
    }

    try {
      const fd = new FormData();
      fd.append("course_type", courseType);
      fd.append("category", category);
      fd.append("time_per_week", timePerWeek);
      fd.append("title", title || workingTitle);
      fd.append("description", description);
      fd.append("price", price);

      if (thumbnail) fd.append("thumbnail", thumbnail);

      const res = await api.post("/api/courses/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newCourseId = res.data.id;
      navigate(`/instructor/courses/${newCourseId}/edit`);
    } catch (err) {
      alert("Error creating course");
      console.error(err);
    }
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  const summaryTitle = useMemo(() => title || workingTitle || "Untitled course", [title, workingTitle]);

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <SectionHeading
              title="What are you creating?"
              subtitle="Choose the learning experience you want to build. You can continue with the same flow after selecting a type."
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
                maxWidth: 820,
                mx: "auto",
              }}
            >
              <ChoiceCard
                selected={courseType === "COURSE"}
                title="Full Course"
                subtitle="Create a complete structured learning experience with lessons, content, and progression."
                onClick={() => setCourseType("COURSE")}
              />
              <ChoiceCard
                selected={courseType === "LIVE_SESSION"}
                title="Schedule Live Session"
                subtitle="Plan and schedule a live class session with students using real-time meetings."
                onClick={() => setCourseType("LIVE_SESSION")}
              />
            </Box>

            <ToggleButtonGroup
              exclusive
              value={courseType}
              onChange={(_, v) => v && setCourseType(v)}
              sx={{ display: "none" }}
            >
              <ToggleButton value="COURSE">Course</ToggleButton>
              <ToggleButton value="PRACTICE_TEST">Practice test</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        );

      case 1:
        return (
          <Box>
            <SectionHeading
              title="Give it a strong working title"
              subtitle="This can be changed later, so start with something simple and clear."
            />

            <Box maxWidth="sm" mx="auto">
              <TextField
                fullWidth
                placeholder="e.g. Python for beginners"
                value={workingTitle}
                onChange={(e) => setWorkingTitle(e.target.value)}
                error={Boolean(errors.workingTitle)}
                helperText={errors.workingTitle}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#fff",
                  },
                }}
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <SectionHeading
              title="Choose a category"
              subtitle="This helps learners find your course more easily and keeps your content organized."
            />

            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              justifyContent="center"
              sx={{ mb: 3 }}
            >
              {categories.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  onClick={() => setCategory(c)}
                  sx={{
                    px: 1,
                    py: 2.4,
                    borderRadius: 999,
                    fontWeight: 600,
                    background:
                      category === c
                        ? "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)"
                        : "#fff",
                    color: category === c ? "#fff" : palette.dark,
                    border:
                      category === c
                        ? "none"
                        : "1px solid rgba(15,23,42,0.08)",
                    boxShadow:
                      category === c
                        ? "0 12px 24px rgba(124,58,237,0.22)"
                        : "none",
                  }}
                />
              ))}
            </Stack>

            <Box maxWidth="sm" mx="auto">
              <TextField
                select
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                error={Boolean(errors.category)}
                helperText={errors.category}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#fff",
                  },
                }}
              >
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <SectionHeading
              title="How much time can you commit each week?"
              subtitle="This helps shape your content planning and teaching pace."
            />

            <Box maxWidth="md" mx="auto">
              <RadioGroup
                value={timePerWeek}
                onChange={(e) => setTimePerWeek(e.target.value)}
              >
                <Stack spacing={2}>
                  {weeklyOptions.map((option) => (
                    <RadioCard
                      key={option.value}
                      value={option.value}
                      selectedValue={timePerWeek}
                      label={option.label}
                      desc={option.desc}
                      onChange={setTimePerWeek}
                    />
                  ))}
                </Stack>
              </RadioGroup>

              {errors.timePerWeek && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                  {errors.timePerWeek}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box>
            <SectionHeading
              title="Final details"
              subtitle="Add the information learners will see before enrolling in your course."
            />

            <Stack spacing={2.2} maxWidth="md" mx="auto">
              <TextField
                label="Course title"
                fullWidth
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                helperText={errors.title}
                error={Boolean(errors.title)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#fff",
                  },
                }}
              />

              <Box>
                <Typography sx={{ mb: 1.2, fontWeight: 600 }}>
                  Description
                </Typography>

                <Box
                  sx={{
                    border: "1px solid rgba(0,0,0,0.23)",
                    borderRadius: 1,
                    overflow: "hidden",
                    background: "#fff",

                    "& .ql-editor": {
                      minHeight: 180,   // 👈 THIS CONTROLS THE INPUT HEIGHT
                      fontSize: "0.95rem",
                      lineHeight: 1.6,
                    },

                    "& .ql-toolbar": {
                      border: "none",
                      borderBottom: "1px solid rgba(0,0,0,0.12)",
                    },

                    "& .ql-container": {
                      border: "none",
                    },
                  }}
                >
                  <ReactQuill
                    theme="snow"
                    value={description}
                    onChange={setDescription}
                    modules={quillModules}
                  />
                </Box>

                {errors.description && (
                  <Typography color="error" variant="caption">
                    {errors.description}
                  </Typography>
                )}
              </Box>

              {/* PRICE FULL WIDTH */}
              <TextField
                label="Price (USD)"
                type="number"
                fullWidth
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                helperText={errors.price}
                error={Boolean(errors.price)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    backgroundColor: "#fff",
                  },
                }}
              />

              {/* THUMBNAIL BELOW PRICE */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: "1px dashed rgba(124,58,237,0.35)",
                  background: "linear-gradient(135deg, #faf7ff 0%, #f6f0ff 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, color: palette.dark }}>
                    Thumbnail
                  </Typography>

                  <Typography variant="body2" sx={{ color: palette.textMuted }}>
                    {thumbnail ? thumbnail.name : "Upload a cover image"}
                  </Typography>
                </Box>

                <Button
                  component="label"
                  variant="outlined"
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    borderColor: "rgba(124,58,237,0.25)",
                    color: palette.primary,
                    fontWeight: 700,
                  }}
                >
                  {thumbnail ? "Change" : "Upload"}

                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  />
                </Button>
              </Paper>
            </Stack>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 5 },
        background:
          "radial-gradient(circle at top left, rgba(124,58,237,0.10), transparent 28%), radial-gradient(circle at top right, rgba(99,102,241,0.10), transparent 24%), linear-gradient(180deg, #fcfbff 0%, #f8f5ff 45%, #f5efff 100%)",
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          {/* LEFT SIDEBAR */}
          <Paper
            elevation={0}
            sx={{
              position: { lg: "sticky" },
              top: { lg: 24 },
              p: 3,
              borderRadius: 1,
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(16px)",
              border: `1px solid ${palette.border}`,
              boxShadow: "0 18px 50px rgba(124,58,237,0.08)",
            }}
          >
            <Stack spacing={2.5}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: palette.primary,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                  }}
                >
                  COURSE BUILDER
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: palette.dark,
                    lineHeight: 1.2,
                    mt: 0.5,
                  }}
                >
                  Create your course
                </Typography>
                <Typography sx={{ color: palette.textMuted, mt: 1.2 }}>
                  A cleaner setup flow to help instructors move faster.
                </Typography>
              </Box>

              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 700, color: palette.dark }}>
                    Progress
                  </Typography>
                  <Typography sx={{ color: palette.primary, fontWeight: 800 }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 10,
                    borderRadius: 999,
                    bgcolor: "rgba(148,163,184,0.18)",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${progress}%`,
                      height: "100%",
                      borderRadius: 999,
                      background:
                        "linear-gradient(90deg, #7c3aed 0%, #6366f1 100%)",
                      transition: "0.35s ease",
                    }}
                  />
                </Box>
              </Box>

              <Divider />

              <Stepper
                activeStep={activeStep}
                orientation="vertical"
                sx={{
                  "& .MuiStepLabel-label": {
                    fontSize: "0.95rem",
                    fontWeight: 600,
                  },
                  "& .MuiStepIcon-root.Mui-active": {
                    color: palette.primary,
                  },
                  "& .MuiStepIcon-root.Mui-completed": {
                    color: palette.secondary,
                  },
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: activeStep === index ? 800 : 600,
                            color: activeStep === index ? palette.dark : "#475569",
                          }}
                        >
                          {label}
                        </Typography>
                      </Box>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider />

              <Paper
                elevation={0}
                sx={{
                  p: 2.25,
                  borderRadius: 1,
                  background:
                    "linear-gradient(135deg, rgba(124,58,237,0.09) 0%, rgba(99,102,241,0.08) 100%)",
                  border: "1px solid rgba(124,58,237,0.12)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(124,58,237,0.14)",
                      color: palette.primary,
                      fontWeight: 800,
                    }}
                  >
                    {summaryTitle?.charAt(0)?.toUpperCase() || "C"}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: palette.dark }}>
                      {summaryTitle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: palette.textMuted }}>
                      {courseType === "COURSE"
                        ? "Full course"
                        : "Live session"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={0.8}>
                  <Typography variant="body2" sx={{ color: palette.textMuted }}>
                    <strong>Category:</strong> {category || "Not selected"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.textMuted }}>
                    <strong>Time/week:</strong> {timePerWeek || "Not selected"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.textMuted }}>
                    <strong>Price:</strong> ${price || "0"}
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Paper>

          {/* MAIN CONTENT */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4.5 },
              borderRadius: 1,
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(14px)",
              border: `1px solid ${palette.border}`,
              boxShadow: "0 20px 60px rgba(15,23,42,0.07)",
              minHeight: 680,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <AnimatePresence mode="wait">
              <Box
                key={activeStep}
                component={motion.div}
                variants={pageMotion}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28 }}
                sx={{ flex: 1 }}
              >
                {renderStep()}
              </Box>
            </AnimatePresence>

            <Divider sx={{ my: 4 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                sx={{
                  minWidth: 130,
                  borderRadius: 999,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  borderColor: "rgba(124,58,237,0.22)",
                  color: palette.primary,
                }}
              >
                Previous
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    minWidth: 150,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 800,
                    px: 3.5,
                    py: 1.25,
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                    boxShadow: "0 16px 30px rgba(124,58,237,0.28)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                    },
                  }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleCreateCourse}
                  sx={{
                    minWidth: 170,
                    borderRadius: 999,
                    textTransform: "none",
                    fontWeight: 800,
                    px: 3.5,
                    py: 1.25,
                    background:
                      "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                    boxShadow: "0 16px 30px rgba(124,58,237,0.28)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                    },
                  }}
                >
                  Create course
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}