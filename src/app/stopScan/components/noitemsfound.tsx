export default function NoItemsFound() {
  return (

<div className="text-center py-12 bg-gray-50 rounded-lg">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-gray-400 mx-auto"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
    </svg>
    <h2 className="text-xl font-medium text-gray-600 mt-4">
        No items found
    </h2>
    <p className="text-gray-500 mt-2">
        You haven&#39;t scanned any items.
    </p>
</div>)
}