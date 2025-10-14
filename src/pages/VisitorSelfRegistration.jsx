import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../Helperfunctions/languageswitcher";
import { MuiTelInput } from "mui-tel-input";
import TextField from "@mui/material/TextField";
import { auth } from "../components/Firebase";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";

export default function VisitorSelfRegistration() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar" || i18n.language === "ar-SA";
  const [useEmail, setUseEmail] = useState(true); // toggle state
  const [phoneNumber, setPhoneNumber] = useState(""); // mobile number
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          // reCAPTCHA solved, you can proceed with OTP send
        },
        "expired-callback": () => {
          alert("reCAPTCHA expired. Please try again.");
        },
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!useEmail) {
      // Mobile mode: Send OTP
      if (!phoneNumber) {
        alert("Please enter a valid phone number.");
        return;
      }

      try {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        const result = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          appVerifier
        );
        setConfirmationResult(result);
        setOtpSent(true);
        alert("OTP has been sent to your phone!");
        startTimer(); // <-- add this here!

        // Later: You can verify using result.confirm(otpCode)
      } catch (error) {
        console.error("Error sending OTP:", error);
        alert("Failed to send OTP: " + error.message);
      }
    } else {
      // Email mode: no OTP (you can handle actual email logic later)
      alert("Email login not implemented yet.");
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter OTP");
      return;
    }
    try {
      const userCredential = await confirmationResult.confirm(otp);
      alert("Phone number verified successfully!");

      // Immediately sign out so user is NOT authenticated
      await signOut(auth);

      // Now proceed with visitor registration with userCredential.user.phoneNumber
      console.log("Verified phone:", userCredential.user.phoneNumber);

      // Reset states or navigate to next step in your flow
      setOtpSent(false);
      setPhoneNumber("");
      setOtp("");
      setConfirmationResult(null);

      // TODO: Your visitor registration logic here
    } catch (error) {
      console.error("OTP verification failed:", error);
      alert("Invalid OTP, please try again.");
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (timer === 0) {
      if (!phoneNumber) {
        alert("Please enter a valid phone number.");
        return;
      }

      try {
        setupRecaptcha();
        const appVerifier = window.recaptchaVerifier;

        const result = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          appVerifier
        );
        setConfirmationResult(result);
        alert("OTP has been resent to your phone!");

        startTimer(); // Restart countdown
      } catch (error) {
        console.error("Error resending OTP:", error);
        alert("Failed to resend OTP: " + error.message);
      }
    }
  };

  // Start/resume the timer
  const startTimer = () => {
    setTimer(60); // Reset
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // Initialize RecaptchaVerifier once on mount
  useEffect(() => {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA solved");
        },
        "expired-callback": () => {
          alert("reCAPTCHA expired. Please try again.");
        },
      }
    );
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, [])

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white dark:bg-gray-900">
        <body class="h-full">
        ```
      */}
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto dark:hidden"
          />
          <img
            alt="Your Company"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
            className="mx-auto h-10 w-auto not-dark:hidden"
          />
          <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
            Welcome to SATS Self Visitor registration portal
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {/* Toggle Button */}
          <div className="mb-6 text-center">
            <button
              type="button"
              onClick={() => setUseEmail(!useEmail)}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              {useEmail
                ? "Use mobile number instead"
                : "Use email address instead"}
            </button>
          </div>
          <form
            action="#"
            method="POST"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Input */}
            <div>
              {useEmail ? (
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
                  >
                    Email address
                  </label>
                  <div className="mt-2">
                    <TextField
                      type="email"
                      name="email"
                      placeholder="Email"
                      label="Email"
                      id="outlined-basic"
                      variant="outlined"
                      fullWidth
                    />
                  </div>
                </div>
              ) : (
                !otpSent && (
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm/6 font-medium text-gray-900 dark:text-gray-100"
                    >
                      Mobile number
                    </label>
                    <div className="mt-2">
                      <MuiTelInput
                        defaultCountry="SA"
                        onlyCountries={["SA"]}
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        dir={i18n.language === "ar" ? "rtl" : "ltr"}
                        placeholder={
                          isArabic ? "أدخل رقم الجوال" : "Enter phone number"
                        }
                        forceCallingCode
                        focusOnSelectCountry
                        disableFormatting={true}
                        fullWidth
                        variant="outlined"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            backgroundColor: "#fff",
                            "& .MuiInputBase-input": {
                              paddingY: 1.5,
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            {(useEmail || (!useEmail && !otpSent)) && (
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  {useEmail ? "Sign in with Email" : "Send OTP"}
                </button>
              </div>
            )}

            {otpSent && (
              <>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  className="mt-4 w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  onClick={verifyOtp}
                  className="mt-2 w-full justify-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-500"
                >
                  Verify OTP
                </button>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={timer > 0}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      timer > 0
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-yellow-500 text-white hover:bg-yellow-400"
                    }`}
                  >
                    Resend OTP
                  </button>
                  <span className="text-sm text-gray-500">
                    {timer > 0
                      ? `Resend available in ${timer}s`
                      : "You can resend now"}
                  </span>
                </div>
              </>
            )}
          </form>
          <div id="recaptcha-container"></div>
        </div>
      </div>
    </>
  );
}
