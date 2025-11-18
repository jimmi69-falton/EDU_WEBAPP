import React from 'react';

const BarChart = ({ data = [] }) => {
  if (data.length === 0) return null;

  return (
    <div className="flex items-end justify-between space-x-4 h-48">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="w-full bg-[var(--neutral-100)] rounded-t-lg relative" style={{ height: '160px' }}>
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-500"
              style={{
                height: `${item.value}%`,
                background: item.color || 'var(--primary-600)',
              }}
            />
          </div>
          <div className="mt-3 text-center">
            <p className="text-lg font-bold text-[var(--neutral-800)]">{item.value}%</p>
            <p className="text-xs text-[var(--neutral-500)] mt-1">{item.range}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;

