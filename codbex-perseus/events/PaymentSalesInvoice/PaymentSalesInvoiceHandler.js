import * as SalesInvoiceDao from "../../gen/dao/SalesInvoices/SalesInvoice";
import * as PaymentEntryDao from "../../gen/dao/Payments/PaymentEntry";
import * as CustomerDao from "../../gen/dao/Partners/Customer";
import * as CompanyDao from "../../gen/dao/Settings/Company";
import * as SalesInvoicePaymentDao from "../../gen/dao/SalesInvoices/SalesInvoicePayment";

export const trigger = (event) => {
    const payment = event.entity;

    if (event.operation === "create") {
        const invoice = SalesInvoiceDao.get(payment.SalesInvoice);
        const customer = CustomerDao.get(invoice.Customer);
        const company = CompanyDao.get(invoice.Company);

        const paymentEntry = {
            'Date': payment.Date,
            'Valor': payment.Valor,
            'Company': company.Id,
            'CompanyIBAN': company.IBAN,
            'CounterpartyIBAN': customer.IBAN,
            'CounterpartyName': customer.Name,
            'Amount': payment.Amount,
            'Currency': payment.Currency,
            'Reason': payment.Reason,
            'Description': payment.Description,
            'Direction': 1
        };
        const paymentEntryId = PaymentEntryDao.create(paymentEntry);

        const salesInvoicePayment = {
            'SalesInvoice': invoice.Id,
            'PaymentEntry': paymentEntryId,
            'Amount': payment.Amount
        };
        SalesInvoicePaymentDao.create(salesInvoicePayment);
    }
}