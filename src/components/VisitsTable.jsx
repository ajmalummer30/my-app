import React, { useEffect, useState } from "react";
import { db } from "./Firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  startAt,
} from "firebase/firestore";

const PAGE_SIZE = 10;

const VisitsTable = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [firstDoc, setFirstDoc] = useState(null);
  const [isPrevDisabled, setIsPrevDisabled] = useState(true);
  const [historyStack, setHistoryStack] = useState([]);

  // Fetch first page
  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async (direction = "next") => {
    setLoading(true);

    const visitsRef = collection(db, "visits");
    let q;

    if (direction === "next" && lastDoc) {
      q = query(
        visitsRef,
        orderBy("checkInTime", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    } else if (direction === "prev" && historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // Remove current
      const prevDoc = newStack[newStack.length - 1];

      q = query(
        visitsRef,
        orderBy("checkInTime", "desc"),
        startAt(prevDoc),
        limit(PAGE_SIZE)
      );
      setHistoryStack(newStack);
    } else {
      q = query(visitsRef, orderBy("checkInTime", "desc"), limit(PAGE_SIZE));
    }

    const snapshot = await getDocs(q);
    const visitData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (snapshot.docs.length > 0) {
      setFirstDoc(snapshot.docs[0]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (direction === "next") {
        setHistoryStack((prev) => [...prev, snapshot.docs[0]]);
      }
    }

    setVisits(visitData);
    setIsPrevDisabled(historyStack.length <= 1 && direction !== "next");
    setLoading(false);
  };

  return (
    <div className="p-4">
      {loading ? (
        <p className="text-center">Loading visits...</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visits.map((visit) => (
                  <tr
                    key={visit.id}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {visit.name}
                    </td>
                    <td className="px-6 py-4">{visit.mobile}</td>
                    <td className="px-6 py-4">
                      {visit.checkInTime
                        ? new Date(
                            visit.checkInTime.seconds * 1000
                          ).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {visit.checkOutTime
                        ? new Date(
                            visit.checkOutTime.seconds * 1000
                          ).toLocaleString()
                        : "Still Inside"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${
                          visit.status === "checked-in"
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {visits.length === 0 && (
                  <tr>
                    <td
                      className="px-6 py-4 text-center text-gray-500"
                      colSpan="5"
                    >
                      No visit records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={() => fetchVisits("prev")}
              disabled={isPrevDisabled}
              className={`px-4 py-2 text-sm rounded-md border ${
                isPrevDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => fetchVisits("next")}
              disabled={visits.length < PAGE_SIZE}
              className={`px-4 py-2 text-sm rounded-md border ${
                visits.length < PAGE_SIZE
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VisitsTable;
