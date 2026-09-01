import { Suspense } from "react";
import { JoinForm } from "@/components/join-form";

export const dynamic = "force-dynamic";

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinForm />
    </Suspense>
  );
}
