import { saveAs } from "file-saver";
import { toast } from 'react-toastify';


const exportVisitsToCSV = (visits) => {
  if (!visits || visits.length === 0) {
    toast.info("No visits to export");
    return;
  }

  // Transform data for CSV
  const csvData = visits.map((visit) => ({
    Name: visit.name,
    Mobile: visit.mobile,
    VehicleType: visit.vehicleType || "",
    VehiclePlateNumber:
      visit.vehicleType?.toLowerCase() === "walk"
        ? "" // show empty for walk
        : visit.vehicleplatenumber || "", // show empty if null/blank
    CheckInTime: visit.checkInTime
      ? new Date(visit.checkInTime.seconds * 1000).toLocaleString()
      : "",
    CheckOutTime: visit.checkOutTime
      ? new Date(visit.checkOutTime.seconds * 1000).toLocaleString()
      : "",
  }));

  // Convert to CSV string
  const header = Object.keys(csvData[0]).join(",");
  const rows = csvData
    .map((row) => Object.values(row).map((val) => `"${val}"`).join(","))
    .join("\n");

  const csvContent = `${header}\n${rows}`;

  // Save file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "visits_export.csv");

  toast.success("✅ Visits exported successfully!");
};

export default exportVisitsToCSV;