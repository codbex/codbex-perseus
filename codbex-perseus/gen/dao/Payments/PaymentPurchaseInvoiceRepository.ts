import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PaymentPurchaseInvoiceEntity {
    readonly Id: number;
    PurchaseInvoice?: number;
    Date?: Date;
    Valor?: Date;
    Amount?: number;
    Currency?: number;
    Reason?: string;
    Description?: string;
}

export interface PaymentPurchaseInvoiceCreateEntity {
    readonly PurchaseInvoice?: number;
    readonly Date?: Date;
    readonly Valor?: Date;
    readonly Amount?: number;
    readonly Currency?: number;
    readonly Reason?: string;
    readonly Description?: string;
}

export interface PaymentPurchaseInvoiceUpdateEntity extends PaymentPurchaseInvoiceCreateEntity {
    readonly Id: number;
}

export interface PaymentPurchaseInvoiceEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            PurchaseInvoice?: number | number[];
            Date?: Date | Date[];
            Valor?: Date | Date[];
            Amount?: number | number[];
            Currency?: number | number[];
            Reason?: string | string[];
            Description?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            PurchaseInvoice?: number | number[];
            Date?: Date | Date[];
            Valor?: Date | Date[];
            Amount?: number | number[];
            Currency?: number | number[];
            Reason?: string | string[];
            Description?: string | string[];
        };
        contains?: {
            Id?: number;
            PurchaseInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
        greaterThan?: {
            Id?: number;
            PurchaseInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            PurchaseInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
        lessThan?: {
            Id?: number;
            PurchaseInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            PurchaseInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
    },
    $select?: (keyof PaymentPurchaseInvoiceEntity)[],
    $sort?: string | (keyof PaymentPurchaseInvoiceEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PaymentPurchaseInvoiceEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PaymentPurchaseInvoiceEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PaymentPurchaseInvoiceRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYMENTPURCHASEINVOICE",
        properties: [
            {
                name: "Id",
                column: "PAYMENTPURCHASEINVOICE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "PurchaseInvoice",
                column: "PAYMENTPURCHASEINVOICE_PURCHASEINVOICE",
                type: "INTEGER",
            },
            {
                name: "Date",
                column: "PAYMENTPURCHASEINVOICE_DATE",
                type: "DATE",
            },
            {
                name: "Valor",
                column: "PAYMENTPURCHASEINVOICE_VALOR",
                type: "DATE",
            },
            {
                name: "Amount",
                column: "PAYMENTPURCHASEINVOICE_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Currency",
                column: "PAYMENTPURCHASEINVOICE_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Reason",
                column: "PAYMENTPURCHASEINVOICE_REASON",
                type: "VARCHAR",
            },
            {
                name: "Description",
                column: "PAYMENTPURCHASEINVOICE_DESCRIPTION",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PaymentPurchaseInvoiceRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PaymentPurchaseInvoiceEntityOptions): PaymentPurchaseInvoiceEntity[] {
        return this.dao.list(options).map((e: PaymentPurchaseInvoiceEntity) => {
            EntityUtils.setDate(e, "Date");
            EntityUtils.setDate(e, "Valor");
            return e;
        });
    }

    public findById(id: number): PaymentPurchaseInvoiceEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        EntityUtils.setDate(entity, "Valor");
        return entity ?? undefined;
    }

    public create(entity: PaymentPurchaseInvoiceCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        EntityUtils.setLocalDate(entity, "Valor");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYMENTPURCHASEINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTPURCHASEINVOICE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PaymentPurchaseInvoiceUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        // EntityUtils.setLocalDate(entity, "Valor");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYMENTPURCHASEINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTPURCHASEINVOICE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PaymentPurchaseInvoiceCreateEntity | PaymentPurchaseInvoiceUpdateEntity): number {
        const id = (entity as PaymentPurchaseInvoiceUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PaymentPurchaseInvoiceUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_PAYMENTPURCHASEINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTPURCHASEINVOICE_ID",
                value: id
            }
        });
    }

    public count(options?: PaymentPurchaseInvoiceEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYMENTPURCHASEINVOICE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PaymentPurchaseInvoiceEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Payments-PaymentPurchaseInvoice", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Payments/PaymentPurchaseInvoice").send(JSON.stringify(data));
    }
}