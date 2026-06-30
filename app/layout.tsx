import "./globals.css";

export const metadata = {
  title: "Tracker de Iniciativa",
  description: "Tracker de iniciativa y HP para combates de D&D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
