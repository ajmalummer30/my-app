import React from "react";
import { Box, FormControl, FormHelperText, TextField } from "@mui/material";
import VehicleTypeDropdown from "./VehicleTypeDropdown"; // adjust path as needed
import { useTranslation } from "react-i18next";

const VehicleInfoForm = ({
  visitor,
  error,
  handleVisitorChange,
  handleVehicleTypeChange,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div className="w-full">
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          mb: 2,
          width: "100%",
          alignItems: "flex-end",
        }}
      >
        {/* Vehicle type dropdown */}
        <FormControl fullWidth error={!!error.vehicleType}>
          <VehicleTypeDropdown
            value={visitor.vehicleType}
            onChange={handleVehicleTypeChange}
          />
          {error.vehicleType && (
            <FormHelperText>{error.vehicleType}</FormHelperText>
          )}
        </FormControl>

        {/* Vehicle plate number input */}
        <TextField
          label={
            <span>
              {t("Vehicle Number")} <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="vehicleplatenumber"
          value={visitor.vehicleplatenumber}
          onChange={handleVisitorChange}
          variant="outlined"
          error={!!error.vehicleplatenumber}
          helperText={error.vehicleplatenumber}
          placeholder={isArabic ? "د و ك ١٢٣٤" : "DUK1234"}
          fullWidth
          inputProps={{
            style: {
              direction: /^[\u0600-\u06FF]/.test(visitor.vehicleplatenumber)
                ? "rtl"
                : "ltr",
              textAlign: /^[\u0600-\u06FF]/.test(visitor.vehicleplatenumber)
                ? "right"
                : "left",
            },
            maxLength: 10,
          }}
        />
      </Box>
    </div>
  );
};

export default VehicleInfoForm;
