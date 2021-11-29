let video = document.getElementById("video");
let videoSrc = "./hls/kcbc.m3u8";

if (Hls.isSupported()) {
  var hls = new Hls();
  hls.loadSource(videoSrc);
  hls.attachMedia(video);
} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
  video.src = videoSrc;
}

// 渡された要素をフルスクリーンに
function toggleFullScreen(element) {
  if (!document.fullscreenElement) {
    element.requestFullscreen();
  }
}

// video要素をフルスクリーンで再生
function playFullScreen(videoElement) {
  toggleFullScreen(videoElement);
  videoElement.play();
}

// ページ訪問時に一度だけモーダルを表示
window.addEventListener("load", function() {
  if (!sessionStorage.getItem("first_visit")) {
    sessionStorage.setItem("first_visit", "on");
    let welcome = document.getElementById("welcome");
    UIkit.modal(welcome).show();
    welcome.onclick = function() {
      UIkit.modal(welcome).hide();
      playFullScreen(video);
    }
  }
})

// Fキーでフルスクリーン化するショートカット
document.addEventListener("keypress", event => {
  if (event.key === "f") {
    toggleFullScreen(video);
  }
})
