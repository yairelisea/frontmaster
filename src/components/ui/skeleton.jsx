// src/components/ui/skeleton.jsx
import React from "react";
import { cn } from "@/lib/utils"; // si usas la función cn, asegúrate de tenerla

/**
 * Skeleton de carga (shimmer) simple.
 * Uso:
 *   <Skeleton className="h-6 w-40" />
 */
const Skeleton = React.forwardRef(function Skeleton({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
});

export { Skeleton };
export default Skeleton;