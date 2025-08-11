import { Seo } from "@/components/Seo";
import { strings } from "@/content/strings.de";

export default function Widerruf() {
  return (
    <div className="container py-10">
      <Seo
        title={`${strings.legal.widerrufTitle} – ${strings.brandName}`}
        description={strings.legal.widerrufDescription}
        canonicalPath="/widerruf"
      />
      <main>
        <h1 className="font-playfair text-3xl md:text-4xl mb-4">
          {strings.legal.widerrufTitle}
        </h1>
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <p>
            Platzhalter: Hier steht später die Widerrufsbelehrung.
          </p>
        </article>
      </main>
    </div>
  );
}
