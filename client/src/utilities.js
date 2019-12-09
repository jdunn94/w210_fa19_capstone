export const toTitleCase = persona =>
  persona
    .split("_")
    .map(a => a[0].toUpperCase() + a.slice(1))
    .join(" ");

export const decodeEntities = encodedString => {
  let textArea = document.createElement("textarea");
  textArea.innerHTML = encodedString;
  return textArea.value;
};


// https://stackoverflow.com/questions/48719873/how-to-get-median-and-quartiles-percentiles-of-an-array-in-javascript-or-php
export const asc = arr => arr.sort((a, b) => a - b);

export const sum = arr => arr.reduce((a, b) => a + b, 0);

export const mean = arr => sum(arr) / arr.length;

// sample standard deviation
export const std = arr => {
  const mu = mean(arr);
  const diffArr = arr.map(a => (a - mu) ** 2);
  return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

export const quantile = (arr, q) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

// https://gist.github.com/IceCreamYou/6ffa1b18c4c8f6aeaad2
export function percentRank(array, n) {
  var L = 0;
  var S = 0;
  var N = array.length

  for (var i = 0; i < array.length; i++) {
      if (array[i] < n) {
          L += 1
      } else if (array[i] === n) {
          S += 1
      } else {

      }
  }

  var pct = (L + (0.5 * S)) / N

  return pct
}
