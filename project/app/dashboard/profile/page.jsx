// app/dashboard/profile/page.jsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb/mongodb";
import { getUserById } from "@/lib/models/user";
import { getCarsByOwner } from "@/lib/models/car";
import { authOptions } from "@/lib/auth/auth";

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
    return <div>User not found</div>;
  }

  const userCars = await getCarsByOwner(db, session.user.id);

  return (
    <div>
      <h1>Profile: {user.name}</h1>
      <h2>Your Cars</h2>
      {userCars && userCars.length > 0 ? (
        userCars.map((car) => (
          <div key={car._id.toString()}>
            {car.make} {car.model} ({car.year})
          </div>
        ))
      ) : (
        <p>No cars found</p>
      )}
    </div>
  );
}

export default ProfilePage;
