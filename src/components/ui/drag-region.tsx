
interface DragRegionProps {
  className?: string;
}

export function DragRegion({ className = '' }: DragRegionProps) {
  return (
    <div 
      data-tauri-drag-region="true"
      className={`h-8 w-full title-panel ${className}`} 
    />
  );
} 