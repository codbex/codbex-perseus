import { SalesInvoiceRepository } from "../../gen/dao/SalesInvoices/SalesInvoiceRepository";
import { PaymentEntryRepository } from "../../gen/dao/Payments/PaymentEntryRepository";
import { CustomerRepository } from "../../gen/dao/Partners/CustomerRepository";
import { CompanyRepository } from "../../gen/dao/Settings/CompanyRepository";
import { SalesInvoicePaymentRepository } from "../../gen/dao/SalesInvoices/SalesInvoicePaymentRepository";

export const trigger = (event: any) => {
    const SalesInvoiceDao = new SalesInvoiceRepository();
    const PaymentEntryDao = new PaymentEntryRepository();
    const CustomerDao = new CustomerRepository();
    const CompanyDao = new CompanyRepository();
    const SalesInvoicePaymentDao = new SalesInvoicePaymentRepository();
    const payment = event.entity;

    if (event.operation === "create") {
        const invoice = SalesInvoiceDao.findById(payment.SalesInvoice);
        const customer = CustomerDao.findById(invoice!.Customer!);
        const company = CompanyDao.findById(invoice!.Company!);

        const paymentEntry = {
            'Date': payment.Date,
            'Valor': payment.Valor,
            'Company': company!.Id,
            'CompanyIBAN': company!.IBAN,
            'CounterpartyIBAN': customer!.IBAN,
            'CounterpartyName': customer!.Name,
            'Amount': payment.Amount,
            'Currency': payment.Currency,
            'Reason': payment.Reason,
            'Description': payment.Description,
            'Direction': 1
        };
        const paymentEntryId = PaymentEntryDao.create(paymentEntry);

        const salesInvoicePayment = {
            'SalesInvoice': invoice!.Id,
            'PaymentEntry': paymentEntryId,
            'Amount': payment.Amount
        };
        SalesInvoicePaymentDao.create(salesInvoicePayment);
    }
}