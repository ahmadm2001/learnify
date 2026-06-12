import { useState, useEffect, useMemo } from "react";
import Editor from "@monaco-editor/react";
import api from "../../lib/api";

import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Select,
  MenuItem,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";

import { alpha } from "@mui/material/styles";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ClearIcon from "@mui/icons-material/Clear";
import CodeIcon from "@mui/icons-material/Code";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import KeyboardCommandKeyRoundedIcon from "@mui/icons-material/KeyboardCommandKeyRounded";
import DataObjectRoundedIcon from "@mui/icons-material/DataObjectRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import InputRoundedIcon from "@mui/icons-material/InputRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";

/* ================= DEFAULT CODE ================= */

const DEFAULT_CODE = {
  python: `print("Hello from Learnify")`,

  javascript: `console.log("Hello from Learnify");`,

  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello from Learnify");
  }
}`,

  c: `#include <stdio.h>

int main() {
  printf("Hello from Learnify");
  return 0;
}`,

  cpp: `#include <iostream>
using namespace std;

int main() {
  cout << "Hello from Learnify";
  return 0;
}`,

  csharp: `using System;

class Program {
  static void Main() {
    Console.WriteLine("Hello from Learnify");
  }
}`,

  php: `<?php
echo "Hello from Learnify";
?>`,

  go: `package main

import "fmt"

func main() {
  fmt.Println("Hello from Learnify")
}`,

  swift: `import Foundation

print("Hello from Learnify")
`,
};

const EXT_MAP = {
  python: "py",
  javascript: "js",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "cs",
  php: "php",
  go: "go",
  swift: "swift",
};

const EDITOR_LANG = {
  python: "python",
  javascript: "javascript",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "csharp",
  php: "php",
  go: "go",
  swift: "swift",
};

const LANGUAGE_LABELS = {
  python: "Python",
  javascript: "JavaScript",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  php: "PHP",
  go: "Go",
  swift: "Swift",
};

const LANGUAGE_ACCENTS = {
  python: "#3776AB",
  javascript: "#f7df1e",
  java: "#ea580c",
  c: "#2563eb",
  cpp: "#7c3aed",
  csharp: "#6b21a8",
  php: "#4F5B93",
  go: "#06b6d4",
  swift: "#f97316",
};

export default function Compiler() {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [output, setOutput] = useState(null);
  const [isError, setIsError] = useState(false);
  const [input, setInput] = useState("");
  const [meta, setMeta] = useState({ status: "", time: "", memory: "" });
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const requiresInput =
    code.includes("cin") ||
    code.includes("scanf") ||
    code.includes("input(") ||
    code.includes("readline") ||
    code.includes("Console.ReadLine") ||
    code.includes("Scanner") ||
    code.includes("fmt.Scan");

  const currentLanguageLabel = useMemo(
    () => LANGUAGE_LABELS[language] || "Language",
    [language]
  );

  const currentAccent = useMemo(
    () => LANGUAGE_ACCENTS[language] || "#6366f1",
    [language]
  );

  const statusChipColor = useMemo(() => {
    if (!meta.status) return "default";
    return isError ? "error" : "success";
  }, [meta.status, isError]);

  const editorHeight = isMobile ? "380px" : "540px";

  /* ================= KEYBOARD SHORTCUT ================= */

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        runCode();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  /* ================= RUN CODE ================= */

  const runCode = async () => {
    if (!code.trim()) {
      setIsError(true);
      setOutput("⚠️ Please write some code first.");
      return;
    }

    setLoading(true);
    setOutput("");
    setIsError(false);

    try {
      const res = await api.post("/api/ide/run/", {
        language,
        code,
        input,
      });

      const data = res.data;

      setMeta({
        status: data.status?.description || "",
        time: data.time || "",
        memory: data.memory || "",
      });

      if (data.stderr) {
        setIsError(true);
        setOutput(data.stderr);
      } else if (data.compile_output) {
        setIsError(true);
        setOutput(data.compile_output);
      } else {
        setIsError(false);
        setOutput(data.stdout || "Program executed successfully.");
      }
    } catch (err) {
      setIsError(true);
      setOutput("Execution failed. Please check backend.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DOWNLOAD ================= */

  const downloadCode = () => {
    const ext = EXT_MAP[language] || "txt";
    const blob = new Blob([code], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `snippet.${ext}`;
    link.click();
  };

  const copyOutput = () => navigator.clipboard.writeText(output || "");
  const clearOutput = () => setOutput("");

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
    setOutput("");
    setMeta({ status: "", time: "", memory: "" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2, md: 3 },
        background:
          "radial-gradient(circle at top left, rgba(99,102,241,0.10), transparent 22%), radial-gradient(circle at top right, rgba(124,58,237,0.08), transparent 20%), linear-gradient(180deg, #f8fbff 0%, #f7f5ff 48%, #f8fafc 100%)",
      }}
    >
      <Box maxWidth="xl" mx="auto">
        {/* ================= HERO ================= */}

        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            p: { xs: 2.2, md: 3 },
            borderRadius: "28px",
            border: "1px solid rgba(99,102,241,0.10)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(247,244,255,0.96) 100%)",
            boxShadow: "0 18px 50px rgba(99,102,241,0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: -60,
              top: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(99,102,241,0.08)",
              filter: "blur(38px)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: -60,
              bottom: -70,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(124,58,237,0.08)",
              filter: "blur(42px)",
              pointerEvents: "none",
            }}
          />

          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", lg: "center" }}
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={1.6} alignItems="flex-start">
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: "18px",
                  background: `linear-gradient(135deg, ${alpha(
                    currentAccent,
                    0.92
                  )}, #6366f1)`,
                  boxShadow: "0 14px 30px rgba(99,102,241,0.20)",
                }}
              >
                <CodeIcon sx={{ fontSize: 28 }} />
              </Avatar>

              <Box>
                <Chip
                  icon={<AutoAwesomeRoundedIcon />}
                  label="Interactive Coding Workspace"
                  sx={{
                    mb: 1.25,
                    borderRadius: "999px",
                    bgcolor: "rgba(99,102,241,0.08)",
                    color: "#4f46e5",
                    fontWeight: 800,
                    border: "1px solid rgba(99,102,241,0.12)",
                  }}
                />

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 950,
                    letterSpacing: -0.8,
                    color: "#0f172a",
                    lineHeight: 1.12,
                    mb: 0.8,
                    fontSize: { xs: "1.8rem", md: "2.25rem" },
                  }}
                >
                  Learnify IDE
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    lineHeight: 1.8,
                    maxWidth: 760,
                  }}
                >
                  Write, run, test, and inspect your code in a cleaner workspace
                  that feels closer to a real compiler and modern online editor.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={<KeyboardCommandKeyRoundedIcon />}
                label="Ctrl + Enter to run"
                sx={heroChipStyle}
              />
              <Chip
                icon={<TerminalRoundedIcon />}
                label={currentLanguageLabel}
                sx={{
                  ...heroChipStyle,
                  bgcolor: alpha(currentAccent, 0.10),
                  color: currentAccent === "#f7df1e" ? "#111827" : currentAccent,
                  border: `1px solid ${alpha(currentAccent, 0.20)}`,
                }}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* ================= MAIN IDE SHELL ================= */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: "30px",
            overflow: "hidden",
            border: "1px solid rgba(15,23,42,0.06)",
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(248,250,252,0.96))",
            boxShadow: "0 20px 60px rgba(15,23,42,0.07)",
          }}
        >
          {/* ================= TOP APP BAR ================= */}

          <Box
            sx={{
              px: { xs: 1.5, md: 2.2 },
              py: 1.4,
              borderBottom: "1px solid rgba(15,23,42,0.06)",
              background:
                "linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,0.95) 100%)",
            }}
          >
            <Stack
              direction={{ xs: "column", xl: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", xl: "center" }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.2}
                alignItems={{ xs: "stretch", md: "center" }}
                sx={{ flex: 1 }}
              >
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  size="small"
                  IconComponent={ExpandMoreRoundedIcon}
                  sx={{
                    minWidth: 180,
                    borderRadius: "14px",
                    bgcolor: "rgba(255,255,255,0.9)",
                    fontWeight: 700,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(15,23,42,0.10)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(currentAccent, 0.35),
                    },
                  }}
                >
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="javascript">JavaScript</MenuItem>
                  <MenuItem value="java">Java</MenuItem>
                  <MenuItem value="c">C</MenuItem>
                  <MenuItem value="cpp">C++</MenuItem>
                  <MenuItem value="csharp">C#</MenuItem>
                  <MenuItem value="php">PHP</MenuItem>
                  <MenuItem value="go">Go</MenuItem>
                  <MenuItem value="swift">Swift</MenuItem>
                </Select>

                <Button
                  variant="contained"
                  startIcon={
                    loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <PlayArrowIcon />
                  }
                  onClick={runCode}
                  disabled={loading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: "14px",
                    px: 2.2,
                    py: 1.05,
                    background: `linear-gradient(135deg, ${alpha(
                      currentAccent,
                      0.95
                    )}, #6366f1)`,
                    boxShadow: "0 12px 28px rgba(99,102,241,0.24)",
                    "&:hover": {
                      background: `linear-gradient(135deg, ${alpha(
                        currentAccent,
                        1
                      )}, #4f46e5)`,
                    },
                  }}
                >
                  Run Code
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={downloadCode}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    borderRadius: "14px",
                    px: 2,
                    py: 1,
                    borderColor: "rgba(15,23,42,0.10)",
                    color: "#334155",
                    bgcolor: "rgba(255,255,255,0.85)",
                    "&:hover": {
                      borderColor: alpha(currentAccent, 0.30),
                      bgcolor: alpha(currentAccent, 0.03),
                    },
                  }}
                >
                  Download
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                justifyContent={{ xs: "flex-start", xl: "flex-end" }}
              >
                {meta.status && (
                  <Chip
                    label={meta.status}
                    color={statusChipColor}
                    icon={
                      isError ? (
                        <ErrorOutlineRoundedIcon />
                      ) : (
                        <CheckCircleRoundedIcon />
                      )
                    }
                    sx={{
                      borderRadius: "999px",
                      fontWeight: 800,
                    }}
                  />
                )}

                {meta.time && (
                  <Chip
                    icon={<BoltRoundedIcon />}
                    label={`${meta.time}s`}
                    sx={metaChipStyle}
                  />
                )}

                {meta.memory && (
                  <Chip
                    icon={<MemoryRoundedIcon />}
                    label={`${meta.memory} KB`}
                    sx={metaChipStyle}
                  />
                )}
              </Stack>
            </Stack>
          </Box>

          {/* ================= MAIN CONTENT ================= */}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", xl: "1fr 380px" },
              minHeight: { xs: "auto", xl: 760 },
            }}
          >
            {/* ================= LEFT SIDE / EDITOR ================= */}

            <Box
              sx={{
                minWidth: 0,
                borderRight: { xs: "none", xl: "1px solid rgba(15,23,42,0.06)" },
                display: "flex",
                flexDirection: "column",
                background: "#0b1220",
              }}
            >
              {/* editor top bar */}
              <Box
                sx={{
                  px: 2,
                  py: 1.2,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  background:
                    "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(11,18,32,0.96))",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Stack direction="row" spacing={1.1} alignItems="center">
                    <Box sx={{ display: "flex", gap: 0.8 }}>
                      <Box
                        sx={{
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          bgcolor: "#ef4444",
                        }}
                      />
                      <Box
                        sx={{
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          bgcolor: "#f59e0b",
                        }}
                      />
                      <Box
                        sx={{
                          width: 11,
                          height: 11,
                          borderRadius: "50%",
                          bgcolor: "#22c55e",
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        color: "#cbd5e1",
                        fontWeight: 700,
                        fontSize: 13,
                        ml: 0.5,
                      }}
                    >
                      main.{EXT_MAP[language]}
                    </Typography>
                  </Stack>

                  <Chip
                    size="small"
                    icon={<DataObjectRoundedIcon />}
                    label={currentLanguageLabel}
                    sx={{
                      borderRadius: "999px",
                      fontWeight: 700,
                      color: "#e2e8f0",
                      bgcolor: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </Stack>
              </Box>

              {/* editor */}
              <Box sx={{ flex: 1 }}>
                <Editor
                  height={editorHeight}
                  language={EDITOR_LANG[language]}
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    mouseWheelZoom: true,
                    smoothScrolling: true,
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    roundedSelection: true,
                    padding: { top: 18, bottom: 18 },
                    lineNumbersMinChars: 3,
                    tabSize: 2,
                    wordWrap: "on",
                  }}
                />
              </Box>
            </Box>

            {/* ================= RIGHT SIDE / PANELS ================= */}

            <Box
              sx={{
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                background:
                  "linear-gradient(180deg, rgba(252,253,255,0.98), rgba(247,248,252,0.98))",
              }}
            >
              {/* info card */}
              <Box sx={{ p: 1.5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.8,
                    borderRadius: "20px",
                    border: "1px solid rgba(15,23,42,0.06)",
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,244,255,0.95))",
                    boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" mb={1}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "14px",
                        bgcolor: alpha(currentAccent, 0.12),
                        color:
                          currentAccent === "#f7df1e" ? "#111827" : currentAccent,
                      }}
                    >
                      <TipsAndUpdatesRoundedIcon fontSize="small" />
                    </Avatar>

                    <Box>
                      <Typography fontWeight={900} color="#0f172a">
                        Workspace Ready
                      </Typography>
                      <Typography fontSize={13} color="#64748b">
                        Code, run, inspect output, and test input quickly.
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label="Real-time editing"
                      sx={sideMiniChip}
                    />
                    <Chip
                      size="small"
                      label="Compiler output"
                      sx={sideMiniChip}
                    />
                    <Chip
                      size="small"
                      label="Input support"
                      sx={sideMiniChip}
                    />
                  </Stack>
                </Paper>
              </Box>

              {/* stdin */}
              {requiresInput && (
                <Box sx={{ px: 1.5, pb: 1.5 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: "20px",
                      border: "1px solid rgba(15,23,42,0.06)",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.88)",
                      boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.6,
                        py: 1.2,
                        borderBottom: "1px solid rgba(15,23,42,0.06)",
                        background:
                          "linear-gradient(180deg, rgba(248,250,252,0.95), rgba(255,255,255,0.95))",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <InputRoundedIcon
                            sx={{ fontSize: 18, color: "#6366f1" }}
                          />
                          <Typography fontWeight={800} color="#0f172a">
                            Program Input (stdin)
                          </Typography>
                        </Stack>

                        <Chip
                          size="small"
                          label="Optional"
                          sx={sideMiniChip}
                        />
                      </Stack>
                    </Box>

                    <Box sx={{ p: 1.4 }}>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Example:
5 7
or
John
25"
                        style={{
                          width: "100%",
                          minHeight: "120px",
                          resize: "vertical",
                          borderRadius: "16px",
                          border: "1px solid rgba(15,23,42,0.08)",
                          padding: "14px",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                          fontSize: "14px",
                          background: "#0f172a",
                          color: "#e2e8f0",
                          outline: "none",
                          lineHeight: 1.6,
                          boxSizing: "border-box",
                        }}
                      />
                    </Box>
                  </Paper>
                </Box>
              )}

              {/* output */}
              <Box sx={{ px: 1.5, pb: 1.5, flex: 1, display: "flex", minHeight: 0 }}>
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid rgba(15,23,42,0.06)",
                    boxShadow: "0 10px 26px rgba(15,23,42,0.04)",
                    minHeight: 280,
                  }}
                >
                  <Box
                    sx={{
                      px: 1.6,
                      py: 1.2,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      background:
                        "linear-gradient(180deg, rgba(15,23,42,0.97), rgba(11,18,32,0.97))",
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TerminalRoundedIcon
                          sx={{ color: "#94a3b8", fontSize: 19 }}
                        />
                        <Typography
                          sx={{
                            color: "#e2e8f0",
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          Output Terminal
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Copy Output">
                          <IconButton
                            size="small"
                            onClick={copyOutput}
                            sx={{
                              color: "#94a3b8",
                              bgcolor: "rgba(255,255,255,0.04)",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.08)",
                              },
                            }}
                          >
                            <ContentCopyIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Clear Output">
                          <IconButton
                            size="small"
                            onClick={clearOutput}
                            sx={{
                              color: "#94a3b8",
                              bgcolor: "rgba(255,255,255,0.04)",
                              "&:hover": {
                                bgcolor: "rgba(255,255,255,0.08)",
                              },
                            }}
                          >
                            <ClearIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      bgcolor: "#020617",
                      color: isError ? "#f87171" : "#4ade80",
                      p: 2,
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: 14,
                      lineHeight: 1.7,
                      overflow: "auto",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1.2 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: isError ? "#ef4444" : "#22c55e",
                          boxShadow: isError
                            ? "0 0 0 4px rgba(239,68,68,0.10)"
                            : "0 0 0 4px rgba(34,197,94,0.10)",
                        }}
                      />
                      <Typography
                        sx={{
                          color: "#94a3b8",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {output === null
                          ? "Awaiting execution..."
                          : isError
                            ? "Execution returned an error"
                            : "Execution completed"}
                      </Typography>
                    </Stack>

                    <Divider
                      sx={{
                        mb: 1.5,
                        borderColor: "rgba(148,163,184,0.16)",
                      }}
                    />

                    <Box sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {output === null
                        ? "Program output will appear here..."
                        : output}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

const heroChipStyle = {
  borderRadius: "999px",
  fontWeight: 800,
  bgcolor: "rgba(255,255,255,0.76)",
  color: "#334155",
  border: "1px solid rgba(15,23,42,0.08)",
};

const metaChipStyle = {
  borderRadius: "999px",
  fontWeight: 800,
  bgcolor: "rgba(99,102,241,0.08)",
  color: "#4f46e5",
  border: "1px solid rgba(99,102,241,0.12)",
};

const sideMiniChip = {
  borderRadius: "999px",
  fontWeight: 700,
  bgcolor: "rgba(99,102,241,0.06)",
  color: "#4f46e5",
  border: "1px solid rgba(99,102,241,0.10)",
};