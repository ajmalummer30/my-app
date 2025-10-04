import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
// import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"; // Uncomment if you want the arrow icon

const languages = [
  {
    code: "en",
    name: "English",
    country_code: "us",
    flag: "🇺🇸",
  },
  {
    code: "ar",
    name: "العربية",
    country_code: "sa",
    flag: "🇸🇦",
  },
];

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const currentLang =
    languages.find((l) => l.code === i18n.language) || languages[0];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    handleClose();
  };

  // Removed useEffect for setting lang/dir here because it is handled globally in i18n.js

  return (
    <>
      <Button
        color="inherit"
        onClick={handleClick}
        // endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />} // smaller arrow, uncomment if needed
        startIcon={
          <span style={{ fontSize: "1.2rem" }}>{currentLang.flag}</span>
        }
        sx={{
          textTransform: "none",
          bgcolor: "background.black",
          color: "text.primary",
          borderRadius: 1,
          px: 1.5, // less horizontal padding
          py: 0.5, // less vertical padding
          fontSize: "0.875rem", // smaller font size
          minWidth: "auto", // button shrinks to content width
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
      >
        {/* {currentLang.name} */}
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {languages.map(({ code, name, flag }) => (
          <MenuItem
            key={code}
            selected={code === currentLang.code}
            onClick={() => changeLanguage(code)}
          >
            <ListItemIcon>
              <span style={{ fontSize: "1.5rem" }}>{flag}</span>
            </ListItemIcon>
            <ListItemText>{name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageSwitcher;
