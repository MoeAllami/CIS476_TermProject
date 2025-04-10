// app/dashboard/cars/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function CarDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/dashboard/cars");
      return;
    }

    // Only fetch cars if user is authenticated
    if (status === "authenticated") {
      const fetchCars = async () => {
        try {
          const response = await fetch("/api/cars/my-cars");
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Failed to fetch cars");
          }

          setCars(data.cars || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchCars();
    }
  }, [status, router]);

  const handleDelete = async (carId) => {
    if (!confirm("Are you sure you want to delete this car?")) {
      return;
    }

    try {
      const response = await fetch(`/api/cars/${carId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete car");
      }

      // Remove car from state
      setCars(cars.filter((car) => car._id !== carId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleAvailability = async (carId, currentAvailability) => {
    try {
      const response = await fetch(`/api/cars/${carId}/availability`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isAvailable: !currentAvailability,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update availability");
      }

      // Update car in state
      setCars(
        cars.map((car) =>
          car._id === carId
            ? {
                ...car,
                availability: {
                  ...car.availability,
                  isAvailable: !currentAvailability,
                },
              }
            : car
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Cars</h1>
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Cars</h1>
        <Link
          href="/api/cars/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add New Car
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {cars.length === 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No cars listed yet</h2>
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
      ) : (
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
                  Location
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Daily Rate
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
              {cars.map((car) => (
                <tr key={car._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0 mr-4">
                        {car.photos && car.photos[0] ? (
                          <img
                            src={car.photos[0]}
                            alt={`${car.make} ${car.model}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gray-300 text-gray-600">
                            🚗
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {car.make} {car.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {car.year} • {car.color || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {car.location?.city || "N/A"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {car.location?.state || ""}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${car.pricing?.daily || 0}/day
                    </div>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() =>
                        handleToggleAvailability(
                          car._id,
                          car.availability?.isAvailable
                        )
                      }
                      className={`px-3 py-1 rounded-md text-sm ${
                        car.availability?.isAvailable
                          ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          : "bg-green-100 text-green-800 hover:bg-green-200"
                      }`}
                    >
                      {car.availability?.isAvailable
                        ? "Set Unavailable"
                        : "Set Available"}
                    </button>

                    <button
                      onClick={() => handleDelete(car._id)}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CarDashboardPage;
