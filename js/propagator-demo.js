const plot = document.getElementById("plot");

const ephemWorker = new Worker("js/propagator-worker.js");
const calcButton = document.getElementById("calc-button");
const statusLabel = document.getElementById("status-label");

let tStart = 0;
let tEnd = 0;

function drawPlot(xVals, yVals, trace) {
  const plotFn = trace ? Plotly.plot : Plotly.newPlot;
  plotFn(
    plot,
    [
      {
        mode: "lines",
        x: xVals,
        y: yVals
      }
    ],
    {
      title: "LandSat-7 Actual vs. Propagated Ephemeris",
      xaxis: {
        title: "Time (hours)",
        dtick: 6
      },
      yaxis: {
        title: "Error (meters)"
      }
    }
  );
  try {
    document.querySelectorAll(".plotlyjsicon")[0].remove();
  } catch {
    // do nothing
  }
}

function clickAction() {
  calcButton.disabled = true;
  statusLabel.innerText = "Generating ephemeris, please wait...";
  let step = parseFloat(document.getElementById("step-input").value);
  if (step < 1) {
    step = 1;
  }
  const degree = parseInt(document.getElementById("degree-input").value);
  const order = parseInt(document.getElementById("order-input").value);
  const moon = document.getElementById("moon-input").checked;
  const sun = document.getElementById("sun-input").checked;
  const mass = parseFloat(document.getElementById("mass-input").value);
  const area = parseFloat(document.getElementById("area-input").value);
  const drag = document.getElementById("drag-input").checked;
  const srp = document.getElementById("srp-input").checked;
  ephemWorker.postMessage([
    Math.abs(step),
    Math.abs(degree),
    Math.abs(order),
    moon,
    sun,
    mass,
    area,
    drag,
    srp
  ]);
  tStart = new Date().getTime();
}

ephemWorker.onmessage = message => {
  tEnd = new Date().getTime();
  const tDelta = (tEnd - tStart) / 1000;
  const result = message.data;
  const trace = document.getElementById("trace-input").checked;
  drawPlot(result[0], result[1], trace);
  statusLabel.innerText =
    "Ephemeris generation took: " + tDelta.toFixed(3) + " seconds";
  calcButton.disabled = false;
};

calcButton.onclick = clickAction;
clickAction();
