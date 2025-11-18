// ...existing code...
"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  createCheckoutAndGetURL,
  createCheckoutCODAndGetId,
} from "@/lib/firestore/checkout/write";
import { Button } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { CheckSquare2Icon, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Checkout({ productList }) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState("prepaid");
  const [address, setAddress] = useState(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleAddress = (key, value) => {
    setAddress({ ...(address ?? {}), [key]: value });
  };

  const totalPrice = productList?.reduce((prev, curr) => {
    return prev + curr?.quantity * curr?.product?.salePrice;
  }, 0);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      if (totalPrice <= 0) {
        throw new Error("Tổng tiền phải lớn hơn 0");
      }
      if (!address?.fullName || !address?.mobile || !address?.addressLine1) {
        throw new Error("Vui lòng điền đầy đủ thông tin địa chỉ");
      }

      if (!productList || productList?.length === 0) {
        throw new Error("Danh sách sản phẩm trống");
      }

      if (paymentMode === "prepaid") {
        const url = await createCheckoutAndGetURL({
          uid: user?.uid,
          products: productList,
          address: address,
        });
        router.push(url);
      } else {
        const checkoutId = await createCheckoutCODAndGetId({
          uid: user?.uid,
          products: productList,
          address: address,
        });
        router.push(`/checkout-cod?checkout_id=${checkoutId}`);
        toast.success("Đặt hàng thành công!");
        confetti();
      }
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  return (
    <section className="flex flex-col md:flex-row  gap-3">
      <section className="flex-1 flex flex-col gap-4 border rounded-xl p-4">
        <h1 className="text-xl">Địa chỉ giao hàng</h1>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            id="full-name"
            name="full-name"
            placeholder="Họ và tên"
            value={address?.fullName ?? ""}
            onChange={(e) => {
              handleAddress("fullName", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <input
            type="tel"
            id="mobile"
            name="mobile"
            placeholder="Số điện thoại"
            value={address?.mobile ?? ""}
            onChange={(e) => {
              handleAddress("mobile", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={address?.email ?? ""}
            onChange={(e) => {
              handleAddress("email", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <input
            type="text"
            id="address-line-1"
            name="address-line-1"
            placeholder="Địa chỉ dòng 1"
            value={address?.addressLine1 ?? ""}
            onChange={(e) => {
              handleAddress("addressLine1", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <input
            type="text"
            id="address-line-2"
            name="address-line-2"
            placeholder="Địa chỉ dòng 2"
            value={address?.addressLine2 ?? ""}
            onChange={(e) => {
              handleAddress("addressLine2", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <input
            type="number"
            id="pincode"
            name="pincode"
            placeholder="Mã bưu chính"
            value={address?.pincode ?? ""}
            onChange={(e) => {
              handleAddress("pincode", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <input
            type="text"
            id="city"
            name="city"
            placeholder="Thành phố"
            value={address?.city ?? ""}
            onChange={(e) => {
              handleAddress("city", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <input
            type="text"
            id="state"
            name="state"
            placeholder="Tỉnh/Thành"
            value={address?.state ?? ""}
            onChange={(e) => {
              handleAddress("state", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
          <textarea
            type="text"
            id="delivery-notes"
            name="delivery-notes"
            placeholder="Ghi chú cho đơn hàng, ví dụ: lưu ý giao hàng"
            value={address?.orderNote ?? ""}
            onChange={(e) => {
              handleAddress("orderNote", e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-full focus:outline-none"
          />
        </div>
      </section>
      <div className="flex-1 flex flex-col gap-3">
        <section className="flex flex-col gap-3 border rounded-xl p-4">
          <h1 className="text-xl">Sản phẩm</h1>
          <div className="flex flex-col gap-2">
            {productList?.map((item) => {
              return (
                <div className="flex gap-3 items-center">
                  <img
                    className="w-10 h-10 object-cover rounded-lg"
                    src={item?.product?.featureImageURL}
                    alt=""
                  />
                  <div className="flex-1 flex flex-col">
                    <h1 className="text-sm">{item?.product?.title}</h1>
                    <h3 className="text-green-600 font-semibold text-[10px]">
                      {item?.product?.salePrice} đ
                      <span className="text-black">x</span>
                      <span className="text-gray-600">{item?.quantity}</span>
                    </h3>
                  </div>
                  <div>
                    <h3 className="text-sm">
                      {item?.product?.salePrice * item?.quantity} đ
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between w-full items-center p-2 font-semibold">
            <h1>Tổng</h1>
            <h1>{totalPrice} đ</h1>
          </div>
        </section>
        <section className="flex flex-col gap-3 border rounded-xl p-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-xl">Phương thức thanh toán</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setPaymentMode("prepaid");
                }}
                className="flex items-center gap-1 text-xs"
              >
                {paymentMode === "prepaid" && (
                  <CheckSquare2Icon className="text-blue-500" size={13} />
                )}
                {paymentMode === "cod" && <Square size={13} />}
                Thanh toán trước
              </button>
              <button
                onClick={() => {
                  setPaymentMode("cod");
                }}
                className="flex items-center gap-1 text-xs"
              >
                {paymentMode === "prepaid" && <Square size={13} />}
                {paymentMode === "cod" && (
                  <CheckSquare2Icon className="text-blue-500" size={13} />
                )}
                Thanh toán khi nhận hàng
              </button>
            </div>
          </div>
          <div className="flex gap-1 items-center">
            <CheckSquare2Icon className="text-blue-500" size={13} />
            <h4 className="text-xs text-gray-600">
              Tôi đồng ý với{" "}
              <span className="text-blue-700">điều khoản & điều kiện</span>
            </h4>
          </div>
          <Button
            isLoading={isLoading}
            isDisabled={isLoading}
            onClick={handlePlaceOrder}
            className="bg-black text-white"
          >
            Đặt hàng
          </Button>
        </section>
      </div>
    </section>
  );
}
// ...existing code...