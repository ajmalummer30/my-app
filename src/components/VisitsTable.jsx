import React, { useEffect, useState } from "react";
import { db } from "./Firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from "firebase/firestore";
import exportVisitsToCSV from "../Helperfunctions/ExportCsv";
import { Button, Pagination } from "@mui/material";

const PAGE_SIZE = 10;

const VisitsTable = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const fetchVisits = async (page = 1) => {
    setLoading(true);
    const visitsRef = collection(db, "visits");
    let q;

    if (page === 1) {
      q = query(visitsRef, orderBy("checkInTime", "desc"), limit(PAGE_SIZE));
    } else if (lastDoc) {
      q = query(visitsRef, orderBy("checkInTime", "desc"), startAfter(lastDoc), limit(PAGE_SIZE));
    } else {
      q = query(visitsRef, orderBy("checkInTime", "desc"), limit(PAGE_SIZE));
    }

    const snapshot = await getDocs(q);
    const visitData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    setVisits(visitData);

    if (snapshot.docs.length > 0) {
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    }

    // Calculate pages dynamically if first page
    if (page === 1) {
      const totalDocs = visitData.length < PAGE_SIZE ? 1 : page + 1; // crude fallback
      setPageCount(totalDocs);
    }

    setPageNumber(page);
    setLoading(false);
  };

  useEffect(() => {
    fetchVisits(1);
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <p className="text-center">Loading visits...</p>
      ) : (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => exportVisitsToCSV(visits)}
            className="mb-4"
          >
            Export CSV
          </Button>

          <div className="overflow-x-auto bg-white rounded-lg shadow-md">
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="text-xs uppercase bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Station</th>
                  <th className="px-6 py-4">Vehicle Type</th>
                  <th className="px-6 py-4">Vehicle Number</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visits.length > 0 ? (
                  visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-3">
                        <img
                          src={
                            visit.capturedFaceURL?.trim()
                              ? visit.capturedFaceURL
                              : `https://i.pravatar.cc/80?u=${visit.id}`
                          }
                          alt={visit.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span>{visit.name}</span>
                      </td>
                      <td className="px-6 py-4">{visit.mobile}</td>
                      <td className="px-6 py-4">{visit.station}</td>
                      <td className="px-6 py-4">{visit.vehicleType}</td>
                      <td className="px-6 py-4">
                        {visit.vehicleType?.toLowerCase() === "walk"
                          ? "NA"
                          : visit.vehicleplatenumber?.trim() || ""}
                      </td>
                      <td className="px-6 py-4">
                        {visit.checkInTime
                          ? new Date(visit.checkInTime.seconds * 1000).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {visit.checkOutTime
                          ? new Date(visit.checkOutTime.seconds * 1000).toLocaleString()
                          : "Still Inside"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${
                            visit.status === "checked-in" ? "bg-green-500" : "bg-gray-500"
                          }`}
                        >
                          {visit.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      No visits found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MUI Pagination */}
          <div className="flex justify-center mt-4">
            <Pagination
              count={pageCount}
              page={pageNumber}
              onChange={(e, page) => fetchVisits(page)}
              color="primary"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default VisitsTable;
