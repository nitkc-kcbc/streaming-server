let playlist = [];
let streams;
const viewContainer = document.getElementById("view-container");

async function loadStreams() {
  const res = await fetch("/api/streams");
  streams = await res.json();
};
loadStreams();

function getNavbarHeight() {
  return document.querySelector("nav").clientHeight;
}
function countViews() {
  return viewContainer.children.length;
}
function getStream(streamkey) {
  return streams.find(v => v.streamkey === streamkey);
}
function isLive(streamkey) {
  loadStreams();
  return getStream(streamkey).is_live;
}

function updateStreamsNavSize() {
  const centerNav = document.querySelector(".uk-navbar-center");
  if (window.innerWidth < 860) {
    centerNav.style.width = `calc(100vw - 178px)`;
  } else {
    centerNav.style.width = "";
  }
}
function updateViewContainerSize() {
  const cnt = countViews();
  const colsDivideNum = cnt < 2 ? 1
    : cnt < 5 ? 2
    : cnt < 6 ? 6
    : 3;
  const rowsDivideNum = cnt < 3 ? 1
    : cnt < 5 ? 2
    : cnt < 6 ? 5
    : 2;

  viewContainer.style.setProperty(
    "grid-template-columns",
    "1fr ".repeat(colsDivideNum).trimEnd()
  );
  viewContainer.style.setProperty(
    "grid-template-rows",
    `calc((100vh - ${getNavbarHeight()}px) / ${rowsDivideNum}) `
      .repeat(rowsDivideNum).trimEnd()
  );
}

window.addEventListener("load", () => {
  updateStreamsNavSize();
  updateViewContainerSize();
});
window.addEventListener("resize", () => {
  updateStreamsNavSize();
  updateViewContainerSize();
});

function manageView(streamkey) {
  if (playlist.includes(streamkey)) {
    removeView(streamkey);
  } else {
    if (countViews() >= 6) {
      UIkit.notification({
        message: "最大6つまでしか表示できません。",
        status: "danger",
        pos: "top-right",
        timeout: 2000
      });
    } else {
      createView(streamkey);
    }
  }
}
function createView(streamkey) {
  playlist.push(streamkey);
  const viewNum = countViews();
  updateExistingViews(viewNum);

  const viewElement = document.createElement("div");
  const videoElement = document.createElement("video");
  videoElement.setAttribute("id", `video-${streamkey}`);
  videoElement.muted = true;
  videoElement.autoplay = true;
  videoElement.controls = true;
  videoElement.setAttribute("playsinline", true); // setAttributeでないと動作しない
  viewElement.classList.add(`view-item-${viewNum+1}-${viewNum+1}`);
  viewElement.classList.add("uk-inline");
  viewElement.appendChild(videoElement);

  manageReloadButton(viewElement, streamkey);

  document.getElementById("view-container").appendChild(viewElement);
  updateViewContainerSize();
  if (isLive(streamkey)) {
    loadVideo(streamkey);
  }
}
function removeView(streamkey) {
  index = playlist.indexOf(streamkey);
  const viewNum = countViews();
  playlist.splice(index, 1);
  viewContainer.children[index].remove();
  updateExistingViews(viewNum-2);
  updateViewContainerSize();
}
function updateExistingViews(viewNum) {
  const viewElements = viewContainer.children;
  for (let i = 0; i < viewElements.length; i++) {
    viewElements[i].className = `view-item-${i+1}-${viewNum+1}`;
    viewElements[i].classList.add("uk-inline");
  }
}

function manageReloadButton(viewElement, streamkey) {
  if (!isLive(streamkey)) {
    const myctrl = document.createElement("div");
    myctrl.classList.add("uk-position-center");
    const myctrlBtn = document.createElement("button");
    myctrlBtn.classList.add("uk-button", "uk-button-primary");
    const myctrl_btn_icon = document.createElement("span");
    myctrl_btn_icon.setAttribute("uk-icon", "refresh");
    myctrlBtn.appendChild(myctrl_btn_icon);
    myctrl.appendChild(myctrlBtn);
    viewElement.appendChild(myctrl);

    myctrlBtn.addEventListener("click", () => {
      if (isLive(streamkey)) {
        loadVideo(streamkey);
        myctrl.remove();
      } else {
        UIkit.notification({
          message: `${getStream(streamkey).title}は配信前です。`,
          status: "warning",
          pos: "top-right",
          timeout: 2000
        });
      }
    });
  }
}

function toggleNavbarShow() {
  const navbar = document.querySelector("nav");
  navbar.classList.toggle("uk-hidden");
  // アイコン切り替え
  if (navbar_hidden_icon.getAttribute("uk-icon") === "chevron-up") {
    navbar_hidden_icon.setAttribute("uk-icon", "chevron-down");
  } else {
    navbar_hidden_icon.setAttribute("uk-icon", "chevron-up");
  }
  updateViewContainerSize();
}