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

// いずれかのキーが押されたら
document.addEventListener("keypress", function () {
  playFullScreen(video);
});

// TODO: 認証をページ上で実施することでキーイベントなしで自動再生いけるのでは
// → 再生はいけたのにフルスクリーンはできない，どうにかsubmitボタンと連携したい
playFullScreen(video);
