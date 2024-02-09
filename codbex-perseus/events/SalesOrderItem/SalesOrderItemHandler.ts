import { SalesOrderRepository } from "../../gen/dao/SalesOrders/SalesOrderRepository";
import { SalesOrderItemRepository } from "../../gen/dao/SalesOrders/SalesOrderItemRepository";

export const trigger = (event: any) => {
    const SalesOrderDao = new SalesOrderRepository();
    const SalesOrderItemDao = new SalesOrderItemRepository();
    const item = event.entity;

    const items = SalesOrderItemDao.findAll({
        $filter: {
            equals: {
                SalesOrder: item.SalesOrder
            }
        }
    });

    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount!;
        }
    }

    const header = SalesOrderDao.findById(item.SalesOrder);
    header!.Amount = amount;
    SalesOrderDao.update(header!);
}