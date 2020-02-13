const cbaList = document.querySelector("cba-list");

cbaList.items = [
  {
    id: "row1",
    data: "Info",
    text: "List1"
  },
  {
    id: "row2",
    data: "Info",
    text: "List2",
    subItems: [
      {
        id: "subrow1",
        data: "Info",
        text: "Sub List1"
      },
      {
        data: "Info",
        text: "Sub List2"
      }
    ]
  },
  {
    id: "row3",
    data: "Info",
    text: "List3"
  },
];


document.querySelector("#update-row").addEventListener("click", () =>
{
  const item = cbaList.getSelectedItem();
  item.text = document.querySelector("input").value;
  cbaList.updateRow(item, item.id);
});

document.querySelector("#delete-row").addEventListener("click", () =>
{
  const item = cbaList.getSelectedItem();
  cbaList.deleteRow(item.id);
});
let count = 4;
document.querySelector("#add-item").addEventListener("click", () =>
{
  count++;
  cbaList.addRow({
    data: `Info${count}`,
    text: `List${count}`
  });
});

document.querySelector("#add-subitem").addEventListener("click", () =>
{
  count++;
  const {id} = cbaList.getSelectedItem();
  cbaList.addRow({
    data: `Info${count}`,
    text: `List${count}`
  }, id);
});

cbaList.addEventListener("select", () =>
{
  const {text} = cbaList.getSelectedItem();
  document.querySelector("input").value = text;
});

cbaList.selectRow("row2");

