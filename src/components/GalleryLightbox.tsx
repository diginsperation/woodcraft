import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GalleryLightbox({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="aspect-square w-full overflow-hidden rounded-md border">
        <img
          src={images[active]}
          alt={alt}
          className="h-full w-full object-cover cursor-zoom-in"
          onClick={() => setOpen(true)}
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <button key={i} className={`h-20 rounded-md overflow-hidden border ${i === active ? "ring-2 ring-ring" : ""}`} onClick={() => setActive(i)}>
            <img src={src} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <img src={images[active]} alt={alt} className="w-full h-auto" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
