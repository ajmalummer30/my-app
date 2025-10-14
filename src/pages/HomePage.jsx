import React from "react";
import { NavLink } from "react-router-dom";

export default function HomePage() {
  const containerStyle = {
    height: "100vh",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: "0 10vw",
  };

  const boxStyle = {
    width: "30vh",
    height: "30vh",
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    fontSize: "1.5rem",
    fontWeight: "bold",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    cursor: "pointer",
    userSelect: "none",
  };

  const imgStyle = {
    width: "70%", // roughly fits inside 30vh box
    height: "auto",
    marginBottom: 15,
  };

  return (
    <div style={containerStyle}>
      <NavLink
        to="/start-scan"
        style={boxStyle}
        activeStyle={{ backgroundColor: "#0056b3" }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/1828/1828884.png" // scanner icon example
          alt="Start Scan"
          style={imgStyle}
        />
        Start Scan
      </NavLink>

      <NavLink
        to="/add-manually"
        style={boxStyle}
        activeStyle={{ backgroundColor: "#0056b3" }}
      >
        <img
          src="https://cdn-icons-png.flaticon.com/512/1828/1828911.png" // add icon example
          alt="Add Manually"
          style={imgStyle}
        />
        Add Manually
      </NavLink>
    </div>
  );
}
