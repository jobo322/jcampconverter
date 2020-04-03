import add2D from './2d/add2D';
import { complexChromatogram } from './complexChromatogram';
import simpleChromatogram from './simpleChromatogram';

export default function postProcessing(result, profiling, ntuples, options) {
  if (Object.keys(ntuples).length > 0) {
    let newNtuples = [];
    let keys = Object.keys(ntuples);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let values = ntuples[key];
      for (let j = 0; j < values.length; j++) {
        if (!newNtuples[j]) newNtuples[j] = {};
        newNtuples[j][key] = values[j];
      }
    }
    result.ntuples = newNtuples;
  }

  if (result.twoD && options.wantXY) {
    add2D(result, options);
    if (profiling) {
      profiling.push({
        action: 'Finished countour plot calculation',
        time: Date.now() - options.start,
      });
    }
    if (!options.keepSpectra) {
      delete result.spectra;
    }
  }

  if (options.chromatogram) {
    options.xy = true;
  }

  if (options.xy && options.wantXY) {
    // the spectraData should not be a oneD array but an object with x and y
    if (result.spectra && result.spectra.length > 0) {
      for (let spectrum of result.spectra) {
        if (spectrum.data && spectrum.data.length > 0) {
          for (let j = 0; j < spectrum.data.length; j++) {
            let data = spectrum.data[j];
            let newData = {
              x: new Array(data.length / 2),
              y: new Array(data.length / 2),
            };
            for (let k = 0; k < data.length; k = k + 2) {
              newData.x[k / 2] = data[k];
              newData.y[k / 2] = data[k + 1];
            }
            spectrum.data[j] = newData;
          }
        }
      }
    }
  }

  // maybe it is a GC (HPLC) / MS. In this case we add a new format
  if (options.chromatogram) {
    if (result.spectra.length > 1) {
      complexChromatogram(result);
    } else {
      simpleChromatogram(result);
    }
    if (profiling) {
      profiling.push({
        action: 'Finished chromatogram calculation',
        time: Date.now() - options.start,
      });
    }
  }

  if (profiling) {
    profiling.push({
      action: 'Total time',
      time: Date.now() - options.start,
    });
  }
}
