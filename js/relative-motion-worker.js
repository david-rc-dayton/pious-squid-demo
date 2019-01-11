importScripts("./ephemeris.js");
importScripts("../lib/pious-squid.min.js");

const ClassicalElements = PiousSquid.coordinates.ClassicalElements;
const J2000 = PiousSquid.coordinates.J2000;
const EpochUTC = PiousSquid.time.EpochUTC;
const Kepler = PiousSquid.propagators.Kepler;
const Vector3D = PiousSquid.math.Vector3D;

const ephemeris = [DEFINITIVE_EPHEMERIS[0]].map(a => {
  const epoch = EpochUTC.fromDateString(a[0]);
  const position = new Vector3D(a[1], a[2], a[3]);
  const velocity = new Vector3D(a[4], a[5], a[6]);
  return new J2000(epoch, position, velocity);
});

const initState = ephemeris[0].toClassicalElements();
const reference = new Kepler(initState);

function propagate(a, e, i, o, w, v) {
  const satellite = new Kepler(
    new ClassicalElements(
      initState.epoch,
      initState.a + a,
      initState.e + e,
      initState.i + i,
      initState.o + o,
      initState.w + w,
      initState.v + v
    )
  );

  const rVals = [];
  const iVals = [];
  const cVals = [];
  const step = 60;
  let epoch = initState.epoch;
  for (let i = 0; i < 21600; i += step) {
    const satState = satellite.propagate(epoch);
    const refState = reference.propagate(epoch);
    const ric = satState.toRIC(refState).relPosition;
    rVals.push(ric.x);
    iVals.push(ric.y);
    cVals.push(ric.z);
    epoch = epoch.roll(step);
  }
  return [rVals, iVals, cVals];
}

onmessage = message => {
  const args = message.data;
  const result = propagate(
    args[0],
    args[1],
    args[2],
    args[3],
    args[4],
    args[5]
  );
  postMessage(result);
};
