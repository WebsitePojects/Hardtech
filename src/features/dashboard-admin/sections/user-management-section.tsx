import { Search } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminUserList } from "@/server/services/dashboard.service";
import { ADMIN_ROLE_FILTER_OPTIONS } from "../confirmed-options";
import { DataNotConnectedNote } from "../components/data-not-connected-note";
import { UserManagementRow, type UserManagementItem } from "../components/user-management-row";

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * "User Management" (desktop-02.md #4-7, mobile-05.md #5-11).
 */
export async function UserManagementSection() {
  const users: UserManagementItem[] = (await getAdminUserList()).map((user) => ({
    id: user.id,
    name: user.name,
    initials: initialsFor(user.name),
    email: user.email,
    role: user.role,
    programLabel: user.program,
    status: user.status,
  }));

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="User Management"
        description="Update roles, statuses and account details"
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Select defaultValue={ADMIN_ROLE_FILTER_OPTIONS[0]}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ADMIN_ROLE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input placeholder="Search users..." className="pl-8" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>USER</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead>PROGRAM</TableHead>
            <TableHead>STATUS</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="whitespace-normal py-6">
                <DataNotConnectedNote detail="No users found." />
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => <UserManagementRow key={user.id} user={user} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
