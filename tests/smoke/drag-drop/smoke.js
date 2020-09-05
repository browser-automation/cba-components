const cbaTable = document.querySelector("cba-table");
const items = [];
for (let index = 0; index < 10; index++) {
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

cbaTable.addEventListener("dragndrop", ({detail}) =>
{
  console.log(detail);
});

document.querySelector("#delete-row").addEventListener("click", () =>
{
  cbaTable.deleteRow(cbaTable.getSelectedItem().id);
});

cbaTable.items = items;

const cbaList = document.querySelector("cba-list");

const listItems = [
  {
    id: `subrow1`,
    data: {
      data: `Info1`,
      texts: {
        data: `List Data1`,
        event: `List Event1`,
        value: `List Value1`
      }
    },
    text: `List1`
  },
  {
    id: `subrow2`,
    data: {
      tooltip: "Tooltip text 2",
      data: `Info2`,
      texts: {
        data: `List Data2`,
        event: `List Event2`,
        value: `List Value2`
      }
    },
    text: `List3`
  },
  {
    id: `subrow3`,
    info: "Hello World",
    data: {
      tooltip: "Tooltip text 3",
      data: `Info3`,
      texts: {
        data: `List Data3`,
        event: `List Event3`,
        value: `List Value3`
      }
    },
    text: `List3`
  },
];

cbaList.items = listItems;
