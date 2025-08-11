import { Seo } from "@/components/Seo";
import { strings } from "@/content/strings.de";

export default function Datenschutz() {
  return (
    <div className="container py-10">
      <Seo
        title={`${strings.legal.datenschutzTitle} – ${strings.brandName}`}
        description={strings.legal.datenschutzDescription}
        canonicalPath="/datenschutz"
      />
      <main>
        <h1 className="font-playfair text-3xl md:text-4xl mb-4">
          {strings.legal.datenschutzTitle}
        </h1>
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <p>
            Platzhalter: Hier stehen später die Inhalte der Datenschutzerklärung.
          </p>
        </article>
      </main>
    </div>
  );
}
