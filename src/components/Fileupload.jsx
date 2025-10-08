import { Box, Button, Typography, FormHelperText } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

function FileUploadSection({
  currentTab,
  handleFileChange,
  documents,
  t,
  submitted,
}) {
  const fileSelected = documents[currentTab]?.previewURL;

  return (
    <Box mt={2}>
      {/* Label */}
      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
        {t("uploadFile", { doc: t(currentTab) })}{" "}
        <span style={{ color: "red" }}>*</span>
      </Typography>

      {/* Upload Button */}
      <Button
        variant="outlined"
        component="label"
        startIcon={<UploadFileIcon />}
        fullWidth
        sx={{
          justifyContent: "flex-start",
          textTransform: "none",
          backgroundColor: "white",
          borderColor: "#d1d5db", // Tailwind's gray-300
          color: "text.primary",
          "&:hover": { backgroundColor: "#f9fafb" }, // Tailwind hover:bg-gray-50
        }}
      >
        {t("browse")}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFileChange(e, currentTab)}
        />
      </Button>

      {/* Show red error text after submit if no file selected */}
      {submitted && !fileSelected && (
        <FormHelperText error>{t("This field is required")}</FormHelperText>
      )}

      {/* Preview image */}
      {fileSelected && (
        <Box
          component="img"
          src={fileSelected}
          alt={`${currentTab} preview`}
          sx={{
            mt: 2,
            width: 192, // same as w-48
            height: 144, // same as h-36
            objectFit: "contain",
            border: "1px solid #d1d5db",
            borderRadius: 1,
            display: "block",
          }}
        />
      )}
    </Box>
  );
}

export default FileUploadSection;
