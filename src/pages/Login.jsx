import React from "react";
import { auth, provider } from "../components/Firebase";
import { signInWithPopup } from "firebase/auth";
import { useSetAtom, useAtomValue } from "jotai";
import { userAtom, isLoggedInAtom } from "../store/AuthAtom";
import { useState } from "react";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../components/Firebase"; // adjust the path
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { loginWithEmailPassword } from "../Helperfunctions/authhelper";

export default function Login() {
  const { t } = useTranslation();
  const [errorMsg, setErrorMsg] = useState("");
  const setUser = useSetAtom(userAtom);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async (e) => {
    e.preventDefault(); // prevents navigation if it's a real link
    setErrorMsg("");

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.log("true");
        // New user, create profile with isAdminApproved false
        /* await setDoc(userRef, {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          role: "user",
          isAdminApproved: false, 
          createdAt: serverTimestamp(),
          photoURL: firebaseUser.photoURL,
        }); */
        setErrorMsg("User does not exist. Please contact admin.");
        return;
      }

      // Force refresh token to get latest claims (important for isAdmin)
      //await firebaseUser.getIdToken(true);

      // Get user profile data
      const userData = (await getDoc(userRef)).data();

      /* if (!userData.isAdminApproved) {
      setErrorMsg("Your account is awaiting admin approval.");
      // Optionally sign out user here or prevent further access
      return ;
    } */

      const combinedUser = { ...firebaseUser, ...userData };
      setUser(combinedUser);
      navigate("/app/addvisitor");
      console.log("setuser from login page");
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      switch (error.code) {
        case "auth/user-disabled":
          setErrorMsg(
            "Your account has been disabled. Please contact support."
          );
          break;
        case "auth/popup-closed-by-user":
          setErrorMsg(
            "Sign-in popup closed before completing. Please try again."
          );
          break;
        case "auth/network-request-failed":
          setErrorMsg("Network error. Please check your internet connection.");
          break;
        default:
          setErrorMsg("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const combinedUser = await loginWithEmailPassword(email, password);
      setUser(combinedUser);
      navigate("/app");
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          setErrorMsg("No user found with this email.");
          break;
        case "auth/wrong-password":
          setErrorMsg("Incorrect password.");
          break;
        case "auth/invalid-email":
          setErrorMsg("Invalid email format.");
          break;
        case "auth/invalid-credential":
          setErrorMsg("Invalid email or password.");
          break;
        default:
          setErrorMsg("Login failed. Please try again.");
      }
    }
  };

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-50 dark:bg-gray-900">
        <body class="h-full">
        ```
      */}
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
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
          <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
            {t("Sign in to your account")}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12 dark:bg-gray-800/50 dark:shadow-none dark:outline dark:-outline-offset-1 dark:outline-white/10">
            <form
              onSubmit={handleEmailLogin}
              method="POST"
              className="space-y-6"
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="flex h-6 shrink-0 items-center">
                    <label
                      htmlFor="remember-me"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="group grid size-4 grid-cols-1">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:checked:border-indigo-500 dark:checked:bg-indigo-500 dark:indeterminate:border-indigo-500 dark:indeterminate:bg-indigo-500 dark:focus-visible:outline-indigo-500 forced-colors:appearance-auto"
                        />
                        <svg
                          fill="none"
                          viewBox="0 0 14 14"
                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25 dark:group-has-disabled:stroke-white/25"
                        >
                          <path
                            d="M3 8L6 11L11 3.5"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-checked:opacity-100"
                          />
                          <path
                            d="M3 7H11"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-indeterminate:opacity-100"
                          />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-white">
                        Remember me
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </form>
            {/* google login section */}

            <div>
              <div className="mt-10 flex items-center gap-x-6">
                <div className="w-full flex-1 border-t border-gray-200 dark:border-white/10" />
                <p className="text-sm/6 font-medium text-nowrap text-gray-900 dark:text-white">
                  Or continue with
                </p>
                <div className="w-full flex-1 border-t border-gray-200 dark:border-white/10" />
              </div>

              <div className="mt-6 flex justify-center">
                <a
                  onClick={handleGoogleLogin}
                  href="#"
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 focus-visible:inset-ring-transparent dark:bg-white/10 dark:text-white dark:shadow-none dark:inset-ring-white/5 dark:hover:bg-white/20"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                      fill="#34A853"
                    />
                  </svg>
                  <span className="text-sm/6 font-semibold">Google</span>
                </a>
              </div>
              {errorMsg && <div className="text-red-500 mt-2">{errorMsg}</div>}
            </div>

            {/* Add phone login button below */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  // Navigate to phone login route
                  // if using React Router:
                  navigate("/phonelogin");

                  // Or simple redirect:
                  //window.location.href = "/phone-login";
                }}
                className="w-full max-w-sm rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Login with Phone
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm/6 text-gray-500 dark:text-gray-400">
            Not a member?{" "}
            <a
              href="#"
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Start a 14 day free trial
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
