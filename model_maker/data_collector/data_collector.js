let video;
let poseNet;
let pose;
let skeleton;
let brain;
let state = "waiting";
let targetColor;
let rSlider, gSlider, bSlider;

function setup() {
  setCanvas();
  set_ml5();
}

function set_ml5() {
  poseNet = ml5.poseNet(video, () => {
    console.log("poseNet is ready");
  });
  poseNet.on("pose", gotPoses);
  let options = {
    inputs: 34,
    outputs: 3,
    task: "regression",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
}

function setCanvas() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  rSlider = createSlider(0, 255, 255);
  gSlider = createSlider(0, 255, 0);
  bSlider = createSlider(0, 255, 0);
}

function delay(time) {
  return new Promise((resolve, reject) => {
    if (isNaN(time)) {
      reject(new Error("delay requires a valid number."));
    } else {
      setTimeout(resolve, time);
    }
  });
}

async function keyPressed() {
  if (key === "s") {
    brain.saveData();
  } else if (key === "d") {
    let r = rSlider.value();
    let g = gSlider.value();
    let b = bSlider.value();
    targetColor = [r, g, b];
    await delay(5000);
    console.log("collecting");
    state = "collecting";
    await delay(5000);
    console.log("not collecting");
    state = "waiting";
  }
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state === "collecting") {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      brain.addData(inputs, targetColor);
    }
  }
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);
  if (pose) {
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(51, 255, 255);
      ellipse(x, y, 10, 10);
    }
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(51, 255, 255);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }
  pop();
  let r = rSlider.value();
  let g = gSlider.value();
  let b = bSlider.value();
  background(r, g, b, 100);
}
