import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { strings } from "@/content/strings.de";
import { Seo } from "@/components/Seo";

export default function ThankYou() {
  
  const { state } = useLocation() as any;
  const product = state?.product;
  const qty = state?.qty;
  const data = state?.data;
  const personalized = !!state?.personalizationEnabled;

  return (
    <div className="container py-10">
      <Seo title={`${strings.thank.headline} – ${strings.brandName}`} description={strings.thank.text} canonicalPath="/thank-you" />
      <h1 className="font-playfair text-3xl md:text-4xl">{strings.thank.headline}</h1>
      <p className="mt-2 text-muted-foreground">{personalized ? strings.thank.textPersonalized : strings.thank.textStandard}</p>

      {product && (
        <section className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="rounded-lg border p-4">
            <h2 className="font-medium mb-2">Produkt</h2>
            <div className="flex gap-3">
              <img src={product.images[0]} alt={product.title} className="h-16 w-16 object-cover rounded-md border" />
              <div>
                <p className="font-medium">{product.title}</p>
                <p className="text-sm text-muted-foreground">x{qty}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <h2 className="font-medium mb-2">Deine Angaben</h2>
            <ul className="text-sm space-y-1">
              <li>Name: {data?.name}</li>
              <li>Email: {data?.email}</li>
              <li>Telefon: {data?.phone}</li>
              <li>Straße: {data?.street}</li>
              <li>PLZ/Ort: {data?.zip} {data?.city}</li>
              <li>Land: {data?.country}</li>
              <li>Personalisierung: {data?.personal_name} & {data?.personal_partner} ({data?.personal_date})</li>
            </ul>
          </div>
        </section>
      )}

      <div className="mt-8 flex gap-3">
        <Button asChild variant="secondary"><Link to="/">{strings.thank.backHome}</Link></Button>
        <Button asChild><Link to="/products">{strings.thank.moreProducts}</Link></Button>
      </div>
    </div>
  );
}
