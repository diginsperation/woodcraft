import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { strings } from "@/content/strings.de";
import { Seo } from "@/components/Seo";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const baseSchema = z.object({
  name: z.string().min(1, "Bitte gib deinen Namen ein."),
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein."),
  phone: z.string().min(5, "Bitte gib eine gültige Telefonnummer ein."),
  street: z.string().min(3, "Bitte gib deine Straße ein."),
  zip: z.string().min(3, "Bitte gib die PLZ ein."),
  city: z.string().min(2, "Bitte gib deinen Ort ein."),
  country: z.string().min(2, "Bitte gib dein Land ein."),
  notes: z.string().optional(),
});

type BaseFormData = z.infer<typeof baseSchema>;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Checkout() {
  const navigate = useNavigate();
  const query = useQuery();
  const slug = query.get("product") || "";
  const selectionRaw = typeof window !== "undefined" ? localStorage.getItem("checkoutSelection") : null;
  const selection = selectionRaw ? JSON.parse(selectionRaw) : null;
  const product = selection
    ? products.find((p) => p.id === selection.productId)
    : products.find((p) => p.slug === slug);
  const qty = selection ? selection.quantity : Number(query.get("qty") || 1);
  const unitPrice = selection?.unitPrice ?? (product?.price ?? 0);
  const total = product ? (unitPrice * qty) / 100 : 0;
const personalizationEnabled = !!selection?.personalizationEnabled;

// Zustände für rechtliche Bestätigungen und Modal
const [agreeTerms, setAgreeTerms] = useState(false);
const [agreeWithdrawal, setAgreeWithdrawal] = useState(false);
const [agreePay, setAgreePay] = useState(false);
const [open, setOpen] = useState(false);
const allChecked = agreeTerms && agreeWithdrawal && agreePay;

  const nameRegex = /^[A-Za-zÄÖÜäöüß \-&]{1,24}$/;
  const schema = personalizationEnabled
    ? baseSchema.merge(
        z.object({
          personal_name: z
            .string()
            .min(1)
            .max(24)
            .regex(nameRegex, "Bitte nur Buchstaben, Leerzeichen, - und & (1–24 Zeichen)."),
          personal_partner: z
            .string()
            .min(1)
            .max(24)
            .regex(nameRegex, "Bitte nur Buchstaben, Leerzeichen, - und & (1–24 Zeichen)."),
          personal_date: z.string().refine((val) => {
            const m = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(val || "");
            if (!m) return false;
            const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          }, "Datum darf nicht in der Vergangenheit liegen."),
        })
      )
    : baseSchema;

  const form = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: personalizationEnabled
      ? {
          personal_name: selection?.personalization?.name || "",
          personal_partner: selection?.personalization?.partnerName || "",
          personal_date: selection?.personalization?.date ? format(new Date(selection.personalization.date), "dd.MM.yyyy") : "",
        }
      : {},
    mode: "onChange",
  });

  const submit = (data: any) => {
    navigate("/thank-you", { state: { product, qty, total, data, personalizationEnabled } });
  };

  if (!product) return <div className="container py-10">No product selected</div>;

  return (
    <div className="container py-10">
      <Seo title={`${strings.checkout.title} – ${strings.brandName}`} description={strings.seo.homeDescription} canonicalPath="/checkout" />
      <h1 className="font-playfair text-3xl md:text-4xl mb-6">{strings.checkout.title}</h1>
      <section className="mb-6 rounded-lg border bg-card p-4">
        <h2 className="font-medium mb-1">{strings.checkout.infoTitle}</h2>
        <p className="text-sm text-muted-foreground">{strings.checkout.infoText}</p>
      </section>
      <div className="grid md:grid-cols-3 gap-8">
        <aside className="md:col-span-1 rounded-lg border p-4 bg-card">
          <h2 className="font-medium mb-2">{strings.checkout.summary}</h2>
          <div className="flex gap-3">
            <img src={product.images[0]} alt={product.title} className="h-16 w-16 object-cover rounded-md border" />
            <div>
              <p className="font-medium">{product.title}</p>
              <p className="text-sm text-muted-foreground">x{qty}</p>
              <p className="mt-1">{(unitPrice / 100).toFixed(2)} €</p>
            </div>
          </div>
          <hr className="my-3" />
          <p className="font-semibold">Summe: {total.toFixed(2)} €</p>
          <p className="text-sm text-muted-foreground">{strings.checkout.shippingNote}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {personalizationEnabled ? strings.checkout.withdrawalNotePersonalized : strings.checkout.withdrawalNoteStandard}
          </p>

          {personalizationEnabled && selection?.personalization && (
            <>
              <hr className="my-3" />
              <h3 className="font-medium mb-2">Personalisierung</h3>
              <ul className="text-sm space-y-1">
                <li>Name: {selection.personalization.name}</li>
                <li>Partnername: {selection.personalization.partnerName}</li>
                <li>
                  Datum:{" "}
                  {selection.personalization.date
                    ? format(new Date(selection.personalization.date), "dd.MM.yyyy")
                    : ""}
                </li>
              </ul>
            </>
          )}
        </aside>

        <form onSubmit={form.handleSubmit(submit)} className="md:col-span-2 space-y-6">
        {personalizationEnabled && (
          <section aria-labelledby="personalization" className="space-y-3">
            <h2 id="personalization" className="font-medium">{strings.checkout.personalization}</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">{strings.personalization.name}</label>
                <Input {...form.register("personal_name")} />
                {form.formState.errors.personal_name && <p className="text-destructive text-sm mt-1">{form.formState.errors.personal_name.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{strings.personalization.partner}</label>
                <Input {...form.register("personal_partner")} />
                {form.formState.errors.personal_partner && <p className="text-destructive text-sm mt-1">{form.formState.errors.personal_partner.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{strings.personalization.date} (TT.MM.JJJJ)</label>
                <Input placeholder="TT.MM.JJJJ" {...form.register("personal_date")} />
                {form.formState.errors.personal_date && <p className="text-destructive text-sm mt-1">{form.formState.errors.personal_date.message as string}</p>}
              </div>
            </div>
          </section>
        )}

          <section aria-labelledby="contact" className="space-y-3">
            <h2 id="contact" className="font-medium">{strings.checkout.customer}</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">{strings.checkout.name}</label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{strings.checkout.email}</label>
                <Input type="email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{strings.checkout.phone}</label>
                <Input {...form.register("phone")} />
                {form.formState.errors.phone && <p className="text-destructive text-sm mt-1">{form.formState.errors.phone.message as string}</p>}
              </div>
            </div>
          </section>

          <section aria-labelledby="address" className="space-y-3">
            <h2 id="address" className="font-medium">{strings.checkout.address}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">{strings.checkout.street}</label>
                <Input {...form.register("street")} />
                {form.formState.errors.street && <p className="text-destructive text-sm mt-1">{form.formState.errors.street.message as string}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">{strings.checkout.zip}</label>
                  <Input {...form.register("zip")} />
                  {form.formState.errors.zip && <p className="text-destructive text-sm mt-1">{form.formState.errors.zip.message as string}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1">{strings.checkout.city}</label>
                  <Input {...form.register("city")} />
                  {form.formState.errors.city && <p className="text-destructive text-sm mt-1">{form.formState.errors.city.message as string}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">{strings.checkout.country}</label>
                <Input {...form.register("country")} />
                {form.formState.errors.country && <p className="text-destructive text-sm mt-1">{form.formState.errors.country.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{strings.checkout.notes}</label>
                <Textarea {...form.register("notes")} />
              </div>
            </div>
          </section>

          <section aria-labelledby="agreements" className="space-y-3">
            <div className="space-y-3 text-sm">
              <label className="flex items-start gap-3">
                <Checkbox checked={agreeTerms} onCheckedChange={(v) => setAgreeTerms(!!v)} />
                <span>
                  Ich habe die <Link to="/agb">AGB</Link> und <Link to="/datenschutz">Datenschutzerklärung</Link> gelesen und akzeptiere sie.
                </span>
              </label>
              <label className="flex items-start gap-3">
                <Checkbox checked={agreeWithdrawal} onCheckedChange={(v) => setAgreeWithdrawal(!!v)} />
                <span>
                  {personalizationEnabled ? strings.checkout.agree.withdrawalPersonal : strings.checkout.agree.withdrawalStandard} (<Link to="/widerruf">Widerrufsbelehrung</Link>)
                </span>
              </label>
              <label className="flex items-start gap-3">
                <Checkbox checked={agreePay} onCheckedChange={(v) => setAgreePay(!!v)} />
                <span>{strings.checkout.agree.pay}</span>
              </label>
            </div>
          </section>

          <Button type="button" className="w-full md:w-auto" disabled={!allChecked} onClick={() => setOpen(true)}>
            {strings.checkout.confirmButton}
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{strings.checkout.modal.title}</DialogTitle>
                <DialogDescription>Bitte prüfe deine Angaben.</DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Produkt</span><span>{product?.title}</span></div>
                <div className="flex justify-between text-sm"><span>Menge</span><span>x{qty}</span></div>
                {personalizationEnabled && selection?.personalization && (
                  <div className="text-sm">
                    <div>
                      Personalisierung: {selection.personalization.name} & {selection.personalization.partnerName} ({selection.personalization.date ? format(new Date(selection.personalization.date), "dd.MM.yyyy") : ""})
                    </div>
                  </div>
                )}
                <div className="flex justify-between font-medium"><span>Gesamt</span><span>{total.toFixed(2)} €</span></div>
                <p className="text-xs text-muted-foreground">{strings.checkout.shippingNote}</p>
              </div>

              <DialogFooter>
                <Button variant="secondary" type="button" onClick={() => setOpen(false)}>{strings.checkout.modal.back}</Button>
                <Button type="button" onClick={() => { form.handleSubmit((d) => { setOpen(false); submit(d); })(); }}>
                  {strings.checkout.modal.confirm}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </div>
  );
}
