import React, { useState, useEffect, useRef } from "react";
import { auth } from "../components/Firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { MuiTelInput } from "mui-tel-input";

const PhoneAuth = () => {
  const [phone, setPhone] = useState("+966");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);
  const timerRef = useRef(null);

  // Setup reCAPTCHA
  const setupRecaptcha = async () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
        }
      );
      await window.recaptchaVerifier.render();
    }
  };

  // Send OTP
  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      await setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setOtpSent(true);
      startTimer(); // Start countdown
      alert("OTP sent successfully!");
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert("Failed to send OTP");
    }
  };

  // Verify OTP
  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const result = await confirmationResult.confirm(otp);
      alert("Phone verified!");
      console.log("User:", result.user);
    } catch (err) {
      console.error("OTP verification error:", err);
      alert("Failed to verify OTP");
    }
  };

  // Resend OTP
  const resendOtp = async () => {
    if (timer === 0) {
      sendOtp(new Event("resend")); // Simulate event
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

  return (
    <div>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
            className="mx-auto h-10 w-auto dark:hidden"
          />
          <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="w-full"></div>
          <form className="space-y-6">
            {!otpSent && (
              <>
                <div>
                  <MuiTelInput
                    defaultCountry="SA"
                    value={phone}
                    onChange={(phone) => setPhone(phone)}
                    forceCallingCode
                    focusOnSelectCountry
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
                {/* <div className="w-full">
                  <PhoneInput
                    defaultCountry="sa"
                    value={phone}
                    onChange={(phone) => setPhone(phone)}
                    className="w-full"
                    inputClassName="!w-full !px-3 !py-2 !border !border-gray-300 !rounded-md"
                  />
                </div> */}
                <div>
                  <button
                    onClick={sendOtp}
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
                  >
                    Submit
                  </button>
                </div>
              </>
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
    </div>
  );
};

export default PhoneAuth;
