exports.onMessage = function (message) {
    const SalesInvoiceDao = require("codbex-perseus/gen/dao/SalesInvoices/SalesInvoice");
    const SalesInvoiceItemDao = require("codbex-perseus/gen/dao/SalesInvoices/SalesInvoiceItem");

    let item = SalesInvoiceItemDao.get(JSON.parse(message).key.value);

    let queryOptions = {};
    queryOptions['SalesInvoice'] = item.SalesInvoice;
    let items = SalesInvoiceItemDao.list(queryOptions);

    var amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount;
        }
    }

    let header = SalesInvoiceDao.get(item.SalesInvoice);
    header.Amount = amount;
    SalesInvoiceDao.update(header);
}

exports.onError = function (error) {
    console.error(error);
}