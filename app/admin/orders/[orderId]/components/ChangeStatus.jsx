// ...existing code...
"use client";

import { updateOrderStatus } from "@/lib/firestore/orders/write";
import toast from "react-hot-toast";

export default function ChangeOrderStatus({ order }) {
  const handleChangeStatus = async (status) => {
    try {
      if (!status) {
        toast.error("Vui lòng chọn trạng thái");
      }
      await toast.promise(
        updateOrderStatus({ id: order?.id, status: status }),
        {
          error: (e) => e?.message,
          loading: "Đang cập nhật...",
          success: "Cập nhật thành công",
        }
      );
    } catch (error) {
      toast.error(error?.message);
    }
  };
  return (
    <select
      value={order?.status}
      onChange={(e) => {
        handleChangeStatus(e.target.value);
      }}
      name="change-order-status"
      id="change-order-status"
      className="px-4 py-2 border rounded-lg bg-white"
    >
      <option value="">Cập nhật trạng thái</option>
      <option value="pending">Đang chờ</option>
      <option value="packed">Đóng gói</option>
      <option value="picked up">Đã lấy</option>
      <option value="in transit">Đang vận chuyển</option>
      <option value="out for delivery">Đang giao</option>
      <option value="delivered">Đã giao</option>
      <option value="cancelled">Đã hủy</option>
    </select>
  );
}
// ...existing code...