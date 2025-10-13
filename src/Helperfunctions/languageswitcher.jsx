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



function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const languages = [
  {
    code: "en",
    name: "English",
    country_code: "us",
    flagUrl: "https://flagcdn.com/w40/us.png",
  },
  {
    code: "ar",
    name: "العربية",
    country_code: "sa",
    flagUrl: "https://flagcdn.com/w40/sa.png",
  },
];

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
         // <span style={{ fontSize: "1.2rem" }}>{currentLang.flag}</span>
          <img
    src={currentLang.flagUrl}
    alt={currentLang.code}
    width="30"
    height="10"
    style={{ borderRadius: 2 }}
  /> 
          
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
        {languages.map(({ code, name, flagUrl }) => (
          <MenuItem
            key={code}
            selected={code === currentLang.code}
            onClick={() => changeLanguage(code)}
          >
            <ListItemIcon>
              {/* <span style={{ fontSize: "1.5rem" }}>{flag}</span> */}
             <img
    src={flagUrl}
    alt={code}
    width="20"
    height="14"
    style={{ borderRadius: 2 }}
  />
            </ListItemIcon>
            <ListItemText>{name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageSwitcher;
