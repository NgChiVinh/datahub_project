// Trích YouTube video ID từ mọi dạng link phổ biến:
// watch?v=, youtu.be/, /embed/, /v/, /u/w/, &v=
const YT_REGEX = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

export function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(YT_REGEX);
  return match && match[2].length === 11 ? match[2] : null;
}

export function isYoutube(url) {
  return !!getYoutubeId(url);
}

// quality: "default" | "mqdefault" | "hqdefault" | "maxresdefault"
export function getYoutubeThumbnail(url, quality = "mqdefault") {
  const id = getYoutubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : null;
}

export function getYoutubeEmbedUrl(url, { autoplay = false } = {}) {
  const id = getYoutubeId(url);
  if (!id) return url || "";
  return `https://www.youtube.com/embed/${id}${autoplay ? "?autoplay=1" : ""}`;
}
