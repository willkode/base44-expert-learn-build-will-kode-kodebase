import React from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Eye, Pencil, UserMinus, Ban, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ContactRowActions({ contact, onEdit, onUnsubscribe, onSuppress, onDelete }) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate(`/admin/marketing/email/contacts/${contact.id}`)}>
          <Eye className="w-4 h-4 mr-2" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(contact)}>
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {contact.status === "subscribed" && (
          <DropdownMenuItem onClick={() => onUnsubscribe(contact)}>
            <UserMinus className="w-4 h-4 mr-2" /> Unsubscribe
          </DropdownMenuItem>
        )}
        {contact.status !== "suppressed" && (
          <DropdownMenuItem onClick={() => onSuppress(contact)}>
            <Ban className="w-4 h-4 mr-2" /> Suppress
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onDelete(contact)} className="text-destructive focus:text-destructive">
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}