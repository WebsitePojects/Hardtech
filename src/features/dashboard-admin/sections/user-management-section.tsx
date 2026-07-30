import { Search } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ADMIN_ROLE_FILTER_OPTIONS } from "../confirmed-options";
import { DataNotConnectedNote } from "../components/data-not-connected-note";
import { UserManagementRow, type UserManagementItem } from "../components/user-management-row";

// NOT SOURCED: dashboard.service has no user-list read (only
// userRepository.countAll() via getAdminOverviewStats). Typed and mapped
// for real below so UserManagementRow's mutation guards are exercised by
// real code; it is simply fed no rows until that read exists.
const USERS: UserManagementItem[] = [];

/**
 * "User Management" (desktop-02.md #4-7, mobile-05.md #5-11).
 */
export function UserManagementSection() {
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
          {USERS.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="whitespace-normal py-6">
                <DataNotConnectedNote detail="The user list has no service read yet." />
              </TableCell>
            </TableRow>
          ) : (
            USERS.map((user) => <UserManagementRow key={user.id} user={user} />)
          )}
        </TableBody>
      </Table>
    </div>
  );
}
