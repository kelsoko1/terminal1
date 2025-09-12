import React from 'react';

export const KelsokoTopNavBar = ({ search, setSearch, sort, setSort, view, setView }) => (
  <div className="flex items-center justify-between px-2 py-2 bg-[#18181b] border-b border-red-500 rounded-t-lg" style={{ borderBottomColor: 'hsl(var(--investor-danger))' }}>
    <button onClick={() => setSort(sort === 'recent' ? 'payout' : 'recent')} className="investor-danger font-bold">Sort</button>
    <input
      className="bg-[#23232a] rounded px-2 py-1 text-white w-1/2"
      placeholder="Search..."
      value={search}
      onChange={e => setSearch(e.target.value)}
    />
    <button onClick={() => setView(view === 'list' ? 'grid' : 'list')} className="investor-danger font-bold">
      {view === 'list' ? 'Grid' : 'List'}
    </button>
  </div>
); 