import { SignIn } from "@clerk/nextjs";

export default function ErpSignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(40_33%_97%)]">
      <SignIn />
    </div>
  );
}
