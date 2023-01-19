export default function listOfItems(items) {
  return items.map((item) => {
    return (
      <label key={item} className="flex items-top w-[95vh] justify-center mr-auto ml-auto mb-1">
        <span className="mr-2 no-scrollbar overflow-auto">{item}</span>
        <input
          checked
          id="red-checkbox"
          type="checkbox"
          value=""
          className="mr-2 h-4 w-4 rounded border-gray-300 bg-gray-100 text-red-600 focus:ring-2 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-red-600"
        />
        <span>OFF</span>
      </label>
    );
  });
}
