export default function listOfItems(items) {
  return items.map((item) => {
    return <li key={item}>{item}</li>;
  });
}
