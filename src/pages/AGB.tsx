import { Seo } from "@/components/Seo";
import { strings } from "@/content/strings.de";

export default function AGB() {
  return (
    <div className="container py-10">
      <Seo
        title={`${strings.legal.agbTitle} – ${strings.brandName}`}
        description={strings.legal.agbDescription}
        canonicalPath="/agb"
      />
      <main>
        <h1 className="font-playfair text-3xl md:text-4xl mb-4">
          {strings.legal.agbTitle}
        </h1>
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <p>
            Platzhalter: Hier stehen später die Allgemeinen Geschäftsbedingungen (AGB).
          </p>
        </article>
      </main>
    </div>
  );
}
