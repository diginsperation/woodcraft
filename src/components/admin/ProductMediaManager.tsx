import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "./FileUpload";
import { GripVertical, X, Plus, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface ProductImage {
  id?: string;
  url: string;
  alt: string;
  sort_order: number;
}

interface ProductMediaManagerProps {
  productId?: string;
  mainImageUrl: string;
  onMainImageChange: (url: string) => void;
  videoMode: string;
  onVideoModeChange: (mode: string) => void;
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  youtubeUrl: string;
  onYoutubeUrlChange: (url: string) => void;
}

export function ProductMediaManager({
  productId,
  mainImageUrl,
  onMainImageChange,
  videoMode,
  onVideoModeChange,
  videoUrl,
  onVideoUrlChange,
  youtubeUrl,
  onYoutubeUrlChange
}: ProductMediaManagerProps) {
  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [newImageAlt, setNewImageAlt] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (productId) {
      loadGalleryImages();
    }
  }, [productId]);

  const loadGalleryImages = async () => {
    if (!productId) return;
    
    const { data, error } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (error) {
      toast.error(`Fehler beim Laden der Bilder: ${error.message}`);
      return;
    }

    setGalleryImages(data || []);
  };

  const saveGalleryImage = async (url: string) => {
    if (!productId || !url) return;

    const newImage: ProductImage = {
      url,
      alt: newImageAlt || "Produktbild",
      sort_order: galleryImages.length
    };

    const { data, error } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        url: newImage.url,
        alt: newImage.alt,
        sort_order: newImage.sort_order
      })
      .select()
      .single();

    if (error) {
      toast.error(`Fehler beim Speichern: ${error.message}`);
      return;
    }

    setGalleryImages([...galleryImages, { ...newImage, id: data.id }]);
    setNewImageAlt("");
    toast.success("Bild hinzugefügt");
  };

  const updateImageAlt = async (imageId: string, alt: string) => {
    const { error } = await supabase
      .from("product_images")
      .update({ alt })
      .eq("id", imageId);

    if (error) {
      toast.error(`Fehler beim Aktualisieren: ${error.message}`);
      return;
    }

    setGalleryImages(galleryImages.map(img => 
      img.id === imageId ? { ...img, alt } : img
    ));
  };

  const deleteGalleryImage = async (imageId: string, imageUrl: string) => {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error) {
      toast.error(`Fehler beim Löschen: ${error.message}`);
      return;
    }

    // Remove file from storage if it's hosted there
    if (imageUrl.includes("product-media")) {
      try {
        const path = imageUrl.split("/product-media/")[1];
        await supabase.storage.from("product-media").remove([path]);
      } catch (error) {
        console.error("Error removing file from storage:", error);
      }
    }

    setGalleryImages(galleryImages.filter(img => img.id !== imageId));
    toast.success("Bild gelöscht");
  };

  const deleteAllGalleryImages = async () => {
    if (galleryImages.length === 0) return;

    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);

    if (error) {
      toast.error(`Fehler beim Löschen aller Bilder: ${error.message}`);
      return;
    }

    // Remove files from storage
    const storagePaths = galleryImages
      .filter(img => img.url.includes("product-media"))
      .map(img => img.url.split("/product-media/")[1]);

    if (storagePaths.length > 0) {
      try {
        await supabase.storage.from("product-media").remove(storagePaths);
      } catch (error) {
        console.error("Error removing files from storage:", error);
      }
    }

    setGalleryImages([]);
    toast.success("Alle Galerie-Bilder gelöscht");
  };

  const resetVideo = async () => {
    // Remove uploaded video file from storage if exists
    if (videoMode === "upload" && videoUrl && videoUrl.includes("product-media")) {
      try {
        const path = videoUrl.split("/product-media/")[1];
        await supabase.storage.from("product-media").remove([path]);
        toast.success("Video-Datei aus Speicher entfernt");
      } catch (error) {
        console.error("Error removing video file:", error);
      }
    }

    // Update local state
    onVideoModeChange("none");
    onVideoUrlChange("");
    onYoutubeUrlChange("");

    // Update database if product exists
    if (productId) {
      const { error } = await supabase
        .from("products")
        .update({
          video_mode: "none",
          video_url: null,
          youtube_url: null
        })
        .eq("id", productId);

      if (error) {
        toast.error(`Fehler beim Zurücksetzen: ${error.message}`);
        return;
      }
    }

    toast.success("Video-Einstellungen zurückgesetzt");
  };

  const handleMainImageChange = async (url: string) => {
    onMainImageChange(url);
    
    // Update database immediately if product exists and we're clearing the image
    if (productId && !url) {
      const { error } = await supabase
        .from("products")
        .update({ main_image_url: null })
        .eq("id", productId);

      if (error) {
        toast.error(`Fehler beim Aktualisieren: ${error.message}`);
        return;
      }
      toast.success("Hauptbild entfernt");
    }
  };

  const updateSortOrder = async () => {
    const updates = galleryImages.map((img, index) => ({
      id: img.id,
      sort_order: index
    }));

    for (const update of updates) {
      if (update.id) {
        await supabase
          .from("product_images")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...galleryImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setGalleryImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      updateSortOrder();
    }
    setDraggedIndex(null);
  };

  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const handleYouTubeUrlChange = (url: string) => {
    if (url && !validateYouTubeUrl(url)) {
      toast.error("Bitte eine gültige YouTube-URL eingeben");
      return;
    }
    onYoutubeUrlChange(url);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="main-image" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="main-image">Hauptbild</TabsTrigger>
          <TabsTrigger value="gallery">Galerie</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>

        <TabsContent value="main-image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hauptbild (Pflicht)</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUpload={handleMainImageChange}
                currentUrl={mainImageUrl}
                bucketPath={productId ? `product/${productId}/main` : "temp/main"}
                placeholder="Hauptbild hier ablegen oder klicken zum Auswählen"
                showDeleteConfirmation={true}
                deleteButtonText="Hauptbild löschen"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Neues Galerie-Bild hinzufügen
                </div>
                {galleryImages.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Alle löschen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Alle Galerie-Bilder löschen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Diese Aktion löscht alle {galleryImages.length} Galerie-Bilder dauerhaft. Dies kann nicht rückgängig gemacht werden.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteAllGalleryImages} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Alle löschen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="image-alt">Alt-Text für das neue Bild</Label>
                <Input
                  id="image-alt"
                  placeholder="z.B. Produktdetail von vorne"
                  value={newImageAlt}
                  onChange={(e) => setNewImageAlt(e.target.value)}
                />
              </div>
              <FileUpload
                onUpload={saveGalleryImage}
                bucketPath={productId ? `product/${productId}/gallery` : "temp/gallery"}
                placeholder="Galerie-Bild hier ablegen oder klicken zum Auswählen"
              />
            </CardContent>
          </Card>

          {galleryImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Galerie-Bilder ({galleryImages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {galleryImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-3 p-3 border rounded-lg"
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <img 
                        src={image.url} 
                        alt={image.alt} 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <Input
                          value={image.alt}
                          onChange={(e) => image.id && updateImageAlt(image.id, e.target.value)}
                          placeholder="Alt-Text"
                          className="text-sm"
                        />
                      </div>
                      <span className="text-sm text-muted-foreground min-w-[2rem]">
                        {index + 1}
                      </span>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Bild löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Dieses Bild wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => image.id && deleteGalleryImage(image.id, image.url)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Video-Einstellungen
                {(videoMode !== "none" || videoUrl || youtubeUrl) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Zurücksetzen
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Video-Einstellungen zurücksetzen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Alle Video-Einstellungen werden gelöscht und auf "Kein Video" zurückgesetzt. 
                          Hochgeladene Video-Dateien werden ebenfalls entfernt.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                        <AlertDialogAction onClick={resetVideo}>
                          Zurücksetzen
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="video-mode">Video-Modus</Label>
                <Select value={videoMode} onValueChange={onVideoModeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Video-Modus auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Kein Video</SelectItem>
                    <SelectItem value="youtube">YouTube-Link</SelectItem>
                    <SelectItem value="upload">Video-Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {videoMode === "youtube" && (
                <div>
                  <Label htmlFor="youtube-url">YouTube-URL</Label>
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                  />
                </div>
              )}

              {videoMode === "upload" && (
                <div>
                  <Label>Video-Datei hochladen</Label>
                  <FileUpload
                    onUpload={onVideoUrlChange}
                    currentUrl={videoUrl}
                    bucketPath={productId ? `product/${productId}/video` : "temp/video"}
                    accept={{ "video/*": [".mp4", ".webm", ".mov"] }}
                    maxSize={100 * 1024 * 1024} // 100MB für Videos
                    placeholder="Video hier ablegen oder klicken zum Auswählen"
                    showDeleteConfirmation={true}
                    deleteButtonText="Video löschen"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}