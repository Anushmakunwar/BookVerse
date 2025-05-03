import React from 'react';

const ShippingNotification: React.FC = () => {
  return (
    <div className="bg-[#ffb703] text-[#023047] py-2 text-center text-sm font-bold w-full border-0 m-0 fixed top-0 left-0 right-0 z-50">
      Free shipping on orders over $35! Use code: <span className="underline font-extrabold">BOOKVERSE</span>
    </div>
  );
};

export default ShippingNotification;
