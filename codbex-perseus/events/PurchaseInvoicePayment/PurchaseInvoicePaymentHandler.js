import * as PurchaseInvoiceDao from "../../gen/dao/PurchaseInvoices/PurchaseInvoice";
import * as PurchaseInvoicePaymentDao from "../../gen/dao/PurchaseInvoices/PurchaseInvoicePayment";

export const trigger = (event) => {
    const payment = event.entity;

    const queryOptions = {
        PurchaseInvoice: payment.PurchaseInvoice
    };
    const payments = PurchaseInvoicePaymentDao.list(queryOptions);

    let amount = 0;
    for (let i = 0; i < payments.length; i++) {
        if (payments[i].Amount) {
            amount += payments[i].Amount;
        }
    }

    const header = PurchaseInvoiceDao.get(payment.PurchaseInvoice);
    if (amount > 0) {
        if (header.Amount > amount) {
            header.Status = 5; // partially paid
        } else {
            header.Status = 6; // fully paid
        }
        PurchaseInvoiceDao.update(header);
    }

}