// app/(dashboard)/profile/page.jsx
import { getServerSession } from "next-auth/next";
import clientPromise from "@/lib/mongodb/mongodb";
import { getUserById } from "@/lib/models/user";
import { getCarsByOwner } from "@/lib/models/car";

async function ProfilePage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/auth/signin");
  }

  const client = await clientPromise;
  const db = client.db("driveshare");

  const user = await getUserById(db, session.user.id);
  const userCars = await getCarsByOwner(db, session.user.id);

  return (
    <div>
      <h1>Profile: {user.name}</h1>
      <h2>Your Cars</h2>
      {userCars.map((car) => (
        <div key={car._id}>
          {car.make} {car.model} ({car.year})
        </div>
      ))}
    </div>
  );
}
export default ProfilePage;
