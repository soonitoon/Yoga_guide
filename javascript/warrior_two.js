let video;
let poseNet;
let pose;
let skeleton;
let brain;
let targetColor;
let rSlider, gSlider, bSlider;

function setup() {
  setCanvas();
  set_ml5();
  setModel();
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
  createCanvas(350, 480);
  rSlider = createSlider(0, 255, 0);
  gSlider = createSlider(0, 255, 0);
  bSlider = createSlider(0, 255, 0);
  video = createCapture();
  video.hide();
  rSlider.hide();
  gSlider.hide();
  bSlider.hide();
}

function setModel() {
  const modelInfo = {
    model: "../model/warrior_two/model.json", // Your traind model data
    metadata: "../model/warrior_two/model_meta.json",
    weights: "../model/warrior_two/model.weights.bin",
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log("pose prediction is ready!");
  predictColor();
}

function predictColor() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.predict(inputs, gotResult);
  } else {
    setTimeout(predictColor, 100);
  }
}

function gotResult(error, results) {
  if (error) {
    console.log(error);
  }
  let r = results[0].value;
  let g = results[1].value;
  let b = results[2].value;
  moveSliders(r, g, b);
  predictColor();
}

function moveSliders(r, g, b) {
  let preR = rSlider.value();
  let preG = gSlider.value();
  let preB = bSlider.value();
  if (Math.abs(r - preR) > 200) {
    rSlider.value(r);
  }
  if (Math.abs(g - preG) > 200) {
    gSlider.value(g);
  }
  if (Math.abs(b - preB) > 200) {
    bSlider.value(b);
  }
}

function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function draw() {
  push();
  drawMainCanvas();
  if (pose) {
    drawKeypoints();
    drawSkeleton();
  }
  pop();
  paintBackgoundColor();
  drawMessage();
}

function drawMainCanvas() {
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);
}

function drawKeypoints() {
  for (let i = 0; i < pose.keypoints.length; i++) {
    let x = pose.keypoints[i].position.x;
    let y = pose.keypoints[i].position.y;
    fill(51, 255, 255);
    ellipse(x, y, 10, 10);
  }
}

function drawSkeleton() {
  for (let i = 0; i < skeleton.length; i++) {
    let a = skeleton[i][0];
    let b = skeleton[i][1];
    strokeWeight(2);
    stroke(51, 255, 255);
    line(a.position.x, a.position.y, b.position.x, b.position.y);
  }
}

function paintBackgoundColor() {
  let r = rSlider.value();
  let g = gSlider.value();
  let b = bSlider.value();
  background(r, g, b, 60);
}

function drawMessage() {
  let r = rSlider.value();
  let g = gSlider.value();
  let b = bSlider.value();
  let message = "준비";
  if (b > g && b > r) {
    message = "조금만 더";
  } else if (g > r && g > b) {
    message = "잘했어요!";
  }
  fill(255, 255, 255);
  noStroke();
  textSize(70);
  textAlign(CENTER, CENTER);
  text(message, width / 2, height / 2);
}
