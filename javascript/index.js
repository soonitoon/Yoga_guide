// setTimeout(() => {
//   location.replace("html/main.html");
// }, 1500);

function moveProgressBar() {
  const elem = document.querySelector(".progress_bar");
  let width = 20;
  const id = setInterval(frame, 15);
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
