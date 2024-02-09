import { PurchaseInvoiceRepository } from "../../gen/dao/PurchaseInvoices/PurchaseInvoiceRepository";
import { PaymentEntryRepository } from "../../gen/dao/Payments/PaymentEntryRepository";
import { SupplierRepository } from "../../gen/dao/Partners/SupplierRepository";
import { CompanyRepository } from "../../gen/dao/Settings/CompanyRepository";
import { PurchaseInvoicePaymentRepository } from "../../gen/dao/PurchaseInvoices/PurchaseInvoicePaymentRepository";

export const trigger = (event: any) => {
    const PurchaseInvoiceDao = new PurchaseInvoiceRepository();
    const PaymentEntryDao = new PaymentEntryRepository();
    const SupplierDao = new SupplierRepository();
    const CompanyDao = new CompanyRepository();
    const PurchaseInvoicePaymentDao = new PurchaseInvoicePaymentRepository();
    const payment = event.entity;

    if (event.operation === "create") {
        const invoice = PurchaseInvoiceDao.findById(payment.PurchaseInvoice);
        const supplier = SupplierDao.findById(invoice!.Supplier!);
        const company = CompanyDao.findById(invoice!.Company!);

        const paymentEntry = {
            'Date': payment.Date,
            'Valor': payment.Valor,
            'Company': company!.Id,
            'CompanyIBAN': company!.IBAN,
            'CounterpartyIBAN': supplier!.IBAN,
            'CounterpartyName': supplier!.Name,
            'Amount': payment.Amount,
            'Currency': payment.Currency,
            'Reason': payment.Reason,
            'Description': payment.Description,
            'Direction': -1
        };
        const paymentEntryId = PaymentEntryDao.create(paymentEntry);

        const purchaseInvoicePayment = {
            'PurchaseInvoice': invoice!.Id,
            'PaymentEntry': paymentEntryId,
            'Amount': payment.Amount
        };
        PurchaseInvoicePaymentDao.create(purchaseInvoicePayment);
    }
}