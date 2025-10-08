import * as React from "react";
import { useTranslation } from "react-i18next";
import { Select, MenuItem, Box, Typography } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import CommuteIcon from "@mui/icons-material/Commute";

const vehicleTypes = [
  {
    value: "taxi",
    labelKey: "vehicleType.taxi",
    icon: <LocalTaxiIcon sx={{ color: "#34a853" }} />,
  },
  {
    value: "privatecar",
    labelKey: "vehicleType.privateCar",
    icon: <DirectionsCarIcon sx={{ color: "#4285f4" }} />,
  },
  {
    value: "truck",
    labelKey: "vehicleType.truck",
    icon: <LocalShippingIcon sx={{ color: "#fdd835" }} />,
  },
  {
    value: "dyna",
    labelKey: "vehicleType.dyna",
    icon: <AirportShuttleIcon sx={{ color: "#ea4335" }} />,
  },
  {
    value: "bus",
    labelKey: "vehicleType.bus",
    icon: <DirectionsBusIcon sx={{ color: "#ff7043" }} />,
  },
  {
    value: "minibus",
    labelKey: "vehicleType.minibus",
    icon: <CommuteIcon sx={{ color: "#ab47bc" }} />,
  },
];

export default function VehicleTypeSelect({ value, onChange }) {
  const { t } = useTranslation();

  const selectedVehicle = vehicleTypes.find((type) => type.value === value);

  return (
    <Select
      value={value}
      onChange={onChange}
      displayEmpty
      fullWidth
      sx={{ minWidth: 180, height: "auto", fontWeight: "bold" }}
      renderValue={(selected) => {
        if (!selected) {
          return (
            <em style={{ fontStyle: "normal", fontWeight: "normal" }}>
              {t("vehicleType.selectPlaceholder")}
            </em>
          );
        }
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {selectedVehicle?.icon}
            <Typography>{t(selectedVehicle?.labelKey)}</Typography>
          </Box>
        );
      }}
    >
      <MenuItem value="" disabled>
        <em>{t("vehicleType.selectPlaceholder")}</em>
      </MenuItem>
      {vehicleTypes.map(({ value, labelKey, icon }) => (
        <MenuItem key={value} value={value}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon}
            <Typography>{t(labelKey)}</Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  );
}
