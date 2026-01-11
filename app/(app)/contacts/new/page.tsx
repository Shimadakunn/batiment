"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ContactForm } from "@/components/contacts/contact-form";

export default function NewContactPage() {
  const teams = useQuery(api.teams.list);
  const teamId = teams?.[0]?._id;

  if (!teamId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <ContactForm teamId={teamId} />
    </div>
  );
}
