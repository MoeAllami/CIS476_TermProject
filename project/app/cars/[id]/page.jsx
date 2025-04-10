// app/cars/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateBookingForm from "../../components/bookings/CreateBookingForm";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function CarDetailPage() {
  const params = useParams();
  const id = params.id;
  const [car, setCar] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        setLoading(true);

        // Fetch car details
        const carResponse = await fetch(`/api/cars/${id}`);
        const carData = await carResponse.json();

        if (!carData.car) {
          throw new Error("Failed to fetch car details");
        }

        setCar(carData.car);

        // Fetch owner details
        const ownerResponse = await fetch(`/api/users/${carData.car.ownerId}`);
        const ownerData = await ownerResponse.json();

        if (ownerData.user) {
          setOwner(ownerData.user);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!car) {
    return <div className="text-center p-4">Car not found</div>;
  }

  const isOwner = session?.user?.id === car.ownerId.toString();
  const pricePerDay = car.pricing?.daily || car.pricePerDay;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/cars" className="text-blue-600 hover:text-blue-800">
          ← Back to Cars
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {car.images && car.images.length > 0 ? (
              <div className="relative h-64 md:h-96">
                <img
                  src={car.images[0]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}

            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">
                {car.make} {car.model} ({car.year})
              </h1>

              <div className="flex items-center text-gray-600 mb-4">
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>
                  {car.location.city}, {car.location.state}
                </span>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{car.description}</p>
              </div>

              {car.features && car.features.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {car.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Specifications</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Make</p>
                    <p className="font-medium">{car.make}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Model</p>
                    <p className="font-medium">{car.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Year</p>
                    <p className="font-medium">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Mileage</p>
                    <p className="font-medium">{car.mileage} miles</p>
                  </div>
                  {car.color && (
                    <div>
                      <p className="text-gray-600">Color</p>
                      <p className="font-medium">{car.color}</p>
                    </div>
                  )}
                  {car.type && (
                    <div>
                      <p className="text-gray-600">Type</p>
                      <p className="font-medium">{car.type}</p>
                    </div>
                  )}
                </div>
              </div>

              {car.rules && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Rules</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Smoking</p>
                      <p className="font-medium">
                        {car.rules.smoking ? "Allowed" : "Not allowed"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pets</p>
                      <p className="font-medium">
                        {car.rules.pets ? "Allowed" : "Not allowed"}
                      </p>
                    </div>
                    {car.rules.minimumAge && (
                      <div>
                        <p className="text-gray-600">Minimum Age</p>
                        <p className="font-medium">
                          {car.rules.minimumAge} years
                        </p>
                      </div>
                    )}
                  </div>
                  {car.rules.additionalRules && (
                    <div className="mt-2">
                      <p className="text-gray-600">Additional Rules</p>
                      <p className="font-medium">{car.rules.additionalRules}</p>
                    </div>
                  )}
                </div>
              )}

              {owner && (
                <div>
                  <h2 className="text-xl font-semibold mb-2">Car Owner</h2>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                      <span className="text-xl font-medium text-gray-600">
                        {owner.firstName?.charAt(0) ||
                          owner.name?.charAt(0) ||
                          "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {owner.firstName && owner.lastName
                          ? `${owner.firstName} ${owner.lastName}`
                          : owner.name || "Car Owner"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Member since {new Date(owner.createdAt).getFullYear()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {isOwner ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Your Car</h2>
              <div className="space-y-3">
                <Link
                  href={`/cars/${id}/edit`}
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
                >
                  Edit Car Details
                </Link>
                <Link
                  href={`/cars/${id}/bookings`}
                  className="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded hover:bg-gray-300"
                >
                  View Bookings
                </Link>
                <button
                  onClick={async () => {
                    try {
                      const isAvailable = !car.availability?.isAvailable;
                      const response = await fetch(
                        `/api/cars/${id}/availability`,
                        {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ isAvailable }),
                        }
                      );

                      if (response.ok) {
                        setCar({
                          ...car,
                          availability: {
                            ...car.availability,
                            isAvailable,
                          },
                        });
                      }
                    } catch (error) {
                      console.error("Error updating availability:", error);
                    }
                  }}
                  className={`block w-full text-center py-2 px-4 rounded ${
                    car.availability?.isAvailable
                      ? "bg-red-100 text-red-800 hover:bg-red-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {car.availability?.isAvailable
                    ? "Mark as Unavailable"
                    : "Mark as Available"}
                </button>
              </div>
            </div>
          ) : (
            <CreateBookingForm carId={id} pricePerDay={pricePerDay} />
          )}

          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Price Details</h2>
            <div className="flex justify-between items-center text-2xl font-bold">
              <span>Price per day:</span>
              <span>${pricePerDay}</span>
            </div>
            {car.pricing?.weekly && (
              <div className="flex justify-between items-center mt-2">
                <span>Weekly rate:</span>
                <span>${car.pricing.weekly}</span>
              </div>
            )}
            {car.pricing?.monthly && (
              <div className="flex justify-between items-center mt-2">
                <span>Monthly rate:</span>
                <span>${car.pricing.monthly}</span>
              </div>
            )}
            {car.pricing?.deposit && (
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span>Security deposit:</span>
                <span>${car.pricing.deposit}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
