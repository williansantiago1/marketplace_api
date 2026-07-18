import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { cartRoutes } from "./cart.routes";
import { categoryRoutes } from "./category.routes";
import { couponRoutes } from "./coupon.routes";
import { orderRoutes } from "./order.routes";
import { paymentRoutes } from "./payment.routes";
import { productRoutes } from "./product.routes";
import { reviewRoutes } from "./review.routes";
import { storeRoutes } from "./store.routes";

export const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/stores", storeRoutes);
apiRoutes.use("/categories", categoryRoutes);
apiRoutes.use("/products", productRoutes);
apiRoutes.use("/cart", cartRoutes);
apiRoutes.use("/orders", orderRoutes);
apiRoutes.use("/payments", paymentRoutes);
apiRoutes.use("/reviews", reviewRoutes);
apiRoutes.use("/coupons", couponRoutes);
