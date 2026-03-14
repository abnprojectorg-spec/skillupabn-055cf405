import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  useReferralCodes, useCourses, useEbooks, useDigitalFiles,
  addReferralCode, updateReferralCode, deleteReferralCode,
} from "@/hooks/useFirestore";
import type { ReferralCode } from "@/hooks/useFirestore";
import { Plus, Trash2, Edit, X, Loader2, Search, Tag } from "lucide-react";

interface Props {
  toast: any;
}

const AdminReferralCodes = ({ toast }: Props) => {
  const { codes, loading } = useReferralCodes();
  const { courses } = useCourses();
  const { ebooks } = useEbooks();
  const { files } = useDigitalFiles();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ReferralCode | null>(null);
  const [search, setSearch] = useState("");

  const emptyForm = {
    code: "",
    productType: "course" as "course" | "ebook" | "file",
    productId: "",
    productTitle: "",
    discountPrice: 0,
    referralQrCodeUrl: "",
    active: true,
  };

  const [form, setForm] = useState(emptyForm);

  const getProductOptions = () => {
    if (form.productType === "course") return courses.map((c) => ({ id: c.id, title: c.title, price: c.price }));
    if (form.productType === "ebook") return ebooks.map((e) => ({ id: e.id, title: e.title, price: e.price }));
    return files.map((f) => ({ id: f.id, title: f.title, price: f.price }));
  };

  const handleProductSelect = (productId: string) => {
    const options = getProductOptions();
    const item = options.find((o) => o.id === productId);
    setForm({ ...form, productId, productTitle: item?.title || "" });
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.productId || form.discountPrice <= 0) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      if (editing) {
        await updateReferralCode(editing.id, form);
        toast({ title: "Referral code updated!" });
        setEditing(null);
      } else {
        await addReferralCode(form as any);
        toast({ title: "Referral code created!" });
      }
      setShowForm(false);
      setForm(emptyForm);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEdit = (rc: ReferralCode) => {
    setEditing(rc);
    setForm({
      code: rc.code,
      productType: rc.productType,
      productId: rc.productId,
      productTitle: rc.productTitle,
      discountPrice: rc.discountPrice,
      referralQrCodeUrl: rc.referralQrCodeUrl || "",
      active: rc.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteReferralCode(id);
      toast({ title: "Referral code deleted" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleToggleActive = async (rc: ReferralCode) => {
    try {
      await updateReferralCode(rc.id, { active: !rc.active });
      toast({ title: rc.active ? "Code deactivated" : "Code activated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredCodes = codes.filter((c) =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.productTitle.toLowerCase().includes(search.toLowerCase())
  );

  const productOptions = getProductOptions();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Tag className="h-6 w-6 text-primary" /> Referral Codes
        </h1>
        <Button variant="hero" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} className="hover:scale-105 transition-transform">
          <Plus className="h-4 w-4 mr-1" /> Add Code
        </Button>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search codes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold">{editing ? "Edit Referral Code" : "New Referral Code"}</h2>
            <button onClick={() => { setShowForm(false); setEditing(null); }}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Referral Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "") })}
                placeholder="XXX-XXX-XXX"
                className="mt-1 font-mono tracking-wider uppercase"
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground mt-1">Format: XXX-XXX-XXX</p>
            </div>
            <div>
              <Label>Product Type *</Label>
              <select
                value={form.productType}
                onChange={(e) => setForm({ ...form, productType: e.target.value as any, productId: "", productTitle: "" })}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
              >
                <option value="course">Course</option>
                <option value="ebook">Ebook</option>
                <option value="file">File</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label>Select Product *</Label>
              <select
                value={form.productId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
              >
                <option value="">-- Choose a product --</option>
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title} ({p.price} ETB)</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Discount Price (ETB) *</Label>
              <Input
                type="number"
                value={form.discountPrice || ""}
                onChange={(e) => setForm({ ...form, discountPrice: Number(e.target.value) })}
                placeholder="2500"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Referral QR Code URL</Label>
              <Input
                value={form.referralQrCodeUrl}
                onChange={(e) => setForm({ ...form, referralQrCodeUrl: e.target.value })}
                placeholder="https://...referral-qr.png"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">QR code for discounted payment amount</p>
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
              <Label>Active</Label>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="hero" onClick={handleSave} className="hover:scale-105 transition-transform">
              {editing ? "Update Code" : "Create Code"}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-3 font-medium">Code</th>
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Discount Price</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCodes.map((rc) => (
                <tr key={rc.id} className="border-t border-border hover:bg-secondary/50 transition-colors">
                  <td className="p-3 font-mono tracking-wider font-medium">{rc.code}</td>
                  <td className="p-3">{rc.productTitle}</td>
                  <td className="p-3"><Badge variant="secondary" className="capitalize">{rc.productType}</Badge></td>
                  <td className="p-3 font-medium">{rc.discountPrice} ETB</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Switch checked={rc.active} onCheckedChange={() => handleToggleActive(rc)} />
                      <Badge className={rc.active ? "bg-accent/10 text-accent border-accent/20" : "bg-muted text-muted-foreground"}>
                        {rc.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(rc)} className="hover:bg-primary/10 transition-colors">
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(rc.id)} className="hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCodes.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No referral codes yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReferralCodes;
