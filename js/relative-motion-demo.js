const plot = document.getElementById("plot");

const ephemWorker = new Worker("js/relative-motion-worker.js");

const smaSlider = document.getElementById("sma-slider");
const smaValue = document.getElementById("sma-value");

const eccSlider = document.getElementById("ecc-slider");
const eccValue = document.getElementById("ecc-value");

const incSlider = document.getElementById("inc-slider");
const incValue = document.getElementById("inc-value");

const raSlider = document.getElementById("ra-slider");
const raValue = document.getElementById("ra-value");

const apSlider = document.getElementById("ap-slider");
const apValue = document.getElementById("ap-value");

const taSlider = document.getElementById("ta-slider");
const taValue = document.getElementById("ta-value");

function drawPlot(rVals, iVals, cVals) {
  let rMax = 0;
  let iMax = 0;
  let cMax = 0;

  for (let i = 0; i < rVals.length; i++) {
    rMax = Math.max(rMax, Math.abs(rVals[i]));
    iMax = Math.max(iMax, Math.abs(iVals[i]));
    cMax = Math.max(cMax, Math.abs(cVals[i]));
  }
  const maxVal = Math.max(rMax, iMax, cMax);
  const maxRange = [-maxVal, maxVal];

  Plotly.react(
    plot,
    [
      {
        type: "scatter3d",
        mode: "lines",
        x: rVals,
        y: iVals,
        z: cVals,
        opacity: 0.7,
        line: {
          width: 3,
          color: "blue"
        }
      },
      {
        type: "scatter3d",
        mode: "markers",
        x: [0],
        y: [0],
        z: [0],
        opacity: 0.7,
        marker: {
          size: 3,
          color: "red"
        }
      }
    ],
    {
      title: "Classical Orbit Elements vs. Relative Motion",
      showlegend: false,
      scene: {
        aspectmode: "manual",
        aspectratio: {
          x: 1,
          y: 1,
          z: 1
        },
        xaxis: {
          title: "Radial (km)",
          range: maxRange
        },
        yaxis: {
          title: "In-Track (km)",
          range: maxRange
        },
        zaxis: {
          title: "Cross-Track (km)",
          range: maxRange
        }
      }
    }
  );
  try {
    document.querySelectorAll(".plotlyjsicon")[0].remove();
  } catch {
    // do nothing
  }
}

function signStr(n) {
  if (n >= 0) {
    return "+" + n;
  }
  return "" + n;
}

smaSlider.oninput = function() {
  smaValue.innerText = signStr(this.value / 100);
};
smaSlider.onchange = function() {
  updateDisplay();
};

eccSlider.oninput = function() {
  eccValue.innerText = signStr(this.value / 100000);
};
eccSlider.onchange = function() {
  updateDisplay();
};

incSlider.oninput = function() {
  incValue.innerText = signStr(this.value / 1000);
};
incSlider.onchange = function() {
  updateDisplay();
};

raSlider.oninput = function() {
  raValue.innerText = signStr(this.value / 1000);
};
raSlider.onchange = function() {
  updateDisplay();
};

apSlider.oninput = function() {
  apValue.innerText = signStr(this.value / 1000);
};
apSlider.onchange = function() {
  updateDisplay();
};

taSlider.oninput = function() {
  taValue.innerText = signStr(this.value / 1000);
};
taSlider.onchange = function() {
  updateDisplay();
};

ephemWorker.onmessage = message => {
  const result = message.data;
  drawPlot(result[0], result[1], result[2]);
};

function updateDisplay() {
  const a = parseFloat(smaValue.innerText);
  const e = parseFloat(eccValue.innerText);
  const i = parseFloat(incValue.innerText) * (Math.PI / 180);
  const o = parseFloat(raValue.innerText) * (Math.PI / 180);
  const w = parseFloat(apValue.innerText) * (Math.PI / 180);
  const v = parseFloat(taValue.innerText) * (Math.PI / 180);
  ephemWorker.postMessage([a, e, i, o, w, v]);
}

updateDisplay();
