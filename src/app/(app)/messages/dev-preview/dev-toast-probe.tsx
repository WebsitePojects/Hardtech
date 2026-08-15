"use client";

// TEMPORARY debug aid, deleted with the rest of dev-preview/.
import { toast } from "sonner";

export function DevToastProbe() {
  return (
    <button
      type="button"
      data-testid="dev-toast-probe"
      onClick={() => toast.error("probe: toast works")}
      className="fixed top-2 left-2 z-[999999] rounded bg-red-600 px-2 py-1 text-xs text-white"
    >
      fire test toast
    </button>
  );
}
