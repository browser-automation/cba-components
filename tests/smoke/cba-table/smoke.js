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
  const items = cbaTable.items;
  const num = items.length + 1;
  items.push({
    id: `row${num}`,
    data: "Info",
    texts: {
      data: `Data${num}`,
      event: `Event${num}`,
      value: `Value${num}`
    }
  });
  cbaTable.items = items;
});

document.querySelector("#delete-row").addEventListener("click", () =>
{
  cbaTable.deleteRow(cbaTable.getSelectedRow().id);
});
