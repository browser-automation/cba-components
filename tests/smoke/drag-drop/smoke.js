/* eslint-disable no-console */

const cbaTable = document.querySelector("cba-table");
const items = [];
for (let index = 0; index < 50; index++)
{
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
    tooltip: {
      text: "Tooltip text used in the cba-list with the link to a resource",
      link: "https://example.com"
    },
    data: {
      data: `Info2`,
      texts: {
        data: `List Data2`,
        event: `List Event2`,
        value: `List Value2`
      }
    },
    text: `List2`
  }
];

for (let i = 3; i < 20; i++)
{
  listItems.push({
    id: `subrow${i}`,
    text: `List${i}`,
    info: "Hello World",
    tooltip: {
      text: `Tooltip text ${i}`
    },
    data: {
      data: `Info${i}`,
      texts: {
        data: `List Data${i}`,
        event: `List Event${i}`,
        value: `List Value${i}`
      }
    }
  })
}

cbaList.items = listItems;
