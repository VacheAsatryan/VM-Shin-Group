"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackText?: string;
  fallbackClassName?: string;
}

export default function SafeImage({
  src,
  alt,
  fallbackText = "VM SHIN GROUP",
  fallbackClassName = "",
  className = "",
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-600 font-mono text-xs text-center p-2 border border-zinc-800/80 select-none ${fallbackClassName}`}
      >
        <span className="text-xl mb-1 opacity-40">🏢</span>
        <span className="truncate max-w-full text-[11px] opacity-60 font-sans font-medium">
          {fallbackText}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt || "News image"}
      className={className}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}
