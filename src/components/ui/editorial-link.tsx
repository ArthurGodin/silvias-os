import Link from "next/link";
import { cn } from "@/lib/utils";

type EditorialLinkProps = {
  href: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
};

export function EditorialLink({
  href,
  active = false,
  children,
  className,
  external,
}: EditorialLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-active={active}
        className={cn("editorial-link", className)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href as never}
      data-active={active}
      className={cn("editorial-link", className)}
    >
      {children}
    </Link>
  );
}
