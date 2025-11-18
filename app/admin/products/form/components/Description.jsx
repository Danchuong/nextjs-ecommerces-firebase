// ...existing code...
"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ size: ["extra-small", "small", "medium", "large"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  },
};

export default function Description({ data, handleData }) {
  const handleChange = (value) => {
    handleData("description", value);
  };
  return (
    <section className="flex flex-col gap-3 bg-white border p-4 rounded-xl h-full">
      <h1 className="font-semibold">Mô tả</h1>
      <ReactQuill
        value={data?.description}
        onChange={handleChange}
        modules={modules}
        placeholder="Nhập mô tả sản phẩm..."
      />
    </section>
  );
}
// ...existing code...