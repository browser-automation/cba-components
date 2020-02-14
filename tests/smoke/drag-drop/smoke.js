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
  const {dropRowId, dragRowId, dragId} = detail;
  const {data} = document.getElementById(dragId).getItem(dragRowId);
  cbaTable.addRow(data, dropRowId);
});

cbaTable.items = items;


const cbaList = document.querySelector("cba-list");

const listItems = [];
for (let index = 1; index < 4; index++) {
  listItems.push({
    id: `subrow${index}`,
    data: {
      data: `Info${index}`,
      texts: {
        data: `List Data${index}`,
        event: `List Event${index}`,
        value: `List Value${index}`
      }
    },
    text: `List${index}`
  });
}

cbaList.items = listItems;
