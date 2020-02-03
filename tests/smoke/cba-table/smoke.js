const cbaTable = document.querySelector("cba-table");
const items = [];
for (let index = 0; index < 30; index++) {
  items.push({
    id: "row" + index,
    data: "Info",
    texts: {
      data: "Data" + index,
      event: "Event" + index,
      value: "Value" + index
    }
  });
}

cbaTable.items = items;
cbaTable.selectRow("row0");

document.querySelector("#add-row").addEventListener("click", () =>
{
  const num = cbaTable.items.length + 1;
  cbaTable.addRow({
    data: "Info",
    texts: {
      data: `Data${num}`,
      event: `Event${num}`,
      value: `Value${num}`
    }
  });
});

onSelected();
cbaTable.addEventListener("select", onSelected);

function onSelected()
{
  const {texts} = cbaTable.getSelectedItem();
  for (const name in texts)
  {
    const value = texts[name];
    document.querySelector(`input[name="${name}"]`).value = value;
  }
}

document.querySelector("#delete-row").addEventListener("click", () =>
{
  cbaTable.deleteRow(cbaTable.getSelectedItem().id);
});

document.querySelector("#update-row").addEventListener("click", () =>
{
  const row = cbaTable.getSelectedItem();
  for (const name in row.texts)
  {
    const value = document.querySelector(`input[name="${name}"]`).value;
    row.texts[name] = value;
  }
  cbaTable.updateRow(row);
});
