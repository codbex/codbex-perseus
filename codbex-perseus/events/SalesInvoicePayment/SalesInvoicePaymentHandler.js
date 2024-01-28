import * as SalesInvoiceDao from "../../gen/dao/SalesInvoices/SalesInvoice";
import * as SalesInvoicePaymentDao from "../../gen/dao/SalesInvoices/SalesInvoicePayment";

export const trigger = (event) => {
    const payment = event.entity;

    const queryOptions = {
        SalesInvoice: payment.SalesInvoice
    };
    const payments = SalesInvoicePaymentDao.list(queryOptions);

    let amount = 0;
    for (let i = 0; i < payments.length; i++) {
        if (payments[i].Amount) {
            amount += payments[i].Amount;
        }
    }

    const header = SalesInvoiceDao.get(payment.SalesInvoice);
    if (amount > 0) {
        if (header.Amount > amount) {
            header.Status = 5; // partially paid
        } else {
            header.Status = 6; //  paid
        }
        SalesInvoiceDao.update(header);
    }

}