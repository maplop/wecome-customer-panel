'use client'

import { File, Trash, Upload } from '@/lib/icons'

interface DocumentUploadFieldProps {
  docId: string
  label: string
  required: boolean
  acceptedTypes: string
  fileData?: { name: string; preview: string }
  error?: string
  uploading: boolean
  loadingExisting?: boolean
  disabled?: boolean
  onFileChange: (docId: string, file: File | null, acceptedTypes: string) => void
  onRemove: (docId: string) => void
}

export default function DocumentUploadField({
  docId,
  label,
  required,
  acceptedTypes,
  fileData,
  error,
  uploading,
  loadingExisting = false,
  disabled = false,
  onFileChange,
  onRemove,
}: DocumentUploadFieldProps) {

  const isImagePreview = Boolean(
    fileData?.preview &&
    (
      fileData.preview.startsWith('data:image') ||
      /\.(png|jpe?g|webp|gif|bmp|svg)/i.test(fileData.preview.split('?')[0])
    ),
  )

  const isLoading = loadingExisting || uploading
  const loadingText = loadingExisting ? 'Cargando documento...' : 'Subiendo documento...'

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      {fileData ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/50">
          {isImagePreview ? (
            <img src={fileData.preview} alt={label} className="w-12 h-12 object-cover rounded-lg" />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-muted">
              <File className="text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{fileData.name}</p>
            <p className="text-xs text-muted-foreground">Cargado exitosamente</p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRemove(docId)}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition"
          >
            <Trash className="w-4.5 h-4.5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-20 rounded-xl border-2 border-dashed border-border hover:border-accent hover:bg-accent/5 transition cursor-pointer">
          <input
            type="file"
            accept={acceptedTypes}
            className="hidden"
            disabled={disabled}
            onChange={(e) => onFileChange(docId, e.target.files?.[0] || null, acceptedTypes)}
          />
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {loadingText}
            </div>
          ) : (
            <>
              <Upload className="text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground">Haz click para subir</span>
            </>
          )}
        </label>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
