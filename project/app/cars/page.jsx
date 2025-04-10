// app/cars/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Navigation from "../components/Navigation";

export default function CarsListingPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    skip: 0,
    hasMore: false,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const city = searchParams.get("city") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const carType = searchParams.get("type") || "";

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);

        // Build query parameters
        const queryParams = new URLSearchParams({
          limit: pagination.limit,
          skip: pagination.skip,
        });

        if (city) queryParams.set("city", city);
        if (minPrice) queryParams.set("minPrice", minPrice);
        if (maxPrice) queryParams.set("maxPrice", maxPrice);
        if (carType) queryParams.set("type", carType);

        const response = await fetch(`/api/cars?${queryParams.toString()}`);
        const data = await response.json();

        if (data.cars) {
          setCars(data.cars);
          setPagination(data.pagination);
        } else {
          throw new Error("Failed to fetch cars");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [city, minPrice, maxPrice, carType, pagination.skip, pagination.limit]);

  const handleSearch = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const searchCity = formData.get("city");
    const searchMinPrice = formData.get("minPrice");
    const searchMaxPrice = formData.get("maxPrice");
    const searchType = formData.get("type");

    const params = new URLSearchParams();
    if (searchCity) params.set("city", searchCity);
    if (searchMinPrice) params.set("minPrice", searchMinPrice);
    if (searchMaxPrice) params.set("maxPrice", searchMaxPrice);
    if (searchType) params.set("type", searchType);

    router.push(`/cars?${params.toString()}`);
  };

  const loadMore = () => {
    setPagination({
      ...pagination,
      skip: pagination.skip + pagination.limit,
    });
  };

  if (loading && cars.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative z-10 flex h-full">
      {/* Navigation Component */}
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Available Cars</h1>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  defaultValue={city}
                  placeholder="City"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label
                  htmlFor="minPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Min Price
                </label>
                <input
                  type="number"
                  id="minPrice"
                  name="minPrice"
                  defaultValue={minPrice}
                  placeholder="Min price per day"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label
                  htmlFor="maxPrice"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Max Price
                </label>
                <input
                  type="number"
                  id="maxPrice"
                  name="maxPrice"
                  defaultValue={maxPrice}
                  placeholder="Max price per day"
                  className="w-full p-2 border rounded"
                />
              </div>

              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Car Type
                </label>
                <select
                  id="type"
                  name="type"
                  defaultValue={carType}
                  className="w-full p-2 border rounded"
                >
                  <option value="">All Types</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="truck">Truck</option>
                  <option value="coupe">Coupe</option>
                  <option value="convertible">Convertible</option>
                  <option value="van">Van</option>
                  <option value="luxury">Luxury</option>
                </select>
              </div>

              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Search Cars
                </button>
              </div>
            </form>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            Error: {error}
          </div>
        )}

        {cars.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cars.map((car) => (
                <Link
                  key={car._id}
                  href={`/cars/${car._id}`}
                  className="block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    {car.images && car.images.length > 0 ? (
                      <img
                        src={car.images[0]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">
                          No image available
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-blue-600 text-white px-3 py-1">
                      ${car.pricing?.daily || car.pricePerDay}/day
                    </div>
                  </div>

                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">
                      {car.make} {car.model} ({car.year})
                    </h2>

                    <div className="flex items-center text-gray-600 mb-2">
                      <svg
                        className="w-4 h-4 mr-1"
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

                    <p className="text-gray-600 line-clamp-2 mb-2">
                      {car.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {car.features &&
                        car.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      {car.features && car.features.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          +{car.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {pagination.hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={loadMore}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">No cars found</h2>
            <p className="text-gray-600 mb-6">
              {city
                ? `No cars available in ${city} for the selected criteria.`
                : "No cars available for the selected criteria."}
            </p>
            <button
              onClick={() => {
                // Clear all search filters
                router.push("/cars");
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
