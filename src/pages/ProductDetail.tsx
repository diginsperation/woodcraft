import { useParams, useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { GalleryLightbox } from "@/components/GalleryLightbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { strings } from "@/content/strings.de";
import { Seo } from "@/components/Seo";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

const nameRegex = /^[A-Za-zÄÖÜäöüß \-&]{1,24}$/;

const schema = z
  .object({
    quantity: z.coerce.number().int().min(1).max(99),
    personalizationEnabled: z.boolean().default(false),
    name: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z
        .string()
        .max(24)
        .regex(nameRegex, { message: "Bitte nur Buchstaben, Leerzeichen, - und & (1–24 Zeichen)." })
        .optional()
    ),
    partner: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
      z
        .string()
        .max(24)
        .regex(nameRegex, { message: "Bitte nur Buchstaben, Leerzeichen, - und & (1–24 Zeichen)." })
        .optional()
    ),
    date: z.date().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.personalizationEnabled) {
      if (!v.name) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "Bitte gib deinen Namen ein." });
      if (!v.partner) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["partner"], message: "Bitte gib den Partnernamen ein." });
      if (!v.date) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Bitte wähle ein Datum." });
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = new Date(v.date);
        d.setHours(0, 0, 0, 0);
        if (d < today)
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Datum darf nicht in der Vergangenheit liegen." });
      }
    }
  });

type FormData = z.infer<typeof schema>;

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const product = products.find((p) => p.slug === slug);
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, personalizationEnabled: false, name: "", partner: "", date: undefined },
    mode: "onChange",
  });

  if (!product) return <div className="container py-10">Not found</div>;

  const submit = (data: FormData) => {
    const payload = {
      productId: product.id,
      productTitle: product.title,
      imageUrl: product.images[0],
      unitPrice: product.price,
      quantity: data.quantity,
      personalizationEnabled: !!data.personalizationEnabled,
      personalization: data.personalizationEnabled
        ? {
            name: data.name!,
            partnerName: data.partner!,
            date: data.date ? data.date.toISOString() : undefined,
          }
        : null,
    };
    try {
      localStorage.setItem("checkoutSelection", JSON.stringify(payload));
    } catch {}
    navigate("/checkout");
  };

  return (
    <div className="container py-10">
      <Seo title={`${product.title} – ${strings.brandName}`} description={product.teaser} canonicalPath={`/product/${product.slug}`} />
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <GalleryLightbox images={product.images} alt={product.title} />
        </div>
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl">{product.title}</h1>
          <p className="mt-2 text-muted-foreground">{product.teaser}</p>
          <p className="mt-4 text-2xl font-semibold">{(product.price / 100).toFixed(2)} € <span className="text-sm text-muted-foreground">({strings.product.priceInclVat})</span></p>

          <form onSubmit={form.handleSubmit(submit)} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm mb-1">Menge</label>
              <Input type="number" min={1} max={99} {...form.register("quantity", { valueAsNumber: true })} />
              {form.formState.errors.quantity && (
                <p className="text-destructive text-sm mt-1">{form.formState.errors.quantity.message as string}</p>
              )}
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="text-sm">{strings.personalization.toggle}</label>
              <Switch
                checked={!!form.watch("personalizationEnabled")}
                onCheckedChange={(v) => form.setValue("personalizationEnabled", v, { shouldValidate: true })}
              />
            </div>

            {form.watch("personalizationEnabled") && (
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <label className="block text-sm mb-1">{strings.personalization.name}</label>
                    <Input {...form.register("name")} />
                    {form.formState.errors.name && (
                      <p className="text-destructive text-sm mt-1">{form.formState.errors.name.message as string}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{strings.personalization.partner}</label>
                    <Input {...form.register("partner")} />
                    {form.formState.errors.partner && (
                      <p className="text-destructive text-sm mt-1">{form.formState.errors.partner.message as string}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{strings.personalization.date}</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" type="button" className="w-full justify-start font-normal">
                          {form.watch("date") ? format(form.watch("date") as Date, "dd.MM.yyyy") : "Datum"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="p-0">
                        <Calendar
                          mode="single"
                          selected={form.watch("date")}
                          onSelect={(d) => d && form.setValue("date", d, { shouldValidate: true })}
                          disabled={(d) => {
                            const today = new Date(); today.setHours(0,0,0,0);
                            const dd = new Date(d); dd.setHours(0,0,0,0);
                            return dd < today;
                          }}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.date && (
                      <p className="text-destructive text-sm mt-1">{form.formState.errors.date.message as string}</p>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {strings.personalization.hint}
                  </p>
                </CardContent>
              </Card>
            )}

            <Button type="submit" className="w-full">{strings.product.ctaInquiry}</Button>
          </form>
        </div>
      </div>

      <section className="mt-12 grid md:grid-cols-3 gap-8" aria-labelledby="details">
        <div className="md:col-span-2">
          <h2 id="details" className="font-playfair text-2xl mb-4">{strings.product.description}</h2>
          <article className="prose max-w-none">
            <h3>{strings.product.story}</h3>
            <p>{product.story}</p>
            <h3>{strings.product.material}</h3>
            <p>{product.material}</p>
            <h3>{strings.product.care}</h3>
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
