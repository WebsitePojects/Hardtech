import { db } from "@/server/db";
import type { PaymentMethod, Prisma } from "@/../generated/prisma/client";

/**
 * Pure data access for PaymentMethodConfig. Whether disabled methods should
 * be hidden from a given caller is a business decision — the caller (service
 * layer) supplies the `isEnabled` filter it wants, this file just runs the read.
 */
export const paymentMethodRepository = {
  findManyByEnabled(isEnabled: boolean) {
    return db.paymentMethodConfig.findMany({
      where: { isEnabled },
      orderBy: { createdAt: "asc" },
    });
  },

  create(tx: Prisma.TransactionClient, data: Prisma.PaymentMethodConfigCreateInput) {
    return tx.paymentMethodConfig.create({ data });
  },

  updateIfChanged(tx: Prisma.TransactionClient, input: {
    method: PaymentMethod;
    displayName: string;
    accountNumber: string | null;
    accountName: string | null;
    bankName: string | null;
    note: string | null;
    isEnabled: boolean;
    updatedByUserId: string;
  }) {
    const nullableChanged = (field: "accountNumber" | "accountName" | "bankName" | "note", value: string | null) =>
      value === null ? { [field]: { not: null } } : { OR: [{ [field]: { not: value } }, { [field]: null }] };
    return tx.paymentMethodConfig.updateMany({
      where: {
        method: input.method,
        OR: [
          { displayName: { not: input.displayName } },
          nullableChanged("accountNumber", input.accountNumber),
          nullableChanged("accountName", input.accountName),
          nullableChanged("bankName", input.bankName),
          nullableChanged("note", input.note),
          { isEnabled: { not: input.isEnabled } },
          { updatedByUserId: { not: input.updatedByUserId } },
        ],
      },
      data: input,
    });
  },
};
