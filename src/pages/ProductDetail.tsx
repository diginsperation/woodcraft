import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductGallery } from "@/components/ProductGallery";
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
import { Skeleton } from "@/components/ui/skeleton";
import wood1 from "@/assets/wood-board-1.jpg";
import woodDetail from "@/assets/wood-detail-1.jpg";
import woodShop from "@/assets/wood-shop-1.jpg";
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

  const [loading, setLoading] = useState(true);
  const [dbProduct, setDbProduct] = useState<any | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, personalizationEnabled: false, name: "", partner: "", date: undefined },
    mode: "onChange",
  });

  useEffect(() => {
    setLoading(true);
    if (!slug) {
      setDbProduct(null);
      setLoading(false);
      return;
    }
    supabase
      .from("products")
      .select("id,slug,title,description,base_price,active,main_image_url,video_mode,video_url,youtube_url,seo_title,seo_description,details")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setDbProduct(null);
        } else {
          setDbProduct(data);
        }
        setLoading(false);
      });
  }, [slug]);

  const mapped = useMemo(() => {
    if (!dbProduct) return null;
    const details: any = (dbProduct as any).details || {};
    
    // Build gallery images array
    let images: string[] = [];
    
    // Add main image if available
    if ((dbProduct as any).main_image_url) {
      images.push((dbProduct as any).main_image_url);
    }
    
    // Add legacy images from details
    if (Array.isArray(details.images) && details.images.length) {
      images.push(...details.images);
    }
    
    // Fallback to default images if none available
    if (images.length === 0) {
      images = [wood1, woodDetail, woodShop];
    }
    
    // Handle video
    let videoUrl = null;
    const videoMode = (dbProduct as any).video_mode || "none";
    if (videoMode === "youtube" && (dbProduct as any).youtube_url) {
      videoUrl = (dbProduct as any).youtube_url;
    } else if (videoMode === "upload" && (dbProduct as any).video_url) {
      videoUrl = (dbProduct as any).video_url;
    }
    
    return {
      id: dbProduct.id,
      slug: dbProduct.slug,
      title: dbProduct.title as string,
      teaser: ((dbProduct.description as string | null) ?? "").slice(0, 160),
      priceCents: Math.round(Number(dbProduct.base_price) * 100),
      images,
      story: details.story ?? "",
      material: details.material ?? "",
      care: details.care ?? "",
      seoTitle: (dbProduct.seo_title as string | null) ?? null,
      seoDescription: (dbProduct.seo_description as string | null) ?? null,
      youtubeUrl: videoUrl,
      videoMode,
    };
  }, [dbProduct]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-[320px] w-full" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!mapped) return <div className="container py-10">Not found</div>;

  const submit = (data: FormData) => {
    const payload = {
      productId: mapped.id,
      productTitle: mapped.title,
      imageUrl: mapped.images[0],
      unitPrice: mapped.priceCents,
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

  const seoTitle = mapped.seoTitle || `${mapped.title} – ${strings.brandName}`;
  const seoDescription = mapped.seoDescription || mapped.teaser;
  const canonicalPath = `/product/${mapped.slug}`;
  

  return (
    <div className="w-full overflow-x-hidden">
      <div className="max-w-screen-xl mx-auto px-4 py-6 sm:py-10">
        <Seo title={seoTitle} description={seoDescription} canonicalPath={canonicalPath} />
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <div>
          <ProductGallery
            productId={mapped.id}
            mainImageUrl={(dbProduct as any).main_image_url}
            productTitle={mapped.title}
            videoMode={mapped.videoMode}
            videoUrl={mapped.youtubeUrl}
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl break-words">{mapped.title}</h1>
          <p className="mt-2 text-muted-foreground break-words">{mapped.teaser}</p>
          <p className="mt-4 text-xl sm:text-2xl font-semibold break-words">{(mapped.priceCents / 100).toFixed(2)} € <span className="text-sm text-muted-foreground">({strings.product.priceInclVat})</span></p>

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

            <Button type="submit" className="w-full h-12 text-sm sm:text-base">{strings.product.ctaInquiry}</Button>
          </form>
        </div>
      </div>

        <section className="mt-8 sm:mt-12" aria-labelledby="details">
          <div className="min-w-0">
            <h2 id="details" className="font-playfair text-xl sm:text-2xl mb-4 break-words">{strings.product.description}</h2>
            <article className="prose prose-sm sm:prose max-w-none break-words [&_*]:break-words [&_*]:overflow-wrap-anywhere">
              <h3 className="text-base sm:text-lg">{strings.product.story}</h3>
              <p className="text-sm sm:text-base">{mapped.story}</p>
              <h3 className="text-base sm:text-lg">{strings.product.material}</h3>
              <p className="text-sm sm:text-base">{mapped.material}</p>
              <h3 className="text-base sm:text-lg">{strings.product.care}</h3>
              <p className="text-sm sm:text-base">{mapped.care}</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}