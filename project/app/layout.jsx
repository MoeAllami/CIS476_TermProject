import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "DriveShare - Peer-to-Peer Car Rental",
  description: "Rent the perfect car, anytime, anywhere",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
