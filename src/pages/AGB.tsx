import { Seo } from "@/components/Seo";
import { strings } from "@/content/strings.de";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ScrollText, Shield, Users } from "lucide-react";

export default function AGB() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${strings.legal.agbTitle} – ${strings.brandName}`}
        description={strings.legal.agbDescription}
        canonicalPath="/agb"
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 md:py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <ScrollText className="w-4 h-4 mr-1" />
              Rechtliche Informationen
            </Badge>
            <h1 className="font-playfair text-3xl md:text-5xl font-semibold mb-4 text-foreground">
              {strings.legal.agbTitle}
            </h1>
            <p className="text-lg text-muted-foreground">
              Transparente Geschäftsbedingungen für eine vertrauensvolle Zusammenarbeit
            </p>
          </div>
        </div>
      </section>

      <main className="container py-12 md:py-16">
        {/* Quick Navigation */}
        <div className="mb-8">
          <h2 className="font-playfair text-2xl mb-4">Weitere rechtliche Dokumente</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/datenschutz" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Datenschutz
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/widerruf" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Widerruf
              </Link>
            </Button>
          </div>
        </div>

        {/* Content Card */}
        <Card className="shadow-sm">
          <CardContent className="p-8 md:p-12">
            <article className="prose prose-neutral dark:prose-invert max-w-none">
              <div className="bg-accent/50 rounded-lg p-6 mb-8 border border-accent">
                <h2 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2">
                  <ScrollText className="w-5 h-5" />
                  Allgemeine Geschäftsbedingungen
                </h2>
                <p className="text-muted-foreground mb-4">
                  Diese Seite befindet sich noch in der Entwicklung. Die vollständigen AGB werden in Kürze hier verfügbar sein.
                </p>
                <div className="bg-background/50 rounded-md p-4 border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Hinweis:</strong> Bis zur Veröffentlichung der finalen AGB gelten unsere Standard-Geschäftsbedingungen für Handwerksbetriebe nach deutschem Recht.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold text-foreground">Was Sie hier finden werden:</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                    <li>Geltungsbereich und Vertragspartner</li>
                    <li>Angebote und Vertragsschluss</li>
                    <li>Preise und Zahlungsbedingungen</li>
                    <li>Lieferung und Leistungserbringung</li>
                    <li>Gewährleistung und Haftung</li>
                    <li>Widerrufsrecht für Verbraucher</li>
                    <li>Schlussbestimmungen</li>
                  </ul>
                </section>

                <section className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Kontakt bei Fragen</h3>
                  <p className="text-muted-foreground">
                    Bei Fragen zu unseren Geschäftsbedingungen oder anderen rechtlichen Aspekten können Sie uns jederzeit kontaktieren. 
                    Wir stehen Ihnen gerne für Klarstellungen zur Verfügung.
                  </p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link to="/#contact-icons">Kontakt aufnehmen</Link>
                    </Button>
                  </div>
                </section>
              </div>
            </article>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
