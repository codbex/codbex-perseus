import * as PurchaseInvoiceDao from "../../gen/dao/PurchaseInvoices/PurchaseInvoice";
import * as PaymentEntryDao from "../../gen/dao/Payments/PaymentEntry";
import * as SupplierDao from "../../gen/dao/Partners/Supplier";
import * as CompanyDao from "../../gen/dao/Settings/Company";
import * as PurchaseInvoicePaymentDao from "../../gen/dao/PurchaseInvoices/PurchaseInvoicePayment";

export const trigger = (event) => {
    const payment = event.entity;

    if (event.operation === "create") {
        const invoice = PurchaseInvoiceDao.get(payment.PurchaseInvoice);
        const supplier = SupplierDao.get(invoice.Supplier);
        const company = CompanyDao.get(invoice.Company);

        const paymentEntry = {
            'Date': payment.Date,
            'Valor': payment.Valor,
            'Company': company.Id,
            'CompanyIBAN': company.IBAN,
            'CounterpartyIBAN': supplier.IBAN,
            'CounterpartyName': supplier.Name,
            'Amount': payment.Amount,
            'Currency': payment.Currency,
            'Reason': payment.Reason,
            'Description': payment.Description,
            'Direction': -1
        };
        const paymentEntryId = PaymentEntryDao.create(paymentEntry);

        const purchaseInvoicePayment = {
            'PurchaseInvoice': invoice.Id,
            'PaymentEntry': paymentEntryId,
            'Amount': payment.Amount
        };
        PurchaseInvoicePaymentDao.create(purchaseInvoicePayment);
    }
}