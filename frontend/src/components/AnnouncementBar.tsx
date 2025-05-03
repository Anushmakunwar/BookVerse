import React from 'react';

const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-[#ffb703] text-[#023047] py-2 text-center text-sm font-bold w-full">
      Free shipping on orders over $35! Use code: <span className="underline font-extrabold">BOOKVERSE</span>
    </div>
  );
};

export default AnnouncementBar;
