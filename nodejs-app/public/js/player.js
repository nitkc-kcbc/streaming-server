let video = document.getElementById("video");
let videoSrc = `./hls/${streamkey}.m3u8`;

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

function createMuteAlert() {
  let alert = document.createElement("div");
  alert.id = "mute";
  alert.className = "uk-alert-warning uk-position-large uk-position-top-right uk-overlay uk-animation-shake pointer";
  alert.innerHTML = `<a class="uk-alert-close" uk-close></a><p>ビデオの音声がミュートになっています。</p>`;
  document.body.append(alert);
}

function showMuteAlert() {
  if (video.muted) {
    createMuteAlert();
    mute.onclick = function() {
      UIkit.alert(mute).close();
      video.muted = false;
      playFullScreen(video);
    }
  }
}

// ページ訪問時にアラートを表示
window.addEventListener("load", showMuteAlert);
// 消音時にアラートを表示
video.addEventListener("volumechange", showMuteAlert)

// Fキーでフルスクリーン化するショートカット
document.addEventListener("keypress", event => {
  if (event.key === "f") {
    toggleFullScreen(video);
  }
})
