import { Shield, ShieldCheck, Building2 } from "lucide-react";
import type { VerificationStatus } from "@/hooks/useFirestore";

interface VerificationBadgeProps {
  status?: VerificationStatus;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const BADGE_CONFIG: Record<VerificationStatus, { icon: typeof Shield; color: string; label: string }> = {
  unverified: { icon: Shield, color: "text-muted-foreground/40", label: "Unverified" },
  pending: { icon: Shield, color: "text-warning", label: "Pending" },
  verified_person: { icon: ShieldCheck, color: "text-blue-400", label: "Verified" },
  verified_business: { icon: Building2, color: "text-yellow-400", label: "Business" },
};

export default function VerificationBadge({ status = "unverified", size = "sm", showLabel = false }: VerificationBadgeProps) {
  const config = BADGE_CONFIG[status] || BADGE_CONFIG.unverified;
  const Icon = config.icon;
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";

  return (
    <span className={`inline-flex items-center gap-1 ${config.color}`} title={config.label}>
      <Icon className={iconSize} />
      {showLabel && <span className="text-xs font-medium">{config.label}</span>}
    </span>
  );
}
