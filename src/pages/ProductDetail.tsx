import { useParams, useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/I18nProvider";
import { Seo } from "@/components/Seo";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const schema = z.object({
  quantity: z.coerce.number().int().min(1).max(99),
  name: z.string().min(1),
  partner: z.string().min(1),
  date: z.date(),
});

type FormData = z.infer<typeof schema>;

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const product = products.find((p) => p.slug === slug);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, name: "", partner: "", date: new Date() },
    mode: "onChange",
  });

  if (!product) return <div className="container py-10">Not found</div>;

  const submit = (data: FormData) => {
    const search = new URLSearchParams({
      product: product.slug,
      qty: String(data.quantity),
      name: data.name,
      partner: data.partner,
      date: data.date.toISOString(),
    }).toString();
    navigate(`/checkout?${search}`);
  };

  return (
    <div className="container py-10">
      <Seo title={`${product.title} – ${t("brand.name")}`} description={product.teaser} canonicalPath={`/product/${product.slug}`} />
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <GalleryLightbox images={product.images} alt={product.title} />
        </div>
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl">{product.title}</h1>
          <p className="mt-2 text-muted-foreground">{product.teaser}</p>
          <p className="mt-4 text-2xl font-semibold">{(product.price / 100).toFixed(2)} € <span className="text-sm text-muted-foreground">({t("product.priceInclVat")})</span></p>

          <form onSubmit={form.handleSubmit(submit)} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm mb-1">{t("product.quantity")}</label>
              <Input type="number" min={1} max={99} {...form.register("quantity", { valueAsNumber: true })} />
              {form.formState.errors.quantity && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.quantity.message as string}</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">{t("product.name")}</label>
              <Input {...form.register("name")} />
              {form.formState.errors.name && <p className="text-destructive text-sm mt-1">{t("product.name")} {" "}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">{t("product.partnerName")}</label>
              <Input {...form.register("partner")} />
              {form.formState.errors.partner && <p className="text-destructive text-sm mt-1">{t("product.partnerName")} {" "}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1">{t("product.date")}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" type="button" className="w-full justify-start font-normal">
                    {form.watch("date") ? format(form.watch("date"), "PPP") : t("product.date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(d) => d && form.setValue("date", d, { shouldValidate: true })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && <p className="text-destructive text-sm mt-1">{t("product.date")} {" "}</p>}
            </div>
            <Button type="submit" className="w-full">{t("cta.inquiry")}</Button>
          </form>
        </div>
      </div>

      <section className="mt-12 grid md:grid-cols-3 gap-8" aria-labelledby="details">
        <div className="md:col-span-2">
          <h2 id="details" className="font-playfair text-2xl mb-4">{t("product.description")}</h2>
          <article className="prose max-w-none">
            <h3>{t("product.story")}</h3>
            <p>{product.story}</p>
            <h3>{t("product.material")}</h3>
            <p>{product.material}</p>
            <h3>{t("product.care")}</h3>
            <p>{product.care}</p>
          </article>
        </div>
        <div>
          <div className="aspect-video rounded-lg overflow-hidden border bg-black/5">
            <iframe
              title="product video"
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </div>
  );
}
