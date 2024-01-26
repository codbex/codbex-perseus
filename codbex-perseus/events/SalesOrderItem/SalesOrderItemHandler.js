import * as SalesOrderDao from "../../gen/dao/SalesOrders/SalesOrder";
import * as SalesOrderItemDao from "../../gen/dao/SalesOrders/SalesOrderItem";

export const trigger = (event) => {
    const item = event.entity;

    const queryOptions = {
        SalesOrder: item.SalesOrder
    };
    const items = SalesOrderItemDao.list(queryOptions);

    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount;
        }
    }

    const header = SalesOrderDao.get(item.SalesOrder);
    header.Amount = amount;
    SalesOrderDao.update(header);
}