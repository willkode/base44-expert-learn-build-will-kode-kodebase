import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ListChecks, Plus, MoreHorizontal, Users, Pencil, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import AdminTable from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ListFormDialog from "@/components/admin/email/lists/ListFormDialog";

export default function EmailLists() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    base44.entities.EmailList.list("-created_date", 200).then((l) => {
      setRows(l);
      setLoading(false);
    });
  };
  useEffect(load, []);

  const handleDelete = async (list) => {
    if (!window.confirm(`Delete list "${list.name}"? Contacts themselves are not deleted.`)) return;
    const memberships = await base44.entities.EmailListMembership.filter({ listId: list.id }, "-created_date", 5000);
    for (const m of memberships) await base44.entities.EmailListMembership.delete(m.id);
    await base44.entities.EmailList.delete(list.id);
    toast.success("List deleted");
    load();
  };

  return (
    <div>
      <PageHeader
        title="Lists"
        description="Manage manual and imported contact lists."
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> New List
          </Button>
        }
      />
      <AdminTable
        loading={loading}
        rows={rows}
        columns={["Name", "Type", "Contacts", "Active", "Unsubscribed", "Created", ""]}
        emptyIcon={ListChecks}
        emptyTitle="No lists yet"
        emptyDescription="Create a list to organize your contacts into audiences."
        renderRow={(l) => [
          <span className="font-medium">{l.name}</span>,
          <Badge variant="secondary" className="capitalize">{l.listType}</Badge>,
          <span>{l.contactCount || 0}</span>,
          <span>{l.activeContactCount || 0}</span>,
          <span>{l.unsubscribedCount || 0}</span>,
          <span className="text-muted-foreground">{new Date(l.created_date).toLocaleDateString()}</span>,
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/admin/marketing/email/contacts?list=${l.id}`)}>
                <Users className="w-4 h-4 mr-2" /> View contacts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setEditing(l); setFormOpen(true); }}>
                <Pencil className="w-4 h-4 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(l)} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>,
        ]}
      />
      <ListFormDialog open={formOpen} onOpenChange={setFormOpen} list={editing} onSaved={load} />
    </div>
  );
}