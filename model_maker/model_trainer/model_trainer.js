let brain;

function setup() {
  set_ml5();
}

function set_ml5() {
  let options = {
    inputs: 34,
    outputs: 3,
    task: "regression",
    debug: true,
  };
  brain = ml5.neuralNetwork(options);
  brain.loadData("color_poses.json", dataReady); // Your json file's name
}

function dataReady() {
  brain.normalizeData();
  brain.train({ epochs: 50 }, finished);
}

function finished() {
  console.log("model trained");
  brain.save();
}
