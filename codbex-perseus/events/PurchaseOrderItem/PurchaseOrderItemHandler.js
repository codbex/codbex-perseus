exports.trigger = function (event) {
    const PurchaseOrderDao = require("codbex-perseus/gen/dao/PurchaseOrders/PurchaseOrder");
    const PurchaseOrderItemDao = require("codbex-perseus/gen/dao/PurchaseOrders/PurchaseOrderItem");

    let item = event.entity;

    let queryOptions = {};
    queryOptions['PurchaseOrder'] = item.PurchaseOrder;
    let items = PurchaseOrderItemDao.list(queryOptions);

    var amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount;
        }
    }

    let header = PurchaseOrderDao.get(item.PurchaseOrder);
    header.Amount = amount;
    PurchaseOrderDao.update(header);
}