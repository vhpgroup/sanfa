import { productionSizes } from "@/lib/constants";
import type { ProductionEntry, ProductionOrder, ProductionSize } from "@/types/production";

export type SummaryTotals = {
  orderQuantity: number;
  orderedBySize: Record<ProductionSize, number>;
  deliveredTotal: number;
  deliveredBySize: Record<ProductionSize, number>;
  completed: number;
  completedBySize: Record<ProductionSize, number>;
  remaining: number;
  remainingBySize: Record<ProductionSize, number>;
  sizePlan: ProductionOrder["sizePlan"];
  completionRate: number;
};

export type DashboardStats = {
  totalOrders: number;
  totalDelivery: number;
  totalCompleted: number;
  totalRemaining: number;
  completionRate: number;
};

function emptySizeTotals() {
  return productionSizes.reduce(
    (acc, size) => ({ ...acc, [size]: 0 }),
    {} as Record<ProductionSize, number>,
  );
}

export function getOrderTotalDelivery(order: ProductionOrder) {
  return order.orderQuantity;
}

export function getOrderDeliveryBySize(order: ProductionOrder) {
  return productionSizes.reduce(
    (acc, size) => ({ ...acc, [size]: order.deliveryPlan?.[size] ?? 0 }),
    {} as Record<ProductionSize, number>,
  );
}

export function getOrderDeliveredTotal(order: ProductionOrder) {
  return productionSizes.reduce((sum, size) => sum + (order.deliveryPlan?.[size] ?? 0), 0);
}

export function getOrderCompletedBySize(order: ProductionOrder, productionInputs: ProductionEntry[]) {
  const inputTotals = productionInputs
    .filter((input) => input.orderId === order.code)
    .reduce(
      (acc, input) => ({
        ...acc,
        [input.size]: acc[input.size] + input.quantity,
      }),
      emptySizeTotals(),
    );

  return productionSizes.reduce(
    (acc, size) => ({
      ...acc,
      [size]: inputTotals[size] + (order.producedPlan?.[size] ?? 0),
    }),
    emptySizeTotals(),
  );
}

export function getOrderCompleted(order: ProductionOrder, productionInputs: ProductionEntry[]) {
  const completedBySize = getOrderCompletedBySize(order, productionInputs);
  return productionSizes.reduce((sum, size) => sum + completedBySize[size], 0);
}

export function getOrderRemainingBySize(order: ProductionOrder) {
  const deliveredBySize = getOrderDeliveryBySize(order);

  return productionSizes.reduce(
    (acc, size) => ({
      ...acc,
      [size]: order.sizePlan[size] - deliveredBySize[size],
    }),
    {} as Record<ProductionSize, number>,
  );
}

export function getOrderRemaining(order: ProductionOrder) {
  return getOrderTotalDelivery(order) - getOrderDeliveredTotal(order);
}

export function getOrderCompletionRate(order: ProductionOrder, productionInputs: ProductionEntry[]) {
  const totalDelivery = getOrderTotalDelivery(order);
  return totalDelivery > 0 ? (getOrderCompleted(order, productionInputs) / totalDelivery) * 100 : 0;
}

export function getSummaryTotals(orders: ProductionOrder[], productionInputs: ProductionEntry[]): SummaryTotals {
  const totals = orders.reduce(
    (acc, order) => {
      const orderedTotal = getOrderTotalDelivery(order);
      const completed = getOrderCompleted(order, productionInputs);
      const deliveredTotal = getOrderDeliveredTotal(order);
      const completedBySize = getOrderCompletedBySize(order, productionInputs);
      const deliveredBySize = getOrderDeliveryBySize(order);
      const remainingBySize = getOrderRemainingBySize(order);

      return {
        orderQuantity: acc.orderQuantity + orderedTotal,
        orderedBySize: productionSizes.reduce(
          (sizeAcc, size) => ({
            ...sizeAcc,
            [size]: sizeAcc[size] + order.sizePlan[size],
          }),
          acc.orderedBySize,
        ),
        deliveredTotal: acc.deliveredTotal + deliveredTotal,
        deliveredBySize: productionSizes.reduce(
          (sizeAcc, size) => ({
            ...sizeAcc,
            [size]: sizeAcc[size] + deliveredBySize[size],
          }),
          acc.deliveredBySize,
        ),
        completed: acc.completed + completed,
        completedBySize: productionSizes.reduce(
          (sizeAcc, size) => ({
            ...sizeAcc,
            [size]: sizeAcc[size] + completedBySize[size],
          }),
          acc.completedBySize,
        ),
        remaining: acc.remaining + (orderedTotal - deliveredTotal),
        remainingBySize: productionSizes.reduce(
          (sizeAcc, size) => ({
            ...sizeAcc,
            [size]: sizeAcc[size] + remainingBySize[size],
          }),
          acc.remainingBySize,
        ),
        sizePlan: productionSizes.reduce(
          (sizeAcc, size) => ({
            ...sizeAcc,
            [size]: sizeAcc[size] + order.sizePlan[size],
          }),
          acc.sizePlan,
        ),
      };
    },
    {
      orderQuantity: 0,
      orderedBySize: emptySizeTotals(),
      deliveredTotal: 0,
      deliveredBySize: emptySizeTotals(),
      completed: 0,
      completedBySize: emptySizeTotals(),
      remaining: 0,
      remainingBySize: emptySizeTotals(),
      sizePlan: emptySizeTotals(),
    },
  );

  return {
    ...totals,
    completionRate: totals.orderQuantity > 0 ? (totals.completed / totals.orderQuantity) * 100 : 0,
  };
}

export function getDashboardStats(orders: ProductionOrder[], productionInputs: ProductionEntry[]): DashboardStats {
  const totals = getSummaryTotals(orders, productionInputs);

  return {
    totalOrders: orders.length,
    totalDelivery: totals.orderQuantity,
    totalCompleted: totals.completed,
    totalRemaining: totals.remaining,
    completionRate: totals.completionRate,
  };
}
