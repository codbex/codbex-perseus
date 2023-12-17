exports.trigger = function (event) {
    const PurchaseInvoiceDao = require("codbex-perseus/gen/dao/PurchaseInvoices/PurchaseInvoice");
    const PurchaseInvoiceItemDao = require("codbex-perseus/gen/dao/PurchaseInvoices/PurchaseInvoiceItem");

    let item = event.entity;

    let queryOptions = {};
    queryOptions['PurchaseInvoice'] = item.PurchaseInvoice;
    let items = PurchaseInvoiceItemDao.list(queryOptions);

    var amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount;
        }
    }

    let header = PurchaseInvoiceDao.get(item.PurchaseInvoice);
    header.Amount = amount;
    PurchaseInvoiceDao.update(header);
}