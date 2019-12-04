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
