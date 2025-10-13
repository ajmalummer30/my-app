import React, { useEffect, useState } from "react";
import { db } from "./Firebase";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import VehicleInfoForm from "../components/VehicleInfoForm";
import { useTranslation } from "react-i18next";

// MUI Modal
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";


import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const VisitorsIDCards = (props) => {
  const { i18n, t } = useTranslation();
  const [getvisitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorStatus, setVisitorStatus] = useState({});
  const [userStation, setUserStation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
   const [vehicleInfo, setVehicleInfo] = useState({
    vehicleplatenumber: "",
    vehicleType: "",
  });
  const [vehicleError, setVehicleError] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const visitorsQuery = query(
      collection(db, "visitors"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(visitorsQuery, (snapshot) => {
      const visitorsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVisitors(visitorsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const visitsQuery = query(
      collection(db, "visits"),
      where("status", "==", "checked-in")
    );

    const unsubscribe = onSnapshot(visitsQuery, (snapshot) => {
      const statusMap = {};
      snapshot.docs.forEach((doc) => {
        const visit = doc.data();
        statusMap[visit.visitorId] = {
          status: "checked-in",
          visitId: doc.id,
        };
      });
      setVisitorStatus(statusMap);
      
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserStation = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserStation(userData.station || "Unknown");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user station:", error);
      }
    };

    fetchUserStation();
  }, []);

 const handleToggleVisit = async (visitor) => {
    const currentStatus = visitorStatus[visitor.id];

    if (currentStatus?.status === "checked-in") {
      // Check-out logic...
      try {
        const visitRef = doc(db, "visits", currentStatus.visitId);
        const visitSnap = await getDoc(visitRef);

        if (visitSnap.exists()) {
          const visitData = visitSnap.data();

          if (visitData.station !== userStation) {
            toast.warning("❌ You cannot check out this visitor. Station mismatch.");
            return;
          }

          await updateDoc(visitRef, {
            checkOutTime: serverTimestamp(),
            status: "checked-out",
          });

          setVisitorStatus(prev => ({
            ...prev,
            [visitor.id]: { status: "checked-out", visitId: null },
          }));

          toast.success(`✅ Checked out ${visitor.name}`);
        }
      } catch (error) {
        console.error("Check-out error:", error);
        toast.error("❌ Check-out failed.");
      }
    } else {
      // 🔥 Open modal for vehicle info on check-in
      setSelectedVisitor(visitor);
      setModalOpen(true);
    }
  };

   const handleSubmitVehicleInfo = async () => {
    // Basic validation
    const errors = {};
    if (!vehicleInfo.vehicleplatenumber) {
      errors.vehicleplatenumber = "Plate number is required";
    }
    if (!vehicleInfo.vehicleType) {
      errors.vehicleType = "Vehicle type is required";
    }

    if (Object.keys(errors).length > 0) {
      setVehicleError(errors);
      return;
    }

    try {
      await addDoc(collection(db, "visits"), {
        visitorId: selectedVisitor.id,
        name: selectedVisitor.name,
        mobile: selectedVisitor.Mobile,
        checkInTime: serverTimestamp(),
        checkOutTime: null,
        status: "checked-in",
        station: userStation || "Unknown",
        vehicleplatenumber: vehicleInfo.vehicleplatenumber,
        vehicleType: vehicleInfo.vehicleType,
      });

      setVisitorStatus(prev => ({
        ...prev,
        [selectedVisitor.id]: { status: "checked-in", visitId: null },
      }));

      toast.success(`✅ Checked in ${selectedVisitor.name}`);

      // Close modal & reset
      setModalOpen(false);
      setVehicleInfo({ vehicleplatenumber: "", vehicleType: "" });
      setVehicleError({});
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("❌ Check-in failed.");
    }
  };


  const handleVehicleChange = (e) => {

     const { name, value } = e.target;
      if (name === "vehicleplatenumber") {
    if (i18n.language.startsWith("ar")) {
      if (/^[\u0600-\u06FF0-9 ]*$/.test(value)) {
        setVehicleInfo((prev) => ({ ...prev, [name]: value }));
        setVehicleError((prev) => ({ ...prev, [name]: "" }));
      } else {
        setVehicleError((prev) => ({
          ...prev,
          [name]: "يرجى استخدام الأحرف العربية والأرقام الإنجليزية فقط",
        }));
      }
    } else {
      if (/^[A-Za-z0-9 ]*$/.test(value)) {
        setVehicleInfo((prev) => ({ ...prev, [name]: value }));
        setVehicleError((prev) => ({ ...prev, [name]: "" }));
      } else {
        setVehicleError((prev) => ({
          ...prev,
          [name]: "Please use English letters and numbers only",
        }));
      }
    }
    return;
  }

    setVehicleInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleVehicleTypeChange = (event) => {
    console.log("type" +event)
    setVehicleInfo((prev) => ({
      ...prev,
      vehicleType: event.target.value,
    }));
  };

  return (
    <div className="w-full flex justify-center">
     
      <div className="max-h-auto overflow-y-auto w-full  px-4">
         <div className="my-4 px-4">
              <input
                type="text"
                placeholder="Search by name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              />
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-6 w-auto  px-4">

          
          {getvisitors.filter((visitor) => {
    if (!searchTerm.trim()) return true; // Show all if search is empty
    const term = searchTerm.toLowerCase();
    const name = visitor.name?.toLowerCase() || "";
    const mobile = visitor.Mobile?.toLowerCase() || "";
    return name.includes(term) || mobile.includes(term);
  }).map((visitor) => {
            return (
              <div
                key={visitor.id}
                className="bg-white rounded-lg shadow-md flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4"
              >
                <div className="flex-shrink-0">
                  <img
                    src={`https://i.pravatar.cc/80?u=${visitor.id}`}
                    alt={visitor.name}
                    className="hidden 2xl:block w-10 h-10 sm:w-15 sm:h-15 rounded-full object-cover border-2 border-indigo-600"
                  />
                </div>
                <div className="text-sm text-gray-700">
                  <h2 className="text-sm font-semibold text-gray-900">
                    {visitor.name}
                  </h2>
                  <p>
                    <span className="font-semibold">Mobile:</span>{" "}
                    {visitor.Mobile}
                  </p>
                  <p>
                    <span className="font-semibold">Reason:</span>{" "}
                    {visitor.visitReason}
                  </p>
                  <p>
                    <span className="font-semibold">Nationality:</span>{" "}
                    {visitor.nationality ? visitor.nationality.label : "N/A"}
                  </p>

                  <p>
                    <span className="font-semibold">DOB:</span>{" "}
                    {visitor.dateofbirth
                      ? new Date(visitor.dateofbirth.seconds * 1000).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <p>
                    <input
                      type="button"
                      value={
                        visitorStatus[visitor.id]?.status === "checked-in"
                          ? "Check Out"
                          : "Check In"
                      }
                      title="Click me"
                      onClick={() => handleToggleVisit(visitor)}
                      className={`${
                        visitorStatus[visitor.id]?.status === "checked-in"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg transition duration-200 cursor-pointer`}
                    />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ✅ Vehicle Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Enter Vehicle Details</DialogTitle>
        <DialogContent>
                <VehicleInfoForm
        
        visitor={vehicleInfo}
        error={vehicleError}
        handleVisitorChange={handleVehicleChange}
        handleVehicleTypeChange={handleVehicleTypeChange}
      />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmitVehicleInfo} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default React.memo(VisitorsIDCards);
