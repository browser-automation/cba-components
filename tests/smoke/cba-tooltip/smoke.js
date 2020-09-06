const tooltip = document.querySelector("cba-tooltip");

const textInput = document.querySelector("#textData");
const linkInput = document.querySelector("#linkData");
const linkTextInput = document.querySelector("#linkTextData");
const headingInput = document.querySelector("#headingData");
const disableButton = document.querySelector("#disableTooltip");
const enableButton = document.querySelector("#enableTooltip");

for (const inputs of document.querySelectorAll("#controls input"))
{
  inputs.addEventListener("change", () =>
  {
    const text = textInput.value;
    const link = linkInput.value;
    const linkText = linkTextInput.value;
    const heading = headingInput.value;
    tooltip.setData({text, link, linkText, heading});
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
