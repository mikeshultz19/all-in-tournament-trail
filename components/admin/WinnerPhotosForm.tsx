"use client";

import { Camera, CheckCircle2, Loader2, Upload } from "lucide-react";
import { ChangeEvent, useActionState, useState } from "react";

import {
  saveWinnerPhotosAction,
  type WinnerPhotosFormState,
} from "@/app/admin/tournament-manager/photos/actions";
import { compressImage } from "@/lib/compress-image";
import { uploadTournamentPhoto } from "@/lib/storage";
import type { Tournament } from "@/types/tournament";

interface WinnerPhotosFormProps {
  tournament: Tournament;
}

type PhotoType = "champion" | "big-bass";

const initialState: WinnerPhotosFormState = {
  status: "idle",
  message: "",
};

function addCacheVersion(url: string) {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${Date.now()}`;
}

export default function WinnerPhotosForm({
  tournament,
}: WinnerPhotosFormProps) {
  const action = saveWinnerPhotosAction.bind(null, tournament.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [championPhotoUrl, setChampionPhotoUrl] = useState(
    tournament.champion_photo_url ?? "",
  );
  const [championPhotoPath, setChampionPhotoPath] = useState(
    tournament.champion_photo_path ?? "",
  );

  const [bigBassPhotoUrl, setBigBassPhotoUrl] = useState(
    tournament.big_bass_photo_url ?? "",
  );
  const [bigBassPhotoPath, setBigBassPhotoPath] = useState(
    tournament.big_bass_photo_path ?? "",
  );

  const [uploadingPhoto, setUploadingPhoto] = useState<PhotoType | null>(null);
  const [uploadError, setUploadError] = useState("");

  const isUploading = uploadingPhoto !== null;

  async function handlePhotoUpload(
    event: ChangeEvent<HTMLInputElement>,
    photoType: PhotoType,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError("");
    setUploadingPhoto(photoType);

    try {
      const compressedFile = await compressImage(file);

      const filename =
        photoType === "champion" ? "champion.jpg" : "big-bass.jpg";

      const storagePath = `tournaments/${tournament.id}/${filename}`;

      const uploadedPhoto = await uploadTournamentPhoto(
        compressedFile,
        storagePath,
      );

      const versionedUrl = addCacheVersion(uploadedPhoto.url);

      if (photoType === "champion") {
        setChampionPhotoUrl(versionedUrl);
        setChampionPhotoPath(uploadedPhoto.path);
      } else {
        setBigBassPhotoUrl(versionedUrl);
        setBigBassPhotoPath(uploadedPhoto.path);
      }
    } catch (error) {
      console.error("Tournament photo upload failed.", error);

      setUploadError(
        error instanceof Error
          ? error.message
          : "We could not upload this photo. Please try again.",
      );
    } finally {
      setUploadingPhoto(null);
      event.target.value = "";
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="championPhotoUrl"
        value={championPhotoUrl}
      />
      <input
        type="hidden"
        name="championPhotoPath"
        value={championPhotoPath}
      />
      <input
        type="hidden"
        name="bigBassPhotoUrl"
        value={bigBassPhotoUrl}
      />
      <input
        type="hidden"
        name="bigBassPhotoPath"
        value={bigBassPhotoPath}
      />

      <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center border border-[#D4A017]/40 bg-[#D4A017]/10 text-[#D4A017]">
            <Camera aria-hidden="true" className="size-5" />
          </div>

          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Winner Photos
            </h2>

            <p className="mt-1 text-sm leading-6 text-neutral-400">
              Images are compressed in your browser before they are uploaded.
              Only the optimized copies are stored in Supabase.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <PhotoUploader
            title="Overall Winner Photo"
            description="Upload the winning team or tournament champion photo."
            previewUrl={championPhotoUrl}
            uploading={uploadingPhoto === "champion"}
            disabled={isUploading || pending}
            onChange={(event) => handlePhotoUpload(event, "champion")}
          />

          <PhotoUploader
            title="Big Bass Winner Photo"
            description="Upload the tournament Big Bass winner photo."
            previewUrl={bigBassPhotoUrl}
            uploading={uploadingPhoto === "big-bass"}
            disabled={isUploading || pending}
            onChange={(event) => handlePhotoUpload(event, "big-bass")}
          />
        </div>
      </section>

      <section className="border border-white/10 bg-[#111111] p-5 sm:p-7">
        <h2 className="text-lg font-black uppercase tracking-tight text-red-500">
          Final Photo Review
        </h2>

        <label className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 border border-white/10 px-4 py-3 text-sm font-semibold text-neutral-200">
          <input
            name="photosReviewed"
            type="checkbox"
            defaultChecked={tournament.photos_reviewed}
            className="mt-0.5 size-4 shrink-0 accent-[#D4A017]"
          />

          <span>
            <span className="block">Winner photos reviewed and approved</span>

            <span className="mt-1 block text-xs font-normal leading-5 text-neutral-500">
              Confirm that both photos show the correct winners and are ready
              for the public website.
            </span>
          </span>
        </label>
      </section>

      {uploadError && (
        <p
          role="alert"
          className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
        >
          {uploadError}
        </p>
      )}

      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`border px-4 py-3 text-sm font-semibold ${
            state.status === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/40 bg-red-500/10 text-red-300"
          }`}
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || isUploading}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-red-700 px-7 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Saving Photos…
          </>
        ) : isUploading ? (
          <>
            <Loader2 aria-hidden="true" className="size-4 animate-spin" />
            Uploading Photo…
          </>
        ) : (
          <>
            <CheckCircle2 aria-hidden="true" className="size-4" />
            Save Winner Photos
          </>
        )}
      </button>
    </form>
  );
}

interface PhotoUploaderProps {
  title: string;
  description: string;
  previewUrl: string;
  uploading: boolean;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function PhotoUploader({
  title,
  description,
  previewUrl,
  uploading,
  disabled,
  onChange,
}: PhotoUploaderProps) {
  return (
    <article className="border border-white/10 bg-black/30 p-4">
      <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white">
        {title}
      </h3>

      <p className="mt-2 min-h-10 text-sm leading-5 text-neutral-500">
        {description}
      </p>

      <div className="mt-4 flex aspect-[4/3] items-center justify-center overflow-hidden border border-white/10 bg-[#080808]">
        {uploading ? (
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <Loader2
              aria-hidden="true"
              className="size-8 animate-spin text-[#D4A017]"
            />
            <span className="text-xs font-black uppercase tracking-[0.12em]">
              Compressing and uploading
            </span>
          </div>
        ) : previewUrl ? (
          // A normal img element supports Supabase public URLs without
          // requiring a Next.js remote image hostname configuration.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={`${title} preview`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 px-5 text-center text-neutral-600">
            <Camera aria-hidden="true" className="size-9" />
            <span className="text-xs font-black uppercase tracking-[0.12em]">
              No photo uploaded
            </span>
          </div>
        )}
      </div>

      <label
        className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-[#D4A017]/50 px-4 text-xs font-black uppercase tracking-[0.12em] text-[#D4A017] transition ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "cursor-pointer hover:bg-[#D4A017]/10"
        }`}
      >
        <Upload aria-hidden="true" className="size-4" />

        {previewUrl ? "Replace Photo" : "Choose Photo"}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
        />
      </label>

      {previewUrl && !uploading && (
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <CheckCircle2 aria-hidden="true" className="size-4" />
          Photo uploaded
        </p>
      )}
    </article>
  );
}
