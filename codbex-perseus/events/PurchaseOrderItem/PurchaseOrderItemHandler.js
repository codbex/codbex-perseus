import * as PurchaseOrderDao from "../../codbex-perseus/gen/dao/PurchaseOrders/PurchaseOrder";
import * as PurchaseOrderItemDao from "../../gen/dao/PurchaseOrders/PurchaseOrderItem";

export const trigger = (event) => {
    const item = event.entity;

    const queryOptions = {
        PurchaseOrder: item.PurchaseOrder
    };
    const items = PurchaseOrderItemDao.list(queryOptions);

    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount;
        }
    }

    const header = PurchaseOrderDao.get(item.PurchaseOrder);
    header.Amount = amount;
    PurchaseOrderDao.update(header);
}