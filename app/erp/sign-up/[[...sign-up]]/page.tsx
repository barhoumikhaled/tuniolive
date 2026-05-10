import { SignUp } from "@clerk/nextjs";

export default function ErpSignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(40_33%_97%)]">
      <SignUp />
    </div>
  );
}
