import type { Metadata } from "next";

import Header from "@/components/Header";
import RegistrationConfirmation from "@/components/RegistrationConfirmation";

export const metadata: Metadata = { title: "Registration Confirmation | All-In Tournament Trail" };

export default function RegistrationConfirmationPage() {
  return <main className="min-h-screen bg-[#0B0B0B] text-[#F2F2F2]"><Header /><RegistrationConfirmation confirmation={null} /></main>;
}
