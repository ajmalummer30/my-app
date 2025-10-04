const visitors = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    visitReason: "Meeting",
    phone: "+966123456789",
    nationality: "Saudi Arabia",
    dateOfBirth: "1990-01-01",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    visitReason: "Interview",
    phone: "+966987654321",
    nationality: "USA",
    dateOfBirth: "1988-05-12",
  },
  {
    id: 3,
    name: "John Doe",
    email: "john@example.com",
    visitReason: "Meeting",
    phone: "+966123456789",
    nationality: "Saudi Arabia",
    dateOfBirth: "1990-01-01",
  },
  {
    id: 4,
    name: "Jane Smith",
    email: "jane@example.com",
    visitReason: "Interview",
    phone: "+966987654321",
    nationality: "USA",
    dateOfBirth: "1988-05-12",
  },
];

export default function VisitorsIDCards() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {visitors.map((visitor) => (
        <div
          key={visitor.id}
          className="bg-white rounded-lg shadow-md flex space-x-4 p-6 items-center min-w-[300px]"
        >
          <div className="flex-shrink-0">
            <img
              src={`https://i.pravatar.cc/80?u=${visitor.id}`}
              alt={`${visitor.name} avatar`}
              className="w-20 h-20 rounded-full object-cover border-2 border-indigo-600"
            />
          </div>
          <div className="flex flex-col justify-center flex-1 space-y-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">
              {visitor.name}
            </h2>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Email:</span> {visitor.email}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Reason:</span>{" "}
              {visitor.visitReason}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Phone:</span> {visitor.phone}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">DOB:</span>{" "}
              {new Date(visitor.dateOfBirth).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
