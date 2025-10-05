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
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 w-full max-w-5xl px-4">
        {visitors.map((visitor) => (
          <div
            key={visitor.id}
            className="bg-white rounded-lg shadow-md flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 p-4"
          >
            {/* Avatar hidden below 2xl */}
            <div className="flex-shrink-0">
              <img
                src={`https://i.pravatar.cc/80?u=${visitor.id}`}
                alt={visitor.name}
                className="hidden 2xl:block w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-indigo-600"
              />
            </div>

            {/* Visitor Info */}
            <div className="text-sm text-gray-700 w-full">
              <h2 className="text-lg font-semibold text-gray-900">
                {visitor.name}
              </h2>
              <p>
                <span className="font-semibold">Email:</span> {visitor.email}
              </p>
              <p>
                <span className="font-semibold">Reason:</span>{" "}
                {visitor.visitReason}
              </p>
              <p>
                <span className="font-semibold">Phone:</span> {visitor.phone}
              </p>
              <p>
                <span className="font-semibold">Nationality:</span>{" "}
                {visitor.nationality}
              </p>
              <p>
                <span className="font-semibold">DOB:</span>{" "}
                {new Date(visitor.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
