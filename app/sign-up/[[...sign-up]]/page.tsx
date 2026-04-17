import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="bg-muted flex w-full h-full flex-1 items-center justify-center p-6 md:p-10">
      <SignUp path="/sign-up" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
