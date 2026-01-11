"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, SearchIcon, MailIcon, PhoneIcon, BuildingIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ContactsPage() {
  const teams = useQuery(api.teams.list);
  const teamId = teams?.[0]?._id;
  const contacts = useQuery(
    api.contacts.list,
    teamId ? { teamId } : "skip"
  );

  const [searchTerm, setSearchTerm] = useState("");

  const filteredContacts = contacts?.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!teamId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <Link href="/contacts/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Contact
          </Button>
        </Link>
      </div>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {!contacts ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-600">Loading contacts...</p>
          </div>
        </div>
      ) : filteredContacts && filteredContacts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">
            {searchTerm ? "No contacts found matching your search." : "No contacts yet."}
          </p>
          {!searchTerm && (
            <Link href="/contacts/new">
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Your First Contact
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContacts?.map((contact) => (
            <Link key={contact._id} href={`/contacts/${contact._id}`}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {contact.name}
                    </h3>
                    {contact.company && (
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <BuildingIcon className="h-3 w-3 mr-1" />
                        {contact.company}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {contact.email && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <MailIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </p>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <PhoneIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span>{contact.phone}</span>
                    </p>
                  )}
                </div>
                {contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{contact.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
