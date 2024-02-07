import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PaymentSalesInvoiceEntity {
    readonly Id: number;
    SalesInvoice?: number;
    Date?: Date;
    Valor?: Date;
    Amount?: number;
    Currency?: number;
    Reason?: string;
    Description?: string;
}

export interface PaymentSalesInvoiceCreateEntity {
    readonly SalesInvoice?: number;
    readonly Date?: Date;
    readonly Valor?: Date;
    readonly Amount?: number;
    readonly Currency?: number;
    readonly Reason?: string;
    readonly Description?: string;
}

export interface PaymentSalesInvoiceUpdateEntity extends PaymentSalesInvoiceCreateEntity {
    readonly Id: number;
}

export interface PaymentSalesInvoiceEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            SalesInvoice?: number | number[];
            Date?: Date | Date[];
            Valor?: Date | Date[];
            Amount?: number | number[];
            Currency?: number | number[];
            Reason?: string | string[];
            Description?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            SalesInvoice?: number | number[];
            Date?: Date | Date[];
            Valor?: Date | Date[];
            Amount?: number | number[];
            Currency?: number | number[];
            Reason?: string | string[];
            Description?: string | string[];
        };
        contains?: {
            Id?: number;
            SalesInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
        greaterThan?: {
            Id?: number;
            SalesInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            SalesInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
        lessThan?: {
            Id?: number;
            SalesInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            SalesInvoice?: number;
            Date?: Date;
            Valor?: Date;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
        };
    },
    $select?: (keyof PaymentSalesInvoiceEntity)[],
    $sort?: string | (keyof PaymentSalesInvoiceEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PaymentSalesInvoiceEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PaymentSalesInvoiceEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PaymentSalesInvoiceRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYMENTSALESINVOICE",
        properties: [
            {
                name: "Id",
                column: "PAYMENTSALESINVOICE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "SalesInvoice",
                column: "PAYMENTSALESINVOICE_SALESINVOICE",
                type: "INTEGER",
            },
            {
                name: "Date",
                column: "PAYMENTSALESINVOICE_DATE",
                type: "DATE",
            },
            {
                name: "Valor",
                column: "PAYMENTSALESINVOICE_VALOR",
                type: "DATE",
            },
            {
                name: "Amount",
                column: "PAYMENTSALESINVOICE_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Currency",
                column: "PAYMENTSALESINVOICE_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Reason",
                column: "PAYMENTSALESINVOICE_REASON",
                type: "VARCHAR",
            },
            {
                name: "Description",
                column: "PAYMENTSALESINVOICE_DESCRIPTION",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PaymentSalesInvoiceRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PaymentSalesInvoiceEntityOptions): PaymentSalesInvoiceEntity[] {
        return this.dao.list(options).map((e: PaymentSalesInvoiceEntity) => {
            EntityUtils.setDate(e, "Date");
            EntityUtils.setDate(e, "Valor");
            return e;
        });
    }

    public findById(id: number): PaymentSalesInvoiceEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        EntityUtils.setDate(entity, "Valor");
        return entity ?? undefined;
    }

    public create(entity: PaymentSalesInvoiceCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        EntityUtils.setLocalDate(entity, "Valor");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYMENTSALESINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTSALESINVOICE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PaymentSalesInvoiceUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        // EntityUtils.setLocalDate(entity, "Valor");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYMENTSALESINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTSALESINVOICE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PaymentSalesInvoiceCreateEntity | PaymentSalesInvoiceUpdateEntity): number {
        const id = (entity as PaymentSalesInvoiceUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PaymentSalesInvoiceUpdateEntity);
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
            table: "CODBEX_PAYMENTSALESINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTSALESINVOICE_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYMENTSALESINVOICE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }


    private async triggerEvent(data: PaymentSalesInvoiceEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Payments/PaymentSalesInvoice", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Payments/PaymentSalesInvoice").send(JSON.stringify(data));
    }
}