import { SalesInvoiceRepository } from "../../gen/dao/SalesInvoices/SalesInvoiceRepository";
import { SalesInvoiceItemRepository } from "../../gen/dao/SalesInvoices/SalesInvoiceItemRepository";

export const trigger = (event: any) => {
    const SalesInvoiceDao = new SalesInvoiceRepository();
    const SalesInvoiceItemDao = new SalesInvoiceItemRepository();
    const item = event.entity;

    const items = SalesInvoiceItemDao.findAll({
        $filter: {
            equals: {
                SalesInvoice: item.SalesInvoice
            }
        }
    });

    let amount = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Amount) {
            amount += items[i].Amount!;
        }
    }

    const header = SalesInvoiceDao.findById(item.SalesInvoice);
    header!.Amount = amount;
    SalesInvoiceDao.update(header!);
}