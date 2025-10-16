"use client"

export default function BookingTabs({ 
  tabs = ["All Bookings", "Pending", "Confirmed", "Checked In"], 
  onStatusChange = () => {},
  activeStatus = "All Bookings" 
}) {
  console.log("Active status:", activeStatus)
  
  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-sm shadow-sm w-fit">
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onStatusChange(tab)}
          className={`px-4 py-1 cursor-pointer text-sm font-medium rounded-sm transition 
            ${activeStatus === tab ? "bg-white text-black shadow" : "text-gray-500 hover:text-gray-700"}`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}