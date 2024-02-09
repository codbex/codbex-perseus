import { PurchaseInvoiceRepository } from "../../gen/dao/PurchaseInvoices/PurchaseInvoiceRepository";
import { PurchaseInvoicePaymentRepository } from "../../gen/dao/PurchaseInvoices/PurchaseInvoicePaymentRepository";

export const trigger = (event: any) => {
    const PurchaseInvoiceDao = new PurchaseInvoiceRepository();
    const PurchaseInvoicePaymentDao = new PurchaseInvoicePaymentRepository();
    const payment = event.entity;

    const payments = PurchaseInvoicePaymentDao.findAll({
        $filter: {
            equals: {
                PurchaseInvoice: payment.PurchaseInvoice
            }
        }
    });

    let amount = 0;
    for (let i = 0; i < payments.length; i++) {
        if (payments[i].Amount) {
            amount += payments[i].Amount!;
        }
    }

    const header = PurchaseInvoiceDao.findById(payment.PurchaseInvoice);
    if (amount > 0) {
        if (header!.Amount! > amount) {
            header!.Status = 5; // partially paid
        } else {
            header!.Status = 6; // fully paid
        }
        PurchaseInvoiceDao.update(header!);
    }

}