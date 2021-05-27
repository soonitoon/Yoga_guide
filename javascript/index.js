const LOADING_TIMER = 1.5; // sec

setTimeout(() => {
  location.replace("html/main.html");
}, LOADING_TIMER * 1000);

function moveProgressBar() {
  const elem = document.querySelector(".progress_bar");
  let width = 20;
  const id = setInterval(frame, LOADING_TIMER * 10);
  function frame() {
    if (width >= 100) {
      clearInterval(id);
    } else {
      width++;
      elem.style.width = width + "%";
      elem.innerHTML = width * 1 + "%";
    }
  }
}

moveProgressBar();
