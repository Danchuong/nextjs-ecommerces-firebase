import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import crypto from "crypto";

export const createCheckoutAndGetURL = async ({ uid, products, address }) => {
  //
  // --- 1. Generate checkoutId ---
  //
  const checkoutId = doc(collection(db, `ids`)).id;
  const ref = doc(db, `users/${uid}/checkout_sessions/${checkoutId}`);

  //
  // --- 2. Convert products → Stripe-style line_items (giống COD) ---
  //
  const line_items = products.map((item) => ({
    price_data: {
      currency: "vnd",
      product_data: {
        name: item?.product?.title ?? "",
        description: item?.product?.shortDescription ?? "",
        images: [
          item?.product?.featureImageURL ??
            `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,
        ],
        metadata: {
          productId: item?.id,
        },
      },
      unit_amount: Number(item?.product?.salePrice) * 100, // vnd → xu
    },
    quantity: item?.quantity ?? 1,
  }));

  //
  // --- 3. Generate orderCode (auto-increment counter) ---
  //
  const counterRef = doc(db, "counters/orders");
  let orderCode = 1;

  try {
    const snap = await getDoc(counterRef);
    orderCode = snap.exists() ? snap.data().lastOrderCode + 1 : 1;
    await setDoc(counterRef, { lastOrderCode: orderCode });
  } catch (err) {
    console.error("Order code error", err);
    throw new Error("ORDER_CODE_ERROR");
  }

  //
  // --- 4. Save checkout session (Stripe-style + orderCode) ---
  //
  await setDoc(ref, {
    id: checkoutId,
    uid,
    mode: "payment",
    payment_method_types: ["payos"],
    orderCode,
    line_items,
    metadata: {
      checkoutId,
      uid,
      address: JSON.stringify(address),
    },
    success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-success?checkout_id=${checkoutId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-failed?checkout_id=${checkoutId}`,
    status: "creating",
    createdAt: new Date().toISOString(),
  });

  //
  // --- 5. Calculate amount (Stripe style) ---
  //
  const amount = line_items.reduce(
    (sum, item) => sum + item.price_data.unit_amount * item.quantity / 100,
    0
  );

  const description = "Thanh toán đơn hàng";
  const returnUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-success?checkout_id=${checkoutId}`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-failed?checkout_id=${checkoutId}`;

  //
  // --- 6. Raw data for signature ---
  //
  const rawData =
    `amount=${amount}` +
    `&cancelUrl=${cancelUrl}` +
    `&description=${description}` +
    `&orderCode=${orderCode}` +
    `&returnUrl=${returnUrl}`;

  //
  // --- 7. Sign HMAC SHA256 ---
  //
  const signature = crypto
    .createHmac("sha256", process.env.NEXT_PUBLIC_PAYOS_CHECKSUM_KEY)
    .update(rawData)
    .digest("hex");

  //
  // --- 8. Call PayOS ---
  //
  const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
    method: "POST",
    headers: {
      "x-client-id": process.env.NEXT_PUBLIC_PAYOS_CLIENT_ID,
      "x-api-key": process.env.NEXT_PUBLIC_PAYOS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      cancelUrl,
      description,
      orderCode,
      returnUrl,
      signature,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    await updateDoc(ref, {
      status: "failed",
      error: data,
    });
    throw new Error("PayOS error: " + JSON.stringify(data));
  }

  const checkoutUrl = data?.data?.checkoutUrl;

  //
  // --- 9. Save checkoutUrl back to Firestore ---
  //
  await updateDoc(ref, {
    url: checkoutUrl,
    status: "ready",
  });

  return checkoutUrl;
};

export const createCheckoutCODAndGetId = async ({ uid, products, address }) => {
  const checkoutId = `cod_${doc(collection(db, `ids`)).id}`;

  const ref = doc(db, `users/${uid}/checkout_sessions_cod/${checkoutId}`);

  let line_items = [];

  products.forEach((item) => {
    line_items.push({
      price_data: {
        currency: "vnd",
        product_data: {
          name: item?.product?.title ?? "",
          description: item?.product?.shortDescription ?? "",
          images: [
            item?.product?.featureImageURL ??
              `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,
          ],
          metadata: {
            productId: item?.id,
          },
        },
        unit_amount: item?.product?.salePrice * 100,
      },
      quantity: item?.quantity ?? 1,
    });
  });

  await setDoc(ref, {
    id: checkoutId,
    line_items: line_items,
    metadata: {
      checkoutId: checkoutId,
      uid: uid,
      address: JSON.stringify(address),
    },
    createdAt: Timestamp.now(),
  });

  return checkoutId;
};
