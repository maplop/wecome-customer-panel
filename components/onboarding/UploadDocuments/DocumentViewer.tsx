import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { File } from '@/lib/icons'

interface DocumentViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  name: string
}

function isPdf(url: string): boolean {
  return url.startsWith('data:application/pdf') || url.toLowerCase().includes('.pdf')
}

function isImage(url: string): boolean {
  return url.startsWith('data:image') || /\.(png|jpe?g|webp|gif|bmp|svg)/i.test(url.split('?')[0].split('#')[0])
}

export default function DocumentViewer({ open, onOpenChange, url, name }: DocumentViewerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] h-[90vh] p-0" showCloseButton>
        <DialogTitle className="sr-only">{name}</DialogTitle>
        <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-border">
          <h2 className="text-sm font-medium text-foreground truncate">{name}</h2>
        </div>
        <div className="flex-1 overflow-auto px-6 pb-4">
          {isPdf(url) ? (
            <iframe
              src={url}
              className="w-full h-[calc(90vh-8rem)] rounded-lg border border-border"
              title={name}
            />
          ) : isImage(url) ? (
            <div className="flex items-center justify-center min-h-[calc(90vh-8rem)]">
              <img
                src={url}
                alt={name}
                className="max-w-full max-h-[calc(90vh-8rem)] object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 min-h-[calc(90vh-8rem)] text-muted-foreground">
              <File className="w-16 h-16" />
              <p className="text-sm">No se puede previsualizar este tipo de archivo</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
