import * as SalesInvoiceDao from "../../gen/dao/SalesInvoices/SalesInvoice";
import * as PaymentEntryDao from "../../gen/dao/Payments/PaymentEntry";
import * as CustomerDao from "../../gen/dao/Partners/Customer";
import * as CompanyDao from "../../gen/dao/Settings/Company";
import * as SalesInvoicePaymentDao from "../../gen/dao/SalesInvoices/SalesInvoicePayment";

export const trigger = (event) => {
    const payment = event.entity;

    console.log(JSON.stringify(payment));

    if (event.operation === "create") {
        const invoice = SalesInvoiceDao.get(payment.SalesInvoice);
        console.log(JSON.stringify(invoice));
        const customer = CustomerDao.get(invoice.Customer);
        console.log(JSON.stringify(customer));
        const company = CompanyDao.get(invoice.Company);
        console.log(JSON.stringify(company));

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
            'Direction': -1
        };
        const paymentEntryId = PaymentEntryDao.create(paymentEntry);
        console.log(JSON.stringify('>>>>>>>>>>>>>   ' + paymentEntryId));

        const salesInvoicePayment = {
            'SalesInvoice': invoice.Id,
            'PaymentEntry': paymentEntryId,
            'Amount': payment.Amount
        };
        SalesInvoicePaymentDao.create(salesInvoicePayment);
    }
}