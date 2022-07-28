function loadVideo(streamkey) {
  const video = document.getElementById(`video-${streamkey}`);
  const videoSrc = `./hls/${streamkey}.m3u8`;

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(videoSrc);
    hls.attachMedia(video);
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = videoSrc;
  }
}