import React from 'react';

const festivalIcons = {
  Diwali: "🪔",
  Holi: "🎨",
  Eid: "🌙",
  Christmas: "🎄",
  Dussehra: "🏹",
  Navratri: "💃",
  "Raksha Bandhan": "🧵",
  Pongal: "🌾",
  Onam: "🌼",
  "Ganesh Chaturthi": "🐘"
};

const FestivalCalendar = ({ festivals, onSelect, selectedFestival }) => {
  const festivalsByMonth = festivals.reduce((acc, festival) => {
    const month = new Date(festival.date).toLocaleString('default', { month: 'long' });
    if (!acc[month]) acc[month] = [];
    acc[month].push(festival);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(festivalsByMonth).map(([month, monthFestivals]) => (
        <div key={month}>
          <h4 className="text-md font-semibold text-gray-700 mb-2">{month}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthFestivals.map((festival) => (
              <div
                key={festival.name}
                onClick={() => onSelect({ ...festival, icon: festivalIcons[festival.name] || "🎉" })}
                className={`p-3 rounded-lg border cursor-pointer transition-colors festival-card ${
                  selectedFestival?.name === festival.name
                    ? 'border-[#9B177E] bg-gradient-to-r from-[#f3e8ff] to-[#ffe4fa]'
                    : 'border-gray-200 hover:border-[#9B177E]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-gray-900 flex items-center">
                      <span className="mr-2 text-xl">{festivalIcons[festival.name] || "🎉"}</span>
                      {festival.name}
                    </h5>
                    <p className="text-sm text-gray-500">{festival.date}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      festival.impactFactor > 1
                        ? 'bg-[#f3e8ff] text-[#9B177E]'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {festival.impactFactor > 1 ? 'High Impact' : 'Normal'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FestivalCalendar;
