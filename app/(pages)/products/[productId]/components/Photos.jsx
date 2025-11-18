// ...existing code...
"use client";

import { useState } from "react";

export default function Photos({ imageList }) {
  const [selectedImage, setSelectedImage] = useState(imageList?.[0]);
  if (!imageList || imageList?.length === 0) {
    return <div className="text-center text-gray-500">Không có ảnh</div>;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex justify-center w-full">
        <img
          className="object-cover h-[350px] md:h-[430px]"
          src={selectedImage}
          alt="Ảnh sản phẩm"
        />
      </div>
      <div className="flex flex-wrap justify-center items-center gap-3">
        {imageList?.map((item, idx) => {
          return (
            <div
              key={item + idx}
              onClick={() => {
                setSelectedImage(item);
              }}
              className="w-[80px] border rounded p-2 cursor-pointer"
              role="button"
              aria-label={`Chọn ảnh ${idx + 1}`}
            >
              <img className="object-cover" src={item} alt={`Ảnh nhỏ ${idx + 1}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
// ...existing code...