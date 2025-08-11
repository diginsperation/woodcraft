import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/I18nProvider";
import { Seo } from "@/components/Seo";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  street: z.string().min(3),
  zip: z.string().min(3),
  city: z.string().min(2),
  country: z.string().min(2),
  personal_name: z.string().min(1),
  personal_partner: z.string().min(1),
  personal_date: z.string().min(4),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Checkout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const query = useQuery();
  const slug = query.get("product") || "";
  const qty = Number(query.get("qty") || 1);
  const product = products.find((p) => p.slug === slug);
  const total = product ? (product.price * qty) / 100 : 0;

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      personal_name: query.get("name") || "",
      personal_partner: query.get("partner") || "",
      personal_date: query.get("date")?.slice(0, 10) || "",
    },
    mode: "onChange",
  });

  const submit = (data: FormData) => {
    navigate("/thank-you", { state: { product, qty, total, data } });
  };

  if (!product) return <div className="container py-10">No product selected</div>;

  return (
    <div className="container py-10">
      <Seo title={`${t("checkout.title")} – ${t("brand.name")}`} description={t("seo.homeDescription")} canonicalPath="/checkout" />
      <h1 className="font-playfair text-3xl md:text-4xl mb-6">{t("checkout.title")}</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <aside className="md:col-span-1 rounded-lg border p-4 bg-card">
          <h2 className="font-medium mb-2">{t("checkout.summary")}</h2>
          <div className="flex gap-3">
            <img src={product.images[0]} alt={product.title} className="h-16 w-16 object-cover rounded-md border" />
            <div>
              <p className="font-medium">{product.title}</p>
              <p className="text-sm text-muted-foreground">x{qty}</p>
              <p className="mt-1">{(product.price / 100).toFixed(2)} €</p>
              <p className="text-sm text-muted-foreground">{t("checkout.vatIncluded")}</p>
            </div>
          </div>
          <hr className="my-3" />
          <p className="font-semibold">Summe: {total.toFixed(2)} €</p>
          <p className="text-sm text-muted-foreground">{t("checkout.freeShipping")}</p>
        </aside>

        <form onSubmit={form.handleSubmit(submit)} className="md:col-span-2 space-y-6">
          <section aria-labelledby="personalization" className="space-y-3">
            <h2 id="personalization" className="font-medium">{t("product.shortDescription")}</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">{t("product.name")}</label>
                <Input {...form.register("personal_name")} />
                {form.formState.errors.personal_name && <p className="text-destructive text-sm mt-1">{t("product.name")}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{t("product.partnerName")}</label>
                <Input {...form.register("personal_partner")} />
                {form.formState.errors.personal_partner && <p className="text-destructive text-sm mt-1">{t("product.partnerName")}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{t("product.date")}</label>
                <Input {...form.register("personal_date")} />
                {form.formState.errors.personal_date && <p className="text-destructive text-sm mt-1">{t("product.date")}</p>}
              </div>
            </div>
          </section>

          <section aria-labelledby="contact" className="space-y-3">
            <h2 id="contact" className="font-medium">{t("checkout.customer")}</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">{t("checkout.name")}</label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{t("checkout.name")}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{t("checkout.email")}</label>
                <Input type="email" {...form.register("email")} />
                {form.formState.errors.email && <p className="text-destructive text-sm mt-1">{t("checkout.email")}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{t("checkout.phone")}</label>
                <Input {...form.register("phone")} />
                {form.formState.errors.phone && <p className="text-destructive text-sm mt-1">{t("checkout.phone")}</p>}
              </div>
            </div>
          </section>

          <section aria-labelledby="address" className="space-y-3">
            <h2 id="address" className="font-medium">{t("checkout.address")}</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">{t("checkout.street")}</label>
                <Input {...form.register("street")} />
                {form.formState.errors.street && <p className="text-destructive text-sm mt-1">{t("checkout.street")}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm mb-1">{t("checkout.zip")}</label>
                  <Input {...form.register("zip")} />
                  {form.formState.errors.zip && <p className="text-destructive text-sm mt-1">{t("checkout.zip")}</p>}
                </div>
                <div className="col-span-2">
                  <label className="block text-sm mb-1">{t("checkout.city")}</label>
                  <Input {...form.register("city")} />
                  {form.formState.errors.city && <p className="text-destructive text-sm mt-1">{t("checkout.city")}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">{t("checkout.country")}</label>
                <Input {...form.register("country")} />
                {form.formState.errors.country && <p className="text-destructive text-sm mt-1">{t("checkout.country")}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">{t("checkout.notes")}</label>
                <Textarea {...form.register("notes")} />
              </div>
            </div>
          </section>

          <Button type="submit" className="w-full md:w-auto">{t("cta.sendInquiry")}</Button>
        </form>
      </div>
    </div>
  );
}
