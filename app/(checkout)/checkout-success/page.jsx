import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { admin, adminDB } from "@/lib/firebase_admin";
import Link from "next/link";
import SuccessMessage from "./components/SuccessMessage";

// ---------------------------------------------
// 1. Fetch checkout session
// ---------------------------------------------
const fetchCheckout = async (checkoutId) => {
  const list = await adminDB
    .collectionGroup("checkout_sessions")
    .where("id", "==", checkoutId)
    .get();

  if (list.docs.length === 0) {
    throw new Error("ID thanh toán không hợp lệ");
  }

  return { id: list.docs[0].id, ref: list.docs[0].ref, ...list.docs[0].data() };
};

// ---------------------------------------------
// 2. Verify payment from PayOS via orderCode
// ---------------------------------------------
const fetchPayOSPayment = async (orderCode) => {
  
  const res = await fetch(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}`, {
        method: "GET",
        headers: {
          "x-client-id": process.env.NEXT_PUBLIC_PAYOS_CLIENT_ID,
          "x-api-key": process.env.NEXT_PUBLIC_PAYOS_API_KEY,
          "Content-Type": "application/json",
        },
      });

  

  const data = await res.json();


  if (!res.ok) {
    throw new Error("PayOS error: " + JSON.stringify(data));
  }

  // Optional: enforce "PAID"
  if (data?.data?.status !== "PAID") {
    throw new Error("Thanh toán chưa hoàn tất");
  }

  return data.data; 
};

// ---------------------------------------------
// 3. Process order — chuẩn, đúng thứ tự bạn yêu cầu
// ---------------------------------------------
const processOrder = async ({ checkout, payos }) => {
  const orderRef = adminDB.doc(`orders/${checkout?.id}`);
  const order = await orderRef.get();

  // Nếu đã có rồi thì không xử lý lại
  if (order.exists) {
    return false;
  }

  const uid = checkout?.metadata?.uid;

  // Tính amount chính xác từ line_items (stripe style)
  const amount = checkout?.line_items?.reduce((prev, curr) => {
    return prev + curr?.price_data?.unit_amount * curr?.quantity;
  }, 0);

  // Ghi đơn hàng
  await orderRef.set({
    checkout,
    payment: {
      ...payos,
      amount,
      status: payos?.status,
    },
    uid,
    id: checkout?.id,
    paymentMode: "prepaid",
    timestampCreate: admin.firestore.Timestamp.now(),
  });

  // Convert line_items → product list
  const productList = checkout?.line_items?.map((item) => ({
    productId: item?.price_data?.product_data?.metadata?.productId,
    quantity: item?.quantity,
  }));

  // Xoá sản phẩm khỏi giỏ hàng
  const userRef = adminDB.doc(`users/${uid}`);
  const user = await userRef.get();

  const purchasedIds = productList.map((p) => p.productId);

  const newCartList = (user?.data()?.carts ?? []).filter(
    (cartItem) => !purchasedIds.includes(cartItem?.id)
  );

  await userRef.set({ carts: newCartList }, { merge: true });

  // Update product stats
  const batch = adminDB.batch();
  productList.forEach((item) => {
    batch.update(adminDB.doc(`products/${item.productId}`), {
      orders: admin.firestore.FieldValue.increment(item.quantity),
    });
  });

  await batch.commit();

  return true;
};

// ---------------------------------------------
// 4. PAGE
// ---------------------------------------------
export default async function Page({ searchParams }) {
  const { checkout_id } = searchParams;

  // STEP 1: fetch checkout session
  const checkout = await fetchCheckout(checkout_id);

  // STEP 2: verify with PayOS
  const payosPayment = await fetchPayOSPayment(checkout.orderCode);

  // STEP 3: write order into Firestore
  await processOrder({ checkout, payos: payosPayment });

  return (
    <main>
      <Header />
      <SuccessMessage />

      <section className="min-h-screen flex flex-col gap-3 justify-center items-center">
        <div className="flex justify-center w-full">
          <img
            src="/svgs/Mobile payments-rafiki.svg"
            className="h-48"
            alt="Hình minh họa thanh toán"
          />
        </div>

        <h1 className="text-2xl font-semibold text-green">
          Đơn hàng của bạn đã được{" "}
          <span className="font-bold text-green-600">đặt thành công</span>
        </h1>

        <div className="flex items-center gap-4 text-sm">
          <Link href={"/account"}>
            <button className="text-blue-600 border border-blue-600 px-5 py-2 rounded-lg bg-white">
              Đi tới trang đơn hàng
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

