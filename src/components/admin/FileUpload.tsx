import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onUpload: (url: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  currentUrl?: string;
  bucketPath: string;
  allowUrlInput?: boolean;
  placeholder?: string;
  className?: string;
}

export function FileUpload({
  onUpload,
  accept = { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
  maxSize = 10 * 1024 * 1024, // 10MB default
  currentUrl = "",
  bucketPath,
  allowUrlInput = true,
  placeholder = "Datei hier ablegen oder klicken zum Auswählen",
  className = ""
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [urlInput, setUrlInput] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Convert to WebP and compress if it's an image
      let fileToUpload = file;
      if (file.type.startsWith("image/")) {
        fileToUpload = await compressImage(file);
      }

      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${bucketPath}/${fileName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error } = await supabase.storage
        .from("product-media")
        .upload(filePath, fileToUpload, {
          cacheControl: "3600",
          upsert: false
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      const { data } = supabase.storage
        .from("product-media")
        .getPublicUrl(filePath);

      onUpload(data.publicUrl);
      toast.success("Datei erfolgreich hochgeladen");
    } catch (error: any) {
      toast.error(`Upload-Fehler: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [bucketPath, onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
    disabled: isUploading
  });

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1920;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
              type: "image/webp"
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, "image/webp", 0.85);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpload(urlInput.trim());
      setUrlInput("");
      toast.success("URL hinzugefügt");
    }
  };

  const removeFile = async () => {
    if (currentUrl && currentUrl.includes("product-media")) {
      try {
        const path = currentUrl.split("/product-media/")[1];
        await supabase.storage.from("product-media").remove([path]);
      } catch (error) {
        console.error("Error removing file:", error);
      }
    }
    onUpload("");
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {currentUrl ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img src={currentUrl} alt="Vorschau" className="w-16 h-16 object-cover rounded" />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{currentUrl.split('/').pop() || "Datei"}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUrl}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? "border-primary bg-primary/5" 
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm font-medium mb-2">
              {isDragActive ? "Datei hier ablegen..." : placeholder}
            </p>
            <p className="text-xs text-muted-foreground">
              Max. Größe: {(maxSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          {allowUrlInput && (
            <Card>
              <CardContent className="pt-4">
                <Label htmlFor="url-input" className="text-sm">Oder URL eingeben:</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="url-input"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={isUploading}
                  />
                  <Button 
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim() || isUploading}
                    size="sm"
                  >
                    Hinzufügen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}