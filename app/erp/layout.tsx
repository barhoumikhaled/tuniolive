import { ClerkProvider } from "@clerk/nextjs";
import { ErpProviders } from "./providers";
import { Toaster } from "sonner";

export const metadata = {
  title: "TuniOlive ERP",
  description: "Internal ERP system",
};

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/erp/sign-in"
      signUpUrl="/erp/sign-up"
      signInFallbackRedirectUrl="/erp"
      signUpFallbackRedirectUrl="/erp"
      appearance={{
        variables: {
          colorPrimary: "#1E4D2B",
          colorBackground: "#FAF8F3",
          colorForeground: "#1a2e20",
          borderRadius: "0.5rem",
        },
      }}
    >
      <ErpProviders>{children}</ErpProviders>
      {/* Toaster lives outside the QueryClient/Dialog tree to avoid setState-during-render */}
      <Toaster richColors position="top-right" />
    </ClerkProvider>
  );
}
