import type { Metadata } from "next";
import { RecoverPassword } from "@/components/recover-password";

export const metadata: Metadata = { title: "Recover password" };

export default function RecoverPage() {
  return <RecoverPassword />;
}
