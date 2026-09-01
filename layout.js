export const metadata = {
  title: "Marlow",
  description: "Shop smarter with Marlow.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
