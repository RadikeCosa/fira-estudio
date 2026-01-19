import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * TextureDivider - Full-width grayscale texture divider
 * 
 * Displays a panoramic texture image (linen, fabric) with grayscale filter
 * to create visual separation between sections while maintaining boutique aesthetic.
 */

interface TextureDividerProps {
  /**
   * Path to texture image (relative to public folder)
   * Default: /images/textures/linen-texture.jpg
   */
  imagePath?: string;
  /**
   * Alt text for accessibility
   */
  alt?: string;
  /**
   * Custom CSS classes
   */
  className?: string;
}

export function TextureDivider({
  imagePath = "/images/about.webp", // Temporary: using existing image until linen-texture.jpg is added
  alt = "Textura de lino natural",
  className,
}: TextureDividerProps) {
  return (
    <div
      className={cn(
        "relative h-[200px] w-full overflow-hidden sm:h-[250px] lg:h-[300px]",
        className,
      )}
    >
      <Image
        src={imagePath}
        alt={alt}
        fill
        className="object-cover grayscale opacity-30"
        priority={false}
        sizes="100vw"
      />
    </div>
  );
}
