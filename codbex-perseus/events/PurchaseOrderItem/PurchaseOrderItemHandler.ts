import { PurchaseOrderRepository } from "../../gen/dao/PurchaseOrders/PurchaseOrderRepository";
import { PurchaseOrderItemRepository } from "../../gen/dao/PurchaseOrders/PurchaseOrderItemRepository";

export const trigger = (event: any) => {
    const PurchaseOrderDao = new PurchaseOrderRepository();
    const PurchaseOrderItemDao = new PurchaseOrderItemRepository();
    const item = event.entity;

    const items = PurchaseOrderItemDao.findAll({
        $filter: {
            equals: {
                PurchaseOrder: item.PurchaseOrder
            }
        }
    });

    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i]!.Amount!;
        }
    }

    const header = PurchaseOrderDao.get(item.PurchaseOrder);
    header.Amount = amount;
    PurchaseOrderDao.update(header);
}