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


cbaList.selectRow("row2");

