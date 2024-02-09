import { PurchaseInvoiceRepository } from "../../gen/dao/PurchaseInvoices/PurchaseInvoiceRepository";
import { PurchaseInvoiceItemRepository } from "../../gen/dao/PurchaseInvoices/PurchaseInvoiceItemRepository";

export const trigger = (event: any) => {
    const PurchaseInvoiceDao = new PurchaseInvoiceRepository();
    const PurchaseInvoiceItemDao = new PurchaseInvoiceItemRepository();
    const item = event.entity;

    const items = PurchaseInvoiceItemDao.findAll({
        $filter: {
            equals: {
                PurchaseInvoice: item.PurchaseInvoice
            }
        }
    });

    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i]!.Amount!;
        }
    }

    const header = PurchaseInvoiceDao.findById(item.PurchaseInvoice);
    header!.Amount = amount;

    PurchaseInvoiceDao.update(header!);
}