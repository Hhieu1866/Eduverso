export function getYoutubeId(url) {
  if (!url) return null;

  // Kiểm tra URL embed
  if (url.includes("youtube.com/embed/")) {
    const videoId = url.split("youtube.com/embed/")[1]?.split("?")[0];
    if (videoId && videoId.length === 11) return videoId;
  }

  // Kiểm tra URL rút gọn
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split("?")[0];
    if (videoId && videoId.length === 11) return videoId;
  }

  // Kiểm tra URL đầy đủ
  if (url.includes("youtube.com/watch")) {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get("v");
    if (videoId && videoId.length === 11) return videoId;
  }

  // Kiểm tra bằng regex tổng quát
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
}

export function getYoutubeEmbedUrl(url) {
  if (!url) return "";

  // Nếu đã là URL embed, trả về nguyên bản
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  // Lấy ID video và chuyển thành URL embed
  const videoId = getYoutubeId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  return url;
}

export function getYoutubeWatchUrl(url) {
  if (!url) return "";

  // Nếu đã là URL watch, trả về nguyên bản
  if (url.includes("youtube.com/watch?v=")) {
    return url;
  }

  // Lấy ID video và chuyển thành URL watch
  const videoId = getYoutubeId(url);
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  return url;
}

export function isYoutubeUrl(url) {
  if (!url) return false;

  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    getYoutubeId(url) !== null
  );
}

export function getYoutubeThumbnail(url, quality = "maxresdefault") {
  const videoId = getYoutubeId(url);
  if (!videoId) return null;

  const qualityOptions = [
    "default",
    "mqdefault",
    "hqdefault",
    "sddefault",
    "maxresdefault",
  ];
  const validQuality = qualityOptions.includes(quality)
    ? quality
    : "maxresdefault";

  return `https://img.youtube.com/vi/${videoId}/${validQuality}.jpg`;
}
