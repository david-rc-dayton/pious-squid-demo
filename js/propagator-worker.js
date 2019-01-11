importScripts("./ephemeris.js");
importScripts("../lib/pious-squid.min.js");

const J2000 = PiousSquid.coordinates.J2000;
const EpochUTC = PiousSquid.time.EpochUTC;
const RungeKutta4 = PiousSquid.propagators.RungeKutta4;
const Vector3D = PiousSquid.math.Vector3D;

const ephemeris = DEFINITIVE_EPHEMERIS.map(a => {
  const epoch = EpochUTC.fromDateString(a[0]);
  const position = new Vector3D(a[1], a[2], a[3]);
  const velocity = new Vector3D(a[4], a[5], a[6]);
  return new J2000(epoch, position, velocity);
});

const propagator = new RungeKutta4(ephemeris[0]);

function propagate(step, degree, order, moon, sun, mass, area, drag, srp) {
  propagator.reset();
  propagator.setStepSize(step);
  propagator.forceModel.clearModel();
  propagator.forceModel.setEarthGravity(degree, order);
  if (moon || sun) {
    propagator.forceModel.setThirdBody(moon, sun);
  }
  if (drag) {
    propagator.forceModel.setAtmosphericDrag(mass, area, 2.2);
  }
  if (srp) {
    propagator.forceModel.setSolarRadiationPressure(mass, area, 1.2);
  }
  const xVals = [];
  const yVals = [];
  for (let i = 0; i < ephemeris.length; i++) {
    const state = propagator.propagate(ephemeris[i].epoch);
    xVals.push(state.epoch.difference(ephemeris[0].epoch) / 3600);
    yVals.push(state.position.distance(ephemeris[i].position) * 1000);
  }
  return [xVals, yVals];
}

onmessage = message => {
  const args = message.data;
  const result = propagate(...args);
  postMessage(result);
};
