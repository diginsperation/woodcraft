import { Seo } from "@/components/Seo";
import { strings } from "@/content/strings.de";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Eye, ScrollText, Shield, Users, Building, MapPin, Phone, Mail, Camera } from "lucide-react";

export default function Impressum() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`Impressum – ${strings.brandName}`}
        description="Impressum und Kontaktdaten unseres Unternehmens"
        canonicalPath="/impressum"
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16 md:py-20">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4">
              <Building className="w-4 h-4 mr-1" />
              Rechtliche Angaben
            </Badge>
            <h1 className="font-playfair text-3xl md:text-5xl font-semibold mb-4 text-foreground">
              Impressum
            </h1>
            <p className="text-lg text-muted-foreground">
              Rechtliche Angaben und Kontaktinformationen unseres Unternehmens
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
              <Link to="/agb" className="flex items-center gap-2">
                <ScrollText className="w-4 h-4" />
                AGB
              </Link>
            </Button>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardContent className="p-8 md:p-12">
                <div className="space-y-8">
                  {/* Document Header */}
                  <div className="bg-accent/50 rounded-lg p-6 border border-accent">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Eye className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">
                            Impressum
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Letzte Aktualisierung: Coming soon
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-background/50 rounded-md p-4 border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Status:</strong> Die Impressums-Daten werden über das Admin-Interface verwaltet und hier angezeigt.
                      </p>
                    </div>
                  </div>

                  {/* Company Info Placeholders */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-3">
                          <Building className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Firmeninformationen</h3>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>Firma:</strong> [Wird vom Admin eingegeben]</p>
                          <p><strong>Rechtsform:</strong> [Wird vom Admin eingegeben]</p>
                          <p><strong>Handelsregister:</strong> [Wird vom Admin eingegeben]</p>
                          <p><strong>USt-IdNr.:</strong> [Wird vom Admin eingegeben]</p>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Adresse</h3>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>[Straße und Hausnummer]</p>
                          <p>[PLZ Ort]</p>
                          <p>[Land]</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-muted/30 rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-3">
                          <Phone className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Kontakt</h3>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>Telefon:</strong> [Wird vom Admin eingegeben]</p>
                          <p><strong>E-Mail:</strong> [Wird vom Admin eingegeben]</p>
                          <p><strong>Website:</strong> [Wird vom Admin eingegeben]</p>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold text-foreground">Vertretung</h3>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><strong>Geschäftsführer:</strong> [Name]</p>
                          <p><strong>Vertretungsberechtigt:</strong> [Details]</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Legal Info */}
                  <div className="bg-background/50 border rounded-lg p-6">
                    <h3 className="font-semibold text-foreground mb-4">Weitere rechtliche Angaben</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p><strong>Aufsichtsbehörde:</strong> [Wird vom Admin eingegeben]</p>
                      <p><strong>Berufsbezeichnung:</strong> [Wird vom Admin eingegeben]</p>
                      <p><strong>Zuständige Kammer:</strong> [Wird vom Admin eingegeben]</p>
                      <p><strong>Berufshaftpflichtversicherung:</strong> [Details werden vom Admin eingegeben]</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Images */}
          <div className="space-y-6">
            {/* Company Image Placeholder */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Unser Unternehmen</h3>
                </div>
                <div className="aspect-square bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Firmenlogo/Bild</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  [Beschreibung wird vom Admin eingegeben]
                </p>
              </CardContent>
            </Card>

            {/* Team Image Placeholder */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Unser Team</h3>
                </div>
                <div className="aspect-video bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Team-Foto</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  [Team-Beschreibung wird vom Admin eingegeben]
                </p>
              </CardContent>
            </Card>

            {/* Location Image Placeholder */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Standort</h3>
                </div>
                <div className="aspect-video bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Building className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Standort-Foto</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  [Standort-Beschreibung wird vom Admin eingegeben]
                </p>
              </CardContent>
            </Card>

            {/* Quick Contact */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Schnellkontakt
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Haben Sie Fragen zu unserem Impressum oder möchten Sie uns kontaktieren?
                </p>
                <Button asChild className="w-full">
                  <Link to="/#contact-icons">
                    Kontakt aufnehmen
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}