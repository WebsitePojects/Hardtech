import type { Bilingual as BilingualText } from "@/features/help/help-content";

/**
 * Renders the site's English-primary / Filipino-secondary copy pairing used
 * throughout the Help Center: a full-strength English line immediately
 * followed by a smaller, muted Filipino translation.
 */
export function Bilingual({
  text,
  enClassName,
  filClassName,
}: {
  text: BilingualText;
  enClassName?: string;
  filClassName?: string;
}) {
  return (
    <div>
      <p className={enClassName ?? "text-sm font-medium text-foreground"}>
        {text.en}
      </p>
      <p className={filClassName ?? "mt-0.5 text-xs text-muted-foreground"}>
        {text.fil}
      </p>
    </div>
  );
}
