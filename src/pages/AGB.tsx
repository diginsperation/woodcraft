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

        {/* Document Display Card */}
        <Card className="shadow-sm">
          <CardContent className="p-8 md:p-12">
            <div className="space-y-8">
              {/* Document Header */}
              <div className="bg-accent/50 rounded-lg p-6 border border-accent">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ScrollText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Allgemeine Geschäftsbedingungen
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Letzte Aktualisierung: Coming soon
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" disabled className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF Download
                  </Button>
                </div>
                
                <div className="bg-background/50 rounded-md p-4 border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Status:</strong> Das AGB-Dokument wird bald über das Admin-Interface hochgeladen und hier zum Download bereitgestellt.
                  </p>
                </div>
              </div>

              {/* Document Preview/Content Area */}
              <div className="border rounded-lg bg-background/50">
                <div className="p-6 border-b bg-muted/20">
                  <h3 className="font-semibold text-foreground">Dokumentvorschau</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hier wird das hochgeladene AGB-Dokument angezeigt
                  </p>
                </div>
                
                <div className="p-8 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-muted/50 rounded-lg flex items-center justify-center">
                      <ScrollText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Noch kein Dokument verfügbar</h4>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Das AGB-Dokument wird über das Admin-Interface hochgeladen und steht dann hier zur Ansicht und zum Download bereit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div className="bg-muted/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Bei Fragen zu unseren AGB
                </h3>
                <p className="text-muted-foreground mb-4">
                  Falls Sie Fragen zu unseren Allgemeinen Geschäftsbedingungen haben oder weitere Informationen benötigen, kontaktieren Sie uns gerne.
                </p>
                <Button asChild>
                  <Link to="/#contact-icons" className="flex items-center gap-2">
                    Kontakt aufnehmen
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
