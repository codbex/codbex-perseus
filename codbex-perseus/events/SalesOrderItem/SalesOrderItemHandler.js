exports.trigger = function (event) {
    const SalesOrderDao = require("codbex-perseus/gen/dao/SalesOrders/SalesOrder");
    const SalesOrderItemDao = require("codbex-perseus/gen/dao/SalesOrders/SalesOrderItem");

    let item = event.entity;

    let queryOptions = {};
    queryOptions['SalesOrder'] = item.SalesOrder;
    let items = SalesOrderItemDao.list(queryOptions);

    var amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount;
        }
    }

    let header = SalesOrderDao.get(item.SalesOrder);
    header.Amount = amount;
    SalesOrderDao.update(header);
}