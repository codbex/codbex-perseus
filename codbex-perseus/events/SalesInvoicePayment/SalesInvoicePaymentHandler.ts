import { SalesInvoiceRepository } from "../../gen/dao/SalesInvoices/SalesInvoiceRepository";
import { SalesInvoicePaymentRepository } from "../../gen/dao/SalesInvoices/SalesInvoicePaymentRepository";

export const trigger = (event: any) => {
    const SalesInvoiceDao = new SalesInvoiceRepository();
    const SalesInvoicePaymentDao = new SalesInvoicePaymentRepository();
    const payment = event.entity;

    const payments = SalesInvoicePaymentDao.findAll({
        $filter: {
            equals: {
                SalesInvoice: payment.SalesInvoice
            }
        }
    });

    let amount = 0;
    for (let i = 0; i < payments.length; i++) {
        if (payments[i].Amount) {
            amount += payments[i].Amount!;
        }
    }

    const header = SalesInvoiceDao.findById(payment.SalesInvoice);
    if (amount > 0) {
        if (header!.Amount! > amount) {
            header!.Status = 5; // partially paid
        } else {
            header!.Status = 6; //  paid
        }
        SalesInvoiceDao.update(header!);
    }

}