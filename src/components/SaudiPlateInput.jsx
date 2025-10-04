import * as React from "react";
import { Box, styled } from "@mui/system";

const englishLetters = [
  "A",
  "B",
  "D",
  "E",
  "G",
  "H",
  "J",
  "K",
  "L",
  "N",
  "R",
  "S",
  "T",
  "U",
  "V",
  "X",
  "Z",
];
const arabicLetters = [
  "ا",
  "ب",
  "د",
  "ه",
  "ج",
  "ح",
  "خ",
  "س",
  "ص",
  "ط",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ر",
  "ش",
  "ت",
];
export default function SaudiPlateInput({ onChange, lang }) {
  const allowedLetters = lang === "ar" ? arabicLetters : englishLetters;
  const [letters, setLetters] = React.useState(["", "", ""]);
  const [numbers, setNumbers] = React.useState(["", "", "", ""]);
  const numberRefs = React.useRef([]);
  const letterRefs = React.useRef([]);

  const handleLetterChange = (i, value) => {
    const arr = [...letters];
    arr[i] = value;
    setLetters(arr);
    triggerOnChange(arr, numbers);
  };

  const handleNumberChange = (i, value) => {
    if (!/^[0-9]?$/.test(value)) return;
    const arr = [...numbers];
    arr[i] = value;
    setNumbers(arr);
    triggerOnChange(letters, arr);

    if (value && i < numberRefs.current.length - 1) {
      numberRefs.current[i + 1]?.focus();
    }
  };

  const handleNumberKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const arr = [...numbers];
      if (arr[i]) {
        arr[i] = "";
        setNumbers(arr);
        triggerOnChange(letters, arr);
      } else if (i > 0) {
        numberRefs.current[i - 1]?.focus();
        arr[i - 1] = "";
        setNumbers(arr);
        triggerOnChange(letters, arr);
      }
    }
  };

  const handleLetterKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const arr = [...letters];
      if (arr[i]) {
        // Clear current select value
        arr[i] = "";
        setLetters(arr);
        triggerOnChange(arr, numbers);
      } else if (i > 0) {
        // Move focus back and clear previous select value
        letterRefs.current[i - 1]?.focus();
        arr[i - 1] = "";
        setLetters(arr);
        triggerOnChange(arr, numbers);
      }
    }
  };

  const triggerOnChange = (lettersArr, numbersArr) => {
    const plate = `${lettersArr.join("")}-${numbersArr.join("")}`;
    onChange?.(plate);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <StyledPlateBox>
        <PlateSection>
          {numbers.map((num, idx) => (
            <StyledInput
              key={idx}
              type="text"
              maxLength={1}
              value={num}
              inputMode="numeric"
              onChange={(e) => handleNumberChange(idx, e.target.value)}
              onKeyDown={(e) => handleNumberKeyDown(idx, e)}
              ref={(el) => (numberRefs.current[idx] = el)}
            />
          ))}
        </PlateSection>

        <PlateSection>
          {letters.map((ltr, idx) => (
            <StyledSelect
              key={idx}
              value={ltr}
              onChange={(e) => handleLetterChange(idx, e.target.value)}
              onKeyDown={(e) => handleLetterKeyDown(idx, e)}
              ref={(el) => (letterRefs.current[idx] = el)}
            >
              <option value="" disabled>
                -
              </option>
              {allowedLetters.map((L) => (
                <option key={L} value={L}>
                  {L}
                </option>
              ))}
            </StyledSelect>
          ))}
        </PlateSection>
      </StyledPlateBox>
    </Box>
  );
}

const StyledPlateBox = styled(Box)({
  display: "flex",
  flexWrap: "nowrap",
  gap: "6px",
  padding: "6px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  backgroundColor: "#fdfdfd",
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 180,
});

const PlateSection = styled(Box)({
  display: "flex",
  gap: "4px",
});
const StyledInput = styled("input")(({ theme }) => ({
  width: 35,
  height: 32,
  textAlign: "center",
  fontSize: "0.85rem",
  fontWeight: "bold",
  border: "1px solid #999",
  borderRadius: 4,
  backgroundColor: "#fff",
  "&:focus": {
    borderColor: "#1976d2",
    outline: "none",
  },
  [theme.breakpoints.down("sm")]: {
    width: 28,
    height: 28,
    fontSize: "0.75rem",
  },
}));

const StyledSelect = styled("select")(({ theme }) => ({
  width: 36,
  height: 32,
  textAlign: "center",
  fontSize: "0.85rem",
  fontWeight: "bold",
  border: "1px solid #999",
  borderRadius: 4,
  backgroundColor: "#fff",
  "&:focus": {
    borderColor: "#1976d2",
    outline: "none",
  },
  [theme.breakpoints.down("sm")]: {
    width: 30,
    height: 28,
    fontSize: "0.75rem",
  },
}));
