import React, { useEffect, useState } from "react";
import { getDocs, where } from "firebase/firestore";
import { db } from "./Firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";

// ✅ Destructure props from function
const VisitorsIDCards = (props) => {
  const [getvisitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitorStatus, setVisitorStatus] = useState({});

  useEffect(() => {
    const q = query(collection(db, "visitors"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const visitorData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVisitors(visitorData);
      setLoading(false);

      // Check current check-in status for each visitor
      const statusMap = {};
      for (const visitor of visitorData) {
        const visitsQuery = query(
          collection(db, "visits"),
          where("visitorId", "==", visitor.id),
          where("status", "==", "checked-in")
        );
        const visitSnap = await getDocs(visitsQuery);
        if (!visitSnap.empty) {
          statusMap[visitor.id] = {
            status: "checked-in",
            visitId: visitSnap.docs[0].id,
          };
        } else {
          statusMap[visitor.id] = {
            status: "checked-out",
            visitId: null,
          };
        }
      }

      setVisitorStatus(statusMap);
    });

    return () => unsubscribe();
  }, []);

  const handleToggleVisit = async (visitor) => {
    const currentStatus = visitorStatus[visitor.id];

    if (currentStatus?.status === "checked-in") {
      // Check out
      try {
        const visitRef = doc(db, "visits", currentStatus.visitId);
        await updateDoc(visitRef, {
          checkOutTime: serverTimestamp(),
          status: "checked-out",
        });
        setVisitorStatus((prev) => ({
          ...prev,
          [visitor.id]: {
            status: "checked-out",
            visitId: null,
          },
        }));
        alert(`Checked out ${visitor.name}`);
      } catch (error) {
        console.error("Check-out error:", error);
        alert("Check-out failed.");
      }
    } else {
      // Check in
      try {
        const docRef = await addDoc(collection(db, "visits"), {
          visitorId: visitor.id,
          name: visitor.name,
          mobile: visitor.Mobile,
          checkInTime: serverTimestamp(),
          checkOutTime: null,
          status: "checked-in",
        });
        setVisitorStatus((prev) => ({
          ...prev,
          [visitor.id]: {
            status: "checked-in",
            visitId: docRef.id,
          },
        }));
        alert(`Checked in ${visitor.name}`);
      } catch (error) {
        console.error("Check-in error:", error);
        alert("Check-in failed.");
      }
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="max-h-[calc(100vh-12rem)] overflow-y-auto w-full max-w-5xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 gap-6 w-auto max-w-5xl px-4">
          {getvisitors.map((visitor) => {
            console.log("visitor", visitor);
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
                    {visitor.nationality
                      ? `${visitor.nationality.label}`
                      : "N/A"}
                  </p>

                  <p>
                    <span className="font-semibold">DOB:</span>{" "}
                    {visitor.dateofbirth
                      ? new Date(
                          visitor.dateofbirth.seconds * 1000
                        ).toLocaleDateString()
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
    </div>
  );
};

// ✅ Wrap with React.memo before export
export default React.memo(VisitorsIDCards);
