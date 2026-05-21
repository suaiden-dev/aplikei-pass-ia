export interface CompressImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

const IMAGE_MIME_PREFIX = "image/"

function isCompressibleImage(file: File) {
  return file.type.startsWith(IMAGE_MIME_PREFIX)
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Falha ao carregar imagem para compressão."))
    }
    img.src = objectUrl
  })
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao gerar blob comprimido."))
          return
        }
        resolve(blob)
      },
      "image/jpeg",
      quality,
    )
  })
}

export async function compressImageForUpload(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  if (!isCompressibleImage(file)) return file

  const maxWidth = options.maxWidth ?? 1920
  const maxHeight = options.maxHeight ?? 1920
  const initialQuality = options.quality ?? 0.82

  const img = await loadImage(file)
  const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) return file

  ctx.drawImage(img, 0, 0, width, height)
  const blob = await toBlob(canvas, initialQuality)

  if (blob.size >= file.size) return file

  const baseName = file.name.replace(/\.[^.]+$/, "")
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  })
}
