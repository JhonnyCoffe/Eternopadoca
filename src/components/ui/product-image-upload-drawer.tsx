"use client";

import * as React from "react";
import {
  Upload,
  Image as LucideImage,
  Check,
  Loader2,
  RotateCcw,
} from "lucide-react";
import NextImage from "next/image";
import {
  FamilyDrawerRoot,
  FamilyDrawerTrigger,
  FamilyDrawerContent,
  FamilyDrawerAnimatedWrapper,
  FamilyDrawerAnimatedContent,
  FamilyDrawerViewContent,
  FamilyDrawerHeader,
  FamilyDrawerButton,
  FamilyDrawerSecondaryButton,
  FamilyDrawerClose,
  FamilyDrawerOverlay,
} from "@/components/ui/family-drawer";
import { cn } from "@/lib/utils";

type UploadView = "select" | "preview" | "confirm";

interface ProductImageUploadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadFile: (file: File) => Promise<string>;
  currentUrl?: string;
  onConfirm: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

const MAX_SIZE_DEFAULT = 5; // MB

function SelectView({
  onFileSelect,
  accept,
  maxSizeMB,
}: {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}) {
  const [dragging, setDragging] = React.useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = "";
    }
  };

  return (
    <div className="p-6 space-y-4">
      <FamilyDrawerHeader
        icon={<Upload size={20} className="text-brand-soft" />}
        title="Enviar foto do produto"
        description="Selecione uma imagem do seu dispositivo"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed p-8 flex flex-col items-center justify-center gap-2 transition-all",
          dragging
            ? "border-brand bg-brand/10 text-brand"
            : "border-white/15 bg-white/[0.03] text-zinc-400 hover:border-white/30",
        )}
      >
        {dragging ? (
          <div className="flex items-center gap-2 text-sm font-bold text-brand animate-pulse">
            <RotateCcw size={16} className="animate-spin" />
            Solte a imagem aqui
          </div>
        ) : (
          <>
            <LucideImage size={32} className="mb-1" aria-hidden="true" />
            <p className="text-xs font-semibold">Arraste uma imagem aqui</p>
            <p className="text-[10px] text-zinc-500">
              JPG, PNG, WebP ou GIF · até {maxSizeMB ?? MAX_SIZE_DEFAULT} MB
            </p>
          </>
        )}

        <label
          className="mt-3 flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-2 text-xs font-bold text-zinc-100 transition hover:bg-white/15"
        >
          <Upload size={13} />
          Enviar do dispositivo
          <input
            type="file"
            accept={accept ?? "image/*"}
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <FamilyDrawerSecondaryButton onClick={() => {}} variant-ghost>
          Cancelar
        </FamilyDrawerSecondaryButton>
      </div>
    </div>
  );
}

function PreviewView({
  url,
  onChange,
  onConfirm,
  filename,
  size,
}: {
  url: string;
  onChange: () => void;
  onConfirm: (url: string) => void;
  filename?: string;
  size?: { width: number; height: number };
}) {
  const [uploading, setUploading] = React.useState(false);

  return (
    <div className="p-6 space-y-4">
      <FamilyDrawerHeader
        icon={<LucideImage size={20} className="text-brand-soft" aria-hidden="true" />}
        title="Pré-visualizar"
        description="Confira a imagem antes de salvar"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] aspect-square flex items-center justify-center">
        <NextImage
          src={url}
          alt="Prévia da imagem"
          fill
          className="object-cover"
          sizes="100vw"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
        {size && (
          <span className="absolute bottom-2 right-2 rounded-full px-2.5 py-1 text-[10px] font-black backdrop-blur bg-black/65 text-white">
            {size.width} × {size.height} px
          </span>
        )}
      </div>

      {filename && (
        <p className="text-xs text-center text-zinc-400 break-all">{filename}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2">
        <FamilyDrawerSecondaryButton onClick={onChange}>
          Trocar imagem
        </FamilyDrawerSecondaryButton>
        <FamilyDrawerButton
          onClick={() => {
            setUploading(true);
            // pequeno atraso para feedback visual, depois confirma
            setTimeout(() => {
              setUploading(false);
              onConfirm(url);
            }, 400);
          }}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <Check size={14} />
              Confirmar imagem
            </>
          )}
        </FamilyDrawerButton>
      </div>
    </div>
  );
}

function ConfirmView({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <div className="p-6 space-y-4">
      <FamilyDrawerHeader
        icon={<Check size={20} className="text-emerald-400" />}
        title="Imagem confirmada"
        description="A foto será salva com o produto"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03] aspect-square flex items-center justify-center">
        <NextImage src={url} alt="Prévia da imagem" fill className="object-cover" sizes="100vw" />
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <FamilyDrawerSecondaryButton onClick={onClose}>
          Fechar
        </FamilyDrawerSecondaryButton>
      </div>
    </div>
  );
}

// View components para o registro do drawer
interface UploadSelectProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}
interface UploadPreviewProps {
  url: string;
  onChange: () => void;
  onConfirm: (url: string) => void;
  filename?: string;
  size?: { width: number; height: number };
}
interface UploadConfirmProps {
  url: string;
  onClose: () => void;
}

function UploadSelect({ onFileSelect, accept, maxSizeMB }: UploadSelectProps) {
  return (
    <SelectView onFileSelect={onFileSelect} accept={accept} maxSizeMB={maxSizeMB} />
  );
}
function UploadPreview({ url, onChange, onConfirm, filename, size }: UploadPreviewProps) {
  return (
    <PreviewView
      url={url}
      onChange={onChange}
      onConfirm={onConfirm}
      filename={filename}
      size={size}
    />
  );
}
function UploadConfirm({ url, onClose }: UploadConfirmProps) {
  return <ConfirmView url={url} onClose={onClose} />;
}

export function ProductImageUploadDrawer({
  open,
  onOpenChange,
  onUploadFile,
  onConfirm,
  accept,
  maxSizeMB,
  className,
}: ProductImageUploadDrawerProps) {
  const [, setView] = React.useState<UploadView>("select");
  const [fileUrl, setFileUrl] = React.useState<string | null>(null);
  const [filename, setFilename] = React.useState<string | null>(null);
  const [size, setSize] = React.useState<{ width: number; height: number } | null>(
    null,
  );

  const views: Record<UploadView, React.ComponentType<Record<string, unknown>>> = {
    select: React.memo(function SelectWrapper(props: Record<string, unknown>) {
      return <UploadSelect {...(props as unknown as UploadSelectProps)} />;
    }),
    preview: React.memo(function PreviewWrapper(props: Record<string, unknown>) {
      return <UploadPreview {...(props as unknown as UploadPreviewProps)} />;
    }),
    confirm: React.memo(function ConfirmWrapper(props: Record<string, unknown>) {
      return <UploadConfirm {...(props as unknown as UploadConfirmProps)} />;
    }),
  };

  const handleFileSelect = async (file: File) => {
    setFilename(file.name);
    try {
      const url = await onUploadFile(file);
      setFileUrl(url);
      const img = document.createElement("img");
      img.onload = () => setSize({ width: img.naturalWidth, height: img.naturalHeight });
      img.src = url;
      setView("preview");
    } catch {
      alert("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      if (!fileUrl) setSize(null);
    }
  };

  const handleConfirm = () => {
    if (fileUrl) {
      onConfirm(fileUrl);
      onOpenChange(false);
    }
  };

  return (
    <FamilyDrawerRoot
      views={views}
      defaultView="select"
      open={open}
      onOpenChange={onOpenChange}
      onViewChange={(v: string) => setView(v as UploadView)}
    >
      <FamilyDrawerTrigger asChild className={cn(className)}>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-bold text-zinc-100 transition hover:bg-white/10"
        >
          <Upload size={13} />
          Enviar imagem
        </button>
      </FamilyDrawerTrigger>
      <FamilyDrawerOverlay />
      <FamilyDrawerContent>
        <FamilyDrawerAnimatedWrapper>
          <FamilyDrawerAnimatedContent>
            <FamilyDrawerViewContent
              views={{
                select: () => (
                  <UploadSelect
                    onFileSelect={handleFileSelect}
                    accept={accept}
                    maxSizeMB={maxSizeMB}
                  />
                ),
                preview: () => (
                  <UploadPreview
                    url={fileUrl ?? ""}
                    onChange={() => {
                      setFileUrl(null);
                      setFilename(null);
                      setSize(null);
                      setView("select");
                    }}
                    onConfirm={handleConfirm}
                    filename={filename ?? undefined}
                    size={size ?? undefined}
                  />
                ),
                confirm: () => (
                  <UploadConfirm url={fileUrl ?? ""} onClose={() => onOpenChange(false)} />
                ),
              }}
            />
          </FamilyDrawerAnimatedContent>
        </FamilyDrawerAnimatedWrapper>
        <FamilyDrawerClose>×</FamilyDrawerClose>
      </FamilyDrawerContent>
    </FamilyDrawerRoot>
  );
}

export type { UploadView };
