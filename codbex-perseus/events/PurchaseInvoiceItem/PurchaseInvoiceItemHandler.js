import * as PurchaseInvoiceDao from "../../gen/dao/PurchaseInvoices/PurchaseInvoice";
import * as PurchaseInvoiceItemDao from "../../gen/dao/PurchaseInvoices/PurchaseInvoiceItem";

export const trigger = (event) => {
    const item = event.entity;

    const queryOptions = {
        PurchaseInvoice: item.PurchaseInvoice
    };
    const items = PurchaseInvoiceItemDao.list(queryOptions);

    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount;
        }
    }

    const header = PurchaseInvoiceDao.get(item.PurchaseInvoice);
    header.Amount = amount;

    PurchaseInvoiceDao.update(header);
}