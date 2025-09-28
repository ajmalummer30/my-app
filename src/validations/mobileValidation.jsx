// src/validations/mobileValidation.js
import { mobileAtom, mobileErrorAtom } from "../store/mobileAtom";
import { useSetAtom } from "jotai";

export const useMobileValidation = () => {
  const setMobile = useSetAtom(mobileAtom);
  const setMobileError = useSetAtom(mobileErrorAtom);

  const handleMobileChange = (e) => {
    const value = e.target.value;

    // Allow only digits
    if (!/^\d*$/.test(value)) return;

    const trimmed = value.slice(0, 10);
    setMobile(trimmed);

    const error = validateMobile(trimmed);
    setMobileError(error);
  };

  return handleMobileChange;
};

// Pure validation logic
export const validateMobile = (value) => {
  if (!/^\d*$/.test(value)) {
    return "Mobile number must contain only digits.";
  }
  if (value.length > 10) {
    return "Mobile number cannot exceed 10 digits.";
  }
  if (value.length > 0 && value.length < 10) {
    return "Mobile number must be exactly 10 digits.";
  }
  return "";
};
