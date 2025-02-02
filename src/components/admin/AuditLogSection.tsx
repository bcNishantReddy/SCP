import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const AuditLogSection = () => {
  const { data: auditLogs, refetch } = useQuery({
    queryKey: ["auditLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_actions")
        .select(`
          *,
          admin:admin_id (
            email,
            name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-actions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_actions'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Audit Log</h2>
      <ScrollArea className="h-[300px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs?.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.admin?.name}</TableCell>
                <TableCell className="capitalize">
                  {log.action_type.replace(/_/g, " ")}
                </TableCell>
                <TableCell>{log.target_table}</TableCell>
                <TableCell>
                  {log.details ? JSON.stringify(log.details) : "-"}
                </TableCell>
                <TableCell>
                  {new Date(log.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};