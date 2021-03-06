import getMedian from 'ml-array-median';

export default function convertTo3DZ(spectra) {
  let minZ = spectra[0].data[0];
  let maxZ = minZ;
  let ySize = spectra.length;
  let xSize = spectra[0].data.length / 2;
  let z = new Array(ySize);
  for (let i = 0; i < ySize; i++) {
    z[i] = new Array(xSize);
    let xVector = spectra[i].data;
    for (let j = 0; j < xSize; j++) {
      let value = xVector[j * 2 + 1];
      z[i][j] = value;
      if (value < minZ) minZ = value;
      if (value > maxZ) maxZ = value;
    }
  }

  const firstX = spectra[0].data[0];
  const lastX = spectra[0].data[spectra[0].data.length - 2]; // has to be -2 because it is a 1D array [x,y,x,y,...]
  const firstY = spectra[0].pageValue;
  const lastY = spectra[ySize - 1].pageValue;

  // Because the min / max value are the only information about the matrix if we invert
  // min and max we need to invert the array
  if (firstX > lastX) {
    for (let spectrum of z) {
      spectrum.reverse();
    }
  }
  if (firstY > lastY) {
    z.reverse();
  }

  return {
    z: z,
    minX: Math.min(firstX, lastX),
    maxX: Math.max(firstX, lastX),
    minY: Math.min(firstY, lastY),
    maxY: Math.max(firstY, lastY),
    minZ: minZ,
    maxZ: maxZ,
    noise: getMedian(z[0].map(Math.abs)),
  };
}
