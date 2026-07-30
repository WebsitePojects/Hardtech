import { db } from "@/server/db";

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
};
