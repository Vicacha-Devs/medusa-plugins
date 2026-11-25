import {
  Badge,
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui"
import React, { useCallback, useEffect, useMemo, useState } from "react"

interface MediaLibraryAsset {
  id: string
  url: string
  filename: string
  mime_type?: string | null
  folder?: string | null
  role?: string | null
}

export interface MediaPickerButtonProps {
  accept: string
  folder?: string
  role?: string
  buttonLabel?: string
  onSelect: (url: string) => void
}

export const MediaPickerButton: React.FC<MediaPickerButtonProps> = ({
  accept,
  folder,
  role,
  buttonLabel = "Upload / Pick",
  onSelect,
}) => {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"upload" | "library">("upload")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [libraryAssets, setLibraryAssets] = useState<MediaLibraryAsset[]>([])
  const [libraryAvailable, setLibraryAvailable] = useState(true)
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [search, setSearch] = useState("")

  const loadLibrary = useCallback(async () => {
    setLibraryLoading(true)
    try {
      const res = await fetch("/admin/media?limit=100", {
        credentials: "include",
      })
      if (res.status === 404) {
        setLibraryAvailable(false)
        setLibraryAssets([])
        return
      }
      if (!res.ok) return
      setLibraryAvailable(true)
      const json = (await res.json()) as { media_assets?: MediaLibraryAsset[] }
      setLibraryAssets(json.media_assets ?? [])
    } catch {
      setLibraryAvailable(false)
    } finally {
      setLibraryLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      void loadLibrary()
    }
  }, [open, loadLibrary])

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase()
    return libraryAssets.filter((a) => {
      if (!q) return true
      return (
        a.filename.toLowerCase().includes(q) ||
        (a.folder || "").toLowerCase().includes(q) ||
        (a.role || "").toLowerCase().includes(q)
      )
    })
  }, [libraryAssets, search])

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("files", file)

      const uploadRes = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: formData,
      })
      if (!uploadRes.ok) {
        throw new Error(`Upload failed (${uploadRes.status})`)
      }
      const uploadJson = (await uploadRes.json()) as {
        files?: Array<{ url: string }>
      }
      const uploadedUrl = uploadJson.files?.[0]?.url
      if (!uploadedUrl) {
        throw new Error("Upload succeeded without a URL")
      }

      try {
        await fetch("/admin/media", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assets: [
              {
                url: uploadedUrl,
                filename: file.name,
                mime_type: file.type || null,
                folder: folder || null,
                role: role || null,
                source: "upload",
              },
            ],
          }),
        })
      } catch {
        // Optional Media Library registration
      }

      onSelect(uploadedUrl)
      toast.success(`Attached ${file.name}`)
      setFile(null)
      setOpen(false)
    } catch (err: any) {
      toast.error(err?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        size="small"
        variant="secondary"
        className="whitespace-nowrap shrink-0"
        onClick={() => setOpen(true)}
      >
        {buttonLabel}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <Container
            className="w-full max-w-lg divide-y p-0 shadow-xl"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4">
              <Heading level="h2">Select or Upload Media</Heading>
              <Button
                type="button"
                size="small"
                variant="secondary"
                className="whitespace-nowrap shrink-0"
                onClick={() => setOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="flex gap-2 px-6 py-3">
              <Button
                type="button"
                size="small"
                variant={tab === "upload" ? "primary" : "secondary"}
                className="whitespace-nowrap shrink-0"
                onClick={() => setTab("upload")}
              >
                Upload New
              </Button>
              <Button
                type="button"
                size="small"
                variant={tab === "library" ? "primary" : "secondary"}
                className="whitespace-nowrap shrink-0"
                onClick={() => setTab("library")}
              >
                Media Library
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto px-6 py-4">
              {tab === "upload" ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label size="small">Choose file ({accept})</Label>
                    <input
                      type="file"
                      accept={accept}
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      className="text-ui-fg-base text-xs file:mr-3 file:rounded-md file:border file:border-ui-border-base file:bg-ui-bg-subtle file:px-3 file:py-1.5 file:text-xs file:font-medium"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="small"
                      variant="primary"
                      className="whitespace-nowrap shrink-0"
                      disabled={!file}
                      isLoading={uploading}
                      onClick={() => void handleUpload()}
                    >
                      Upload &amp; Attach
                    </Button>
                  </div>
                </div>
              ) : !libraryAvailable ? (
                <Text size="small" className="text-ui-fg-subtle">
                  Media Library plugin (`/admin/media`) is not active. Use
                  Upload New to upload via Medusa File Module.
                </Text>
              ) : libraryLoading ? (
                <Text size="small" className="text-ui-fg-subtle">
                  Loading Media Library...
                </Text>
              ) : (
                <div className="flex flex-col gap-3">
                  <Input
                    size="small"
                    type="search"
                    placeholder="Filter by filename, folder, or role..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {filteredAssets.length === 0 ? (
                    <Text size="small" className="text-ui-fg-subtle">
                      No matching media assets found.
                    </Text>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredAssets.map((asset) => (
                        <div
                          key={asset.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-ui-border-base px-3 py-2"
                        >
                          <div className="flex min-w-0 flex-col">
                            <Text
                              size="small"
                              weight="plus"
                              className="truncate"
                            >
                              {asset.filename}
                            </Text>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              {asset.folder && (
                                <Badge
                                  size="2xsmall"
                                  color="green"
                                  className="whitespace-nowrap shrink-0"
                                >
                                  {asset.folder}
                                </Badge>
                              )}
                              {asset.mime_type && (
                                <Badge
                                  size="2xsmall"
                                  color="blue"
                                  className="whitespace-nowrap shrink-0"
                                >
                                  {asset.mime_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            size="small"
                            variant="secondary"
                            className="whitespace-nowrap shrink-0"
                            onClick={() => {
                              onSelect(asset.url)
                              toast.success(`Attached ${asset.filename}`)
                              setOpen(false)
                            }}
                          >
                            Use
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Container>
        </div>
      )}
    </>
  )
}
