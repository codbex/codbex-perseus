import * as SalesInvoiceDao from "../../gen/dao/SalesInvoices/SalesInvoice";
import * as SalesInvoiceItemDao from "../../gen/dao/SalesInvoices/SalesInvoiceItem";

export const trigger = (event) => {
    const item = event.entity;

    const queryOptions = {
        SalesInvoice: item.SalesInvoice
    };
    const items = SalesInvoiceItemDao.list(queryOptions);

    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount;
        }
    }

    const header = SalesInvoiceDao.get(item.SalesInvoice);
    header.Amount = amount;
    SalesInvoiceDao.update(header);
}