"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";

interface ContactFormProps {
  teamId: Id<"teams">;
  contact?: {
    _id: Id<"contacts">;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    tags: string[];
    notes?: string;
  };
}

export function ContactForm({ teamId, contact }: ContactFormProps) {
  const router = useRouter();
  const createContact = useMutation(api.contacts.create);
  const updateContact = useMutation(api.contacts.update);

  const [name, setName] = useState(contact?.name || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [phone, setPhone] = useState(contact?.phone || "");
  const [company, setCompany] = useState(contact?.company || "");
  const [address, setAddress] = useState(contact?.address || "");
  const [tags, setTags] = useState(contact?.tags?.join(", ") || "");
  const [notes, setNotes] = useState(contact?.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

      if (contact) {
        await updateContact({
          id: contact._id,
          name,
          email: email || undefined,
          phone: phone || undefined,
          company: company || undefined,
          address: address || undefined,
          tags: tagsArray,
          notes: notes || undefined,
        });
      } else {
        await createContact({
          teamId,
          name,
          email: email || undefined,
          phone: phone || undefined,
          company: company || undefined,
          address: address || undefined,
          tags: tagsArray,
          notes: notes || undefined,
        });
      }

      router.push("/contacts");
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to save contact");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{contact ? "Edit Contact" : "New Contact"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Name *</FieldLabel>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="company">Company</FieldLabel>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Inc."
                disabled={loading}
              />
            </Field>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                disabled={loading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={loading}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel htmlFor="address">Address</FieldLabel>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State 12345"
              disabled={loading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="tags">Tags (comma separated)</FieldLabel>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="VIP, contractor, referral"
              disabled={loading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this contact..."
              rows={4}
              disabled={loading}
            />
          </Field>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : contact ? "Update Contact" : "Create Contact"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/contacts")}
            disabled={loading}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
