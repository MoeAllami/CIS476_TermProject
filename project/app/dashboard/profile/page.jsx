// app/dashboard/profile/page.jsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb/mongodb";
import { getUserById } from "@/lib/models/user";
import { getCarsByOwner } from "@/lib/models/car";
import { authOptions } from "@/lib/auth/auth";
import Navigation from "@/app/components/Navigation";
import Link from "next/link";

async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const client = await clientPromise;
  const db = client.db("driveshare");

  const user = await getUserById(db, session.user.id);

  // Check if user exists before proceeding
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">User not found</p>
        </div>
      </div>
    );
  }

  const userCars = await getCarsByOwner(db, session.user.id);

  return (
    <div className="relative z-10 flex h-full">
      {/* Navigation Component */}
      <Navigation />
      <div className="max-w-7xl mx-auto py-8 px-4 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-gray-200 rounded-full flex-shrink-0 mr-4 flex items-center justify-center text-gray-600 text-xl">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {user.name}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-medium mb-2">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-gray-900">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-gray-900">{user.phone || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Your Cars</h2>
            <Link
              href="/api/cars/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add New Car
            </Link>
          </div>

          {userCars && userCars.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Car
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Year
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userCars.map((car) => (
                    <tr key={car._id.toString()}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0 mr-4 flex items-center justify-center text-gray-600">
                            🚗
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {car.make} {car.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {car.color || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{car.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            car.availability?.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {car.availability?.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/cars/${car._id.toString()}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/cars/${car._id.toString()}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">
                  No cars listed yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Add your first car to start renting it out!
                </p>
                <Link
                  href="/api/cars/new"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Your First Car
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
