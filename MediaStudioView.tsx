import React, { useRef, useState } from "react";
import { ArrowRight, Download, Film, Image as ImageIcon, Upload } from "lucide-react";
import { GeneratedMediaItem } from "../types";

export const MediaStudioView: React.FC = () => {
  // High-quality image generation (gemini-3-pro-image-preview)
  const [imgPrompt, setImgPrompt] = useState(
    "Minimalist architectural photography of an automated fulfillment logistics hub bathed in soft morning light, clean white concrete and matte black robotics, editorial commercial grade."
  );
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [imgAspectRatio, setImgAspectRatio] = useState<
    "1:1" | "16:9" | "4:3" | "3:4" | "9:16"
  >("16:9");
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedMediaItem | null>(
    null
  );

  // Image-to-video animation (gemini-omni-1.2-flash via Interactions API)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [uploadedMime, setUploadedMime] = useState<string>("image/png");
  const [uploadedName, setUploadedName] = useState<string>("");
  const [videoPrompt, setVideoPrompt] = useState(
    "Smooth slow cinematic camera push forward with subtle atmospheric light movement."
  );
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedMediaItem | null>(
    null
  );

  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgPrompt.trim() || imgLoading) return;
    setImgLoading(true);
    setImgError(null);
    try {
      const res = await fetch("/api/media/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imgPrompt.trim(),
          imageSize,
          aspectRatio: imgAspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Image generation failed.");
      }
      setGeneratedImage({
        id: `img-${Date.now()}`,
        type: "image",
        url: data.imageUrl,
        prompt: imgPrompt.trim(),
        specLabel: `${data.imageSize} · ${data.aspectRatio}`,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch (err) {
      setImgError(err instanceof Error ? err.message : "Failed to generate image.");
    } finally {
      setImgLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError(null);
    setUploadedMime(file.type || "image/png");
    setUploadedName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseGeneratedImage = () => {
    if (!generatedImage) return;
    const match = generatedImage.url.match(/^data:([^;]+);base64,/);
    setUploadedMime(match?.[1] || "image/png");
    setUploadedName(`generated_${generatedImage.id}.png`);
    setUploadedPreview(generatedImage.url);
    setVideoError(null);
  };

  const handleAnimateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedPreview || videoLoading) return;
    setVideoLoading(true);
    setVideoError(null);
    try {
      const res = await fetch("/api/media/animate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: uploadedPreview,
          mimeType: uploadedMime,
          prompt: videoPrompt.trim(),
          aspectRatio: videoAspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Video animation failed.");
      }
      setGeneratedVideo({
        id: `vid-${Date.now()}`,
        type: "video",
        url: data.videoUrl,
        prompt: videoPrompt.trim(),
        specLabel: `${data.aspectRatio} · MP4`,
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
    } catch (err) {
      setVideoError(
        err instanceof Error ? err.message : "Failed to animate image into video."
      );
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-[#0D0D12] dark:text-white">
          Brand & Operations Media Studio
        </h2>
        <p className="text-[13px] text-[#646275] dark:text-[#9D9AB2]">
          Create high-resolution campaign imagery (1K–4K) and animate uploaded product or facility photos into video. Billing-enabled Gemini API key required in Settings &gt; Secrets.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        {/* Panel 1: High-Quality Image Generation */}
        <section className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEAF3] dark:border-[#1F1F2E] pb-3.5">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#6D28D9] dark:text-[#C4B5FD]" />
              <h3 className="font-display text-[15px] font-semibold text-[#0D0D12] dark:text-white">
                Generate High-Quality Image
              </h3>
            </div>
            <span className="font-mono-tabular text-[11.5px] text-[#646275] dark:text-[#9D9AB2]">
              gemini-3-pro-image-preview
            </span>
          </div>

          <form onSubmit={handleGenerateImage} className="space-y-4">
            <div>
              <label
                htmlFor="img-prompt"
                className="block text-[12.5px] font-medium text-[#3F3D4F] dark:text-[#D0CEE0] mb-1.5"
              >
                Creative Prompt
              </label>
              <textarea
                id="img-prompt"
                rows={3}
                value={imgPrompt}
                onChange={(e) => setImgPrompt(e.target.value)}
                placeholder="Describe the commercial visual, lighting, subject, and materials..."
                className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#161621] p-3 text-[13.5px] text-[#0D0D12] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-[12.5px] font-medium text-[#3F3D4F] dark:text-[#D0CEE0] mb-1.5">
                  Output Resolution
                </div>
                <div className="grid grid-cols-3 gap-1.5 rounded-md bg-[#F2F0F8] dark:bg-[#171722] p-1">
                  {(["1K", "2K", "4K"] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setImageSize(sz)}
                      className={`py-1.5 rounded text-[12.5px] font-mono-tabular font-medium transition-colors ${
                        imageSize === sz
                          ? "bg-white dark:bg-[#2A263D] text-[#0D0D12] dark:text-white shadow-xs"
                          : "text-[#646275] dark:text-[#9D9AB2]"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="img-ratio"
                  className="block text-[12.5px] font-medium text-[#3F3D4F] dark:text-[#D0CEE0] mb-1.5"
                >
                  Aspect Ratio
                </label>
                <select
                  id="img-ratio"
                  value={imgAspectRatio}
                  onChange={(e) =>
                    setImgAspectRatio(
                      e.target.value as "1:1" | "16:9" | "4:3" | "3:4" | "9:16"
                    )
                  }
                  className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#161621] px-3 py-2 text-[13px] text-[#0D0D12] dark:text-white"
                >
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="3:4">3:4 (Editorial Portrait)</option>
                  <option value="9:16">9:16 (Vertical)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={imgLoading || !imgPrompt.trim()}
              className="w-full rounded-md bg-[#0D0D12] dark:bg-[#DDD6FE] px-4 py-2.5 text-[13.5px] font-medium text-white dark:text-[#0B0B10] disabled:opacity-50 hover:bg-[#23232F] dark:hover:bg-[#E9E3FF] transition-colors"
            >
              {imgLoading ? `Generating ${imageSize} Image...` : `Generate ${imageSize} Image`}
            </button>
          </form>

          {imgError && (
            <div className="rounded-md bg-[#FEF2F2] dark:bg-[#2B1418] border border-[#FECACA] dark:border-[#7F1D1D] p-3.5 text-[12.5px] text-[#991B1B] dark:text-[#FCA5A5]">
              {imgError}
            </div>
          )}

          {generatedImage ? (
            <div className="space-y-3 pt-2 border-t border-[#ECEAF3] dark:border-[#1F1F2E]">
              <div className="flex items-center justify-between text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                <span className="font-mono-tabular">{generatedImage.specLabel}</span>
                <span className="font-mono-tabular">Generated at {generatedImage.createdAt}</span>
              </div>
              <img
                src={generatedImage.url}
                alt={generatedImage.prompt}
                className="w-full rounded-md border border-[#E6E4EE] dark:border-[#242434] object-contain max-h-[340px] bg-[#0B0B10]"
              />
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={generatedImage.url}
                  download={`nexa-asset-${imageSize}.png`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] px-3 py-1.5 text-[12.5px] font-medium text-[#0D0D12] dark:text-white hover:bg-[#F4F2FA] dark:hover:bg-[#1B1B27]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Image</span>
                </a>
                <button
                  type="button"
                  onClick={handleUseGeneratedImage}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[#EDE9FE] dark:bg-[#272042] px-3 py-1.5 text-[12.5px] font-medium text-[#3B1E8A] dark:text-[#E5DCFF] hover:bg-[#E1DAFC]"
                >
                  <span>Use in Video Animator</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[#DCD9E8] dark:border-[#2A2A3B] py-10 px-4 text-center text-[12.5px] text-[#7A788C]">
              Generated high-resolution assets will appear here for download or animation.
            </div>
          )}
        </section>

        {/* Panel 2: Animate Image into Video (Interactions API + gemini-omni-1.2-flash) */}
        <section className="rounded-lg bg-white dark:bg-[#111118] border border-[#E6E4EE] dark:border-[#1E1E2B] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#ECEAF3] dark:border-[#1F1F2E] pb-3.5">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-[#6D28D9] dark:text-[#C4B5FD]" />
              <h3 className="font-display text-[15px] font-semibold text-[#0D0D12] dark:text-white">
                Animate Photo into Video
              </h3>
            </div>
            <span className="font-mono-tabular text-[11.5px] text-[#646275] dark:text-[#9D9AB2]">
              gemini-omni-1.2-flash
            </span>
          </div>

          <form onSubmit={handleAnimateVideo} className="space-y-4">
            <div>
              <div className="text-[12.5px] font-medium text-[#3F3D4F] dark:text-[#D0CEE0] mb-1.5">
                Source Photo
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadedPreview ? (
                <div className="relative rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] overflow-hidden bg-[#0B0B10]">
                  <img
                    src={uploadedPreview}
                    alt="Uploaded source frame"
                    className="w-full max-h-[210px] object-contain mx-auto"
                  />
                  <div className="flex items-center justify-between px-3 py-2 bg-[#14141D] text-[12px] text-[#E5E3F0]">
                    <span className="truncate">{uploadedName || "Uploaded frame"}</span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[#DDD6FE] hover:underline shrink-0 ml-3"
                    >
                      Replace photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-md border border-dashed border-[#C7C2DA] dark:border-[#323046] bg-[#FAF9FD] dark:bg-[#161621] py-8 px-4 flex flex-col items-center justify-center gap-2 hover:border-[#8B5CF6] transition-colors"
                >
                  <Upload className="h-5 w-5 text-[#6D28D9] dark:text-[#C4B5FD]" />
                  <span className="text-[13px] font-medium text-[#0D0D12] dark:text-white">
                    Upload a product, office, or campaign photo
                  </span>
                  <span className="text-[11.5px] text-[#7A788C]">
                    PNG, JPEG, or WebP
                  </span>
                </button>
              )}
            </div>

            <div>
              <label
                htmlFor="vid-prompt"
                className="block text-[12.5px] font-medium text-[#3F3D4F] dark:text-[#D0CEE0] mb-1.5"
              >
                Motion & Camera Direction
              </label>
              <textarea
                id="vid-prompt"
                rows={2}
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                placeholder="Describe camera movement and motion in the scene..."
                className="w-full rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] bg-[#FAF9FC] dark:bg-[#161621] p-3 text-[13.5px] text-[#0D0D12] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A78BFA]"
              />
            </div>

            <div>
              <div className="text-[12.5px] font-medium text-[#3F3D4F] dark:text-[#D0CEE0] mb-1.5">
                Video Aspect Ratio
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-md bg-[#F2F0F8] dark:bg-[#171722] p-1">
                <button
                  type="button"
                  onClick={() => setVideoAspectRatio("16:9")}
                  className={`py-2 rounded text-[12.5px] font-medium transition-colors ${
                    videoAspectRatio === "16:9"
                      ? "bg-white dark:bg-[#2A263D] text-[#0D0D12] dark:text-white shadow-xs"
                      : "text-[#646275] dark:text-[#9D9AB2]"
                  }`}
                >
                  16:9 (Landscape)
                </button>
                <button
                  type="button"
                  onClick={() => setVideoAspectRatio("9:16")}
                  className={`py-2 rounded text-[12.5px] font-medium transition-colors ${
                    videoAspectRatio === "9:16"
                      ? "bg-white dark:bg-[#2A263D] text-[#0D0D12] dark:text-white shadow-xs"
                      : "text-[#646275] dark:text-[#9D9AB2]"
                  }`}
                >
                  9:16 (Portrait)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={videoLoading || !uploadedPreview}
              className="w-full rounded-md bg-[#0D0D12] dark:bg-[#DDD6FE] px-4 py-2.5 text-[13.5px] font-medium text-white dark:text-[#0B0B10] disabled:opacity-50 hover:bg-[#23232F] dark:hover:bg-[#E9E3FF] transition-colors"
            >
              {videoLoading
                ? `Animating Video (${videoAspectRatio}) — may take 1–2 min...`
                : `Animate Photo (${videoAspectRatio})`}
            </button>
          </form>

          {videoError && (
            <div className="rounded-md bg-[#FEF2F2] dark:bg-[#2B1418] border border-[#FECACA] dark:border-[#7F1D1D] p-3.5 text-[12.5px] text-[#991B1B] dark:text-[#FCA5A5]">
              {videoError}
            </div>
          )}

          {generatedVideo ? (
            <div className="space-y-3 pt-2 border-t border-[#ECEAF3] dark:border-[#1F1F2E]">
              <div className="flex items-center justify-between text-[12px] text-[#646275] dark:text-[#9D9AB2]">
                <span className="font-mono-tabular">{generatedVideo.specLabel}</span>
                <span className="font-mono-tabular">Generated at {generatedVideo.createdAt}</span>
              </div>
              <video
                src={generatedVideo.url}
                controls
                playsInline
                className="w-full rounded-md border border-[#E6E4EE] dark:border-[#242434] max-h-[340px] bg-black"
              />
              <div>
                <a
                  href={generatedVideo.url}
                  download={`nexa-animation-${videoAspectRatio.replace(":", "x")}.mp4`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#DCD9E8] dark:border-[#2A2A3B] px-3 py-1.5 text-[12.5px] font-medium text-[#0D0D12] dark:text-white hover:bg-[#F4F2FA] dark:hover:bg-[#1B1B27]"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Video</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-[#DCD9E8] dark:border-[#2A2A3B] py-10 px-4 text-center text-[12.5px] text-[#7A788C]">
              Animated {videoAspectRatio} video playback will appear here once generated.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
