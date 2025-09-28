import React, { useState } from "react";
import { auth } from "../components/Firebase"; // make sure this exports getAuth(app)
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const PhoneAuth = () => {
  const [phone, setPhone] = useState("+966");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const setupRecaptcha = async () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "normal",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
        }
      );
      await window.recaptchaVerifier.render(); // <- Important
    }
  };

  const sendOtp = async () => {
    try {
      await setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      alert("OTP sent successfully!");
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert("Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const result = await confirmationResult.confirm(otp);
      alert("Phone verified!");
      console.log("User:", result.user);
    } catch (err) {
      console.error("OTP verification error:", err);
      alert("Failed to verify OTP");
    }
  };

  return (
    <div>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+9665XXXXXXX"
      />
      <button onClick={sendOtp}>Send OTP</button>

      {confirmationResult && (
        <>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}

      <div id="recaptcha-container"></div>
    </div>
  );
};

export default PhoneAuth;
