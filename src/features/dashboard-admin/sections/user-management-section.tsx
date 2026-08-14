import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminUserList } from "@/server/services/dashboard.service";
import { DataNotConnectedNote } from "../components/data-not-connected-note";
import { UserManagementCard } from "../components/user-management-card";
import { UserManagementFilters } from "../components/user-management-filters";
import { UserManagementPagination } from "../components/user-management-pagination";
import { UserManagementRow } from "../components/user-management-row";
import type { UserManagementItem } from "../use-user-management-actions";

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
 *
 * Server-side paginated (see the DEFECT-USER-LIST brief): `search`/`role`/
 * `page` are the raw, untrusted `searchParams` values `AdminDashboardPage`
 * (src/app/(dashboard)/dashboard/admin/page.tsx) read off the URL, parsed
 * and clamped inside `getAdminUserList`
 * (src/server/services/dashboard.service.ts) — never trusted here.
 */
export async function UserManagementSection({
  search,
  role,
  page,
}: {
  search?: string;
  role?: string;
  page?: string;
}) {
  const result = await getAdminUserList({ search, role, page });
  const users: UserManagementItem[] = result.users.map((user) => ({
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

      <UserManagementFilters search={search ?? ""} role={role ?? "ALL"} />

      {users.length === 0 ? (
        <DataNotConnectedNote detail="No users found." />
      ) : (
        <>
          {/*
            >= md: the desktop table (unchanged — verified against
            docs/screens/desktop-02.md #4-7). < md: one UserManagementCard
            per user instead of a horizontally-scrolling table, per the
            product owner's explicit ask for mobile-native record cards
            over the shrunken-table pattern the original Figma Make capture
            shipped (docs/screens/mobile-05.md #6). Two DOM trees toggled by
            Tailwind breakpoint, not one reflowing structure, so the >=md
            table stays byte-for-byte the reference-verified layout while
            the <md branch is free to use a completely different
            composition (card, not columns).
          */}
          <div className="hidden md:block">
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
                {users.map((user) => (
                  <UserManagementRow key={user.id} user={user} />
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 gap-3 md:hidden">
            {users.map((user) => (
              <UserManagementCard key={user.id} user={user} />
            ))}
          </div>
        </>
      )}

      {result.total > 0 ? (
        <UserManagementPagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          pageSize={result.pageSize}
        />
      ) : null}
    </div>
  );
}
