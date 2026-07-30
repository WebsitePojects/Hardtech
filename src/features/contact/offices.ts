export type Office = {
  id: "main" | "branch";
  badgeLabel: string;
  addressShort: string;
  addressFull: string;
  phone: string;
  email: string;
  hours: string;
  mapQuery: string;
};

export const OFFICES: Office[] = [
  {
    id: "main",
    badgeLabel: "MAIN OFFICE",
    addressShort: "673 Quirino Hwy",
    addressFull: "673 Quirino Highway, Novaliches, Quezon City, Metro Manila",
    phone: "(123) 456-7890",
    email: "hardtechitcorp@gmail.com",
    hours: "Mon–Fri 9:00 AM – 5:00 PM",
    mapQuery: "673 Quirino Highway, Novaliches, Quezon City",
  },
  {
    id: "branch",
    badgeLabel: "BRANCH OFFICE",
    addressShort: "Batasan Rd, QC",
    addressFull: "M3QV+MM5, Batasan Rd, Quezon City, Metro Manila",
    phone: "(0987) 654-3210",
    email: "hardtechitcorp@gmail.com",
    hours: "Mon–Fri 9:00 AM – 5:00 PM",
    mapQuery: "Batasan Road, Quezon City, Metro Manila",
  },
];
