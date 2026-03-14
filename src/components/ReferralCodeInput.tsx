import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateReferralCode, type ReferralCode } from "@/hooks/useFirestore";
import { CheckCircle, Loader2, Tag, X } from "lucide-react";

interface ReferralCodeInputProps {
  productType: "course" | "ebook" | "file";
  productId: string;
  originalPrice: number;
  onReferralApplied: (referral: ReferralCode | null) => void;
}

const ReferralCodeInput = ({ productType, productId, originalPrice, onReferralApplied }: ReferralCodeInputProps) => {
  const [code, setCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [applied, setApplied] = useState<ReferralCode | null>(null);
  const [error, setError] = useState("");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setCode(val);
    setError("");
  };

  const handleApply = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setError("");
    try {
      const result = await validateReferralCode(code.trim(), productType, productId);
      if (result) {
        setApplied(result);
        onReferralApplied(result);
      } else {
        setError("Invalid referral code.");
        onReferralApplied(null);
      }
    } catch {
      setError("Error validating code.");
    } finally {
      setChecking(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode("");
    setError("");
    onReferralApplied(null);
  };

  if (applied) {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Referral code applied!</span>
          </div>
          <button onClick={handleRemove} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-muted-foreground line-through">{originalPrice} ETB</span>
          <span className="text-lg font-bold text-accent">{applied.discountPrice} ETB</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Discount activated</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Referral Code (Optional)</span>
      </div>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={handleCodeChange}
          placeholder="XXX-XXX-XXX"
          className={`font-mono tracking-wider uppercase ${error ? "border-destructive" : ""}`}
          maxLength={20}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleApply}
          disabled={!code.trim() || checking}
          className="shrink-0 hover:border-accent/50 transition-colors"
        >
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default ReferralCodeInput;
