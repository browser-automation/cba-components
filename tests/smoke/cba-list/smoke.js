const cbaList = document.querySelector("cba-list");
const items = [
  {
    id: "row1",
    data: "Info",
    text: "List1",
    alert: {
      text: "Topmost element Alert text",
      type: "error"
    }
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
        id: "subrow2",
        data: "Info",
        text: "Sub List2",
        alert: {
          text: "Subitem Alert text",
          type: "error"
        }
      },
      {
        data: "Info",
        text: "Sub List3"
      }
    ]
  },
  {
    id: "row3",
    data: "Info",
    text: "List3"
  },
];

for (let i = 4; i < 20; i++)
{
  items.push({
    id: `row${i}`,
    data: `Info`,
    text: `List${i}`
  });
}
cbaList.items = items;

const cbaSortableList = document.querySelector("#sortable");
cbaSortableList.items = [
  {
    text: "A longer List1 to test wrap"
  },
  {
    text: "List3"
  },
  {
    text: "List2"
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

document.querySelector("#rename").addEventListener("click", () =>
{
  const {id} = cbaList.getSelectedItem();
  cbaList.setEditable(id, true);
});

document.querySelector("#save").addEventListener("click", () =>
{
  cbaList.saveEditables();
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

