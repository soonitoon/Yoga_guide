let video;
let poseNet;
let pose;
let skeleton;

let brain;
// let poseLabel = "ready";

let state = "waiting...";
let targetColor;

let rSlider, gSlider, bSlider;

async function keyPressed() {
  if (key === "s") {
    brain.saveData();
  } else if (key === "d") {
    let r = rSlider.value();
    let g = gSlider.value();
    let b = bSlider.value();
    targetColor = [r, g, b];

    await delay(3000);
    console.log("collecting");
    state = "collecting";

    await delay(3000);
    console.log("not collecting");
    state = "waiting";
  }
}

function setup() {
  createCanvas(640, 480);

  rSlider = createSlider(0, 255, 255);
  gSlider = createSlider(0, 255, 0);
  bSlider = createSlider(0, 255, 0);

  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);

  let options = {
    inputs: 34,
    outputs: 3,
    task: "regression",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: "model/model.json",
    metadata: "model/model_meta.json",
    weights: "model/model.weights.bin",
  };
  brain.load(modelInfo, brainLoaded);
  // brain.loadData("collected.json", dataReady);
}

function brainLoaded() {
  console.log("pose classification is ready!");
  classifyPose();
}

function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label;
  }
  //console.log(results[0].confidence);
  classifyPose();
}

function dataReady() {
  brain.normalizeData();
  brain.train({ epochs: 50 }, finished);
}

function finished() {
  console.log("model trained");
  brain.save();
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

function modelLoaded() {
  console.log("poseNet ready");
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

  // fill(255, 0, 255);
  // noStroke();
  // textSize(256);
  // textAlign(CENTER, CENTER);
  // text(poseLabel, width / 2, height / 2);
}
