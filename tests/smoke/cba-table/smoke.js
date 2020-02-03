const cbaTable = document.querySelector("cba-table");
cbaTable.items = [
  {
    id: "row1",
    data: "Info",
    texts: {
      data: "Data1",
      event: "Event1",
      value: "Value1"
    }
  },
  {
    id: "row2",
    data: "Info",
    selected: true,
    texts: {
      data: "Data2",
      event: "Event2",
      value: "Value2"
    }
  },
  {
    id: "row3",
    data: "Info",
    texts: {
      data: "Data3",
      event: "Event3",
      value: "Value3"
    }
  }];

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
