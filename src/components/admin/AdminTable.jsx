import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingState from "@/components/shared/LoadingState";
import EmptyState from "@/components/shared/EmptyState";

export default function AdminTable({ columns, rows, loading, emptyIcon, emptyTitle, emptyDescription, renderRow, onRowClick }) {
  if (loading) return <LoadingState />;
  if (!rows || rows.length === 0)
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border">
              {columns.map((c) => (
                <TableHead key={c} className="text-muted-foreground">{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={row.id || i}
                className={`border-border ${onRowClick ? "cursor-pointer hover:bg-secondary/30" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {renderRow(row).map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}