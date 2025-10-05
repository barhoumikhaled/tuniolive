export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = "en"; // set default here or load from cookies

  return (
    <html lang={ locale } dir={ locale === "ar" ? "rtl" : "ltr" } suppressHydrationWarning>
      <body>{ children }</body>
    </html>
  );
}
