const tooltip = document.querySelector("cba-tooltip");

const textInput = document.querySelector("#textData");
const linkInput = document.querySelector("#linkData");
const linkTextInput = document.querySelector("#linkTextData");
const disableButton = document.querySelector("#disableTooltip");
const enableButton = document.querySelector("#enableTooltip");

for (const inputs of document.querySelectorAll("#controls input"))
{
  inputs.addEventListener("change", () =>
  {
    tooltip.setData(textInput.value, linkInput.value, linkTextInput.value);
  });
}

disableButton.addEventListener("click", () =>
{
  tooltip.disable()
});

enableButton.addEventListener("click", () =>
{
  tooltip.enable();
});
