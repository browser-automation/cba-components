/* eslint-disable no-console */

document.addEventListener("DOMContentLoaded", () =>
{
  document.querySelector("cba-tabs").select("import-tab");
  document.querySelector("cba-tabs").addEventListener("tabChange", ({detail}) =>
  {
    console.log(detail);
  });
});
