import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface SalesInvoiceEntity {
    readonly Id: number;
    Name?: string;
    Number?: string;
    Date?: Date;
    Due?: Date;
    Customer?: number;
    SalesOrder?: number;
    Amount?: number;
    Currency?: number;
    VAT?: number;
    Discount?: number;
    Taxes?: number;
    Total?: number;
    Conditions?: string;
    PaymentMethod?: string;
    SentMethod?: string;
    Status?: number;
    Company?: number;
}

export interface SalesInvoiceCreateEntity {
    readonly Name?: string;
    readonly Number?: string;
    readonly Date?: Date;
    readonly Due?: Date;
    readonly Customer?: number;
    readonly SalesOrder?: number;
    readonly Amount?: number;
    readonly Currency?: number;
    readonly Discount?: number;
    readonly Taxes?: number;
    readonly Conditions?: string;
    readonly PaymentMethod?: string;
    readonly SentMethod?: string;
    readonly Status?: number;
    readonly Company?: number;
}

export interface SalesInvoiceUpdateEntity extends SalesInvoiceCreateEntity {
    readonly Id: number;
}

export interface SalesInvoiceEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Number?: string | string[];
            Date?: Date | Date[];
            Due?: Date | Date[];
            Customer?: number | number[];
            SalesOrder?: number | number[];
            Amount?: number | number[];
            Currency?: number | number[];
            VAT?: number | number[];
            Discount?: number | number[];
            Taxes?: number | number[];
            Total?: number | number[];
            Conditions?: string | string[];
            PaymentMethod?: string | string[];
            SentMethod?: string | string[];
            Status?: number | number[];
            Company?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Number?: string | string[];
            Date?: Date | Date[];
            Due?: Date | Date[];
            Customer?: number | number[];
            SalesOrder?: number | number[];
            Amount?: number | number[];
            Currency?: number | number[];
            VAT?: number | number[];
            Discount?: number | number[];
            Taxes?: number | number[];
            Total?: number | number[];
            Conditions?: string | string[];
            PaymentMethod?: string | string[];
            SentMethod?: string | string[];
            Status?: number | number[];
            Company?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Due?: Date;
            Customer?: number;
            SalesOrder?: number;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Discount?: number;
            Taxes?: number;
            Total?: number;
            Conditions?: string;
            PaymentMethod?: string;
            SentMethod?: string;
            Status?: number;
            Company?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Due?: Date;
            Customer?: number;
            SalesOrder?: number;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Discount?: number;
            Taxes?: number;
            Total?: number;
            Conditions?: string;
            PaymentMethod?: string;
            SentMethod?: string;
            Status?: number;
            Company?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Due?: Date;
            Customer?: number;
            SalesOrder?: number;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Discount?: number;
            Taxes?: number;
            Total?: number;
            Conditions?: string;
            PaymentMethod?: string;
            SentMethod?: string;
            Status?: number;
            Company?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Due?: Date;
            Customer?: number;
            SalesOrder?: number;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Discount?: number;
            Taxes?: number;
            Total?: number;
            Conditions?: string;
            PaymentMethod?: string;
            SentMethod?: string;
            Status?: number;
            Company?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Due?: Date;
            Customer?: number;
            SalesOrder?: number;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Discount?: number;
            Taxes?: number;
            Total?: number;
            Conditions?: string;
            PaymentMethod?: string;
            SentMethod?: string;
            Status?: number;
            Company?: number;
        };
    },
    $select?: (keyof SalesInvoiceEntity)[],
    $sort?: string | (keyof SalesInvoiceEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesInvoiceEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesInvoiceEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalesInvoiceRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESINVOICE",
        properties: [
            {
                name: "Id",
                column: "SALESINVOICE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "SALESINVOICE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Number",
                column: "SALESINVOICE_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "SALESINVOICE_DATE",
                type: "DATE",
            },
            {
                name: "Due",
                column: "SALESINVOICE_DUE",
                type: "DATE",
            },
            {
                name: "Customer",
                column: "SALESINVOICE_CUSTOMER",
                type: "INTEGER",
            },
            {
                name: "SalesOrder",
                column: "SALESINVOICE_SALESORDER",
                type: "INTEGER",
            },
            {
                name: "Amount",
                column: "SALESINVOICE_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Currency",
                column: "SALESINVOICE_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "VAT",
                column: "SALESINVOICE_VAT",
                type: "DOUBLE",
            },
            {
                name: "Discount",
                column: "SALESINVOICE_DISCOUNT",
                type: "DOUBLE",
            },
            {
                name: "Taxes",
                column: "SALESINVOICE_TAXES",
                type: "DOUBLE",
            },
            {
                name: "Total",
                column: "SALESINVOICE_TOTAL",
                type: "DOUBLE",
            },
            {
                name: "Conditions",
                column: "SALESINVOICE_CONDITIONS",
                type: "VARCHAR",
            },
            {
                name: "PaymentMethod",
                column: "SALESINVOICE_PAYMENTMETHOD",
                type: "VARCHAR",
            },
            {
                name: "SentMethod",
                column: "SALESINVOICE_SENTMETHOD",
                type: "VARCHAR",
            },
            {
                name: "Status",
                column: "SALESINVOICE_STATUS",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "SALESINVOICE_COMPANY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalesInvoiceRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesInvoiceEntityOptions): SalesInvoiceEntity[] {
        return this.dao.list(options).map((e: SalesInvoiceEntity) => {
            EntityUtils.setDate(e, "Date");
            EntityUtils.setDate(e, "Due");
            return e;
        });
    }

    public findById(id: number): SalesInvoiceEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        EntityUtils.setDate(entity, "Due");
        return entity ?? undefined;
    }

    public create(entity: SalesInvoiceCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        EntityUtils.setLocalDate(entity, "Due");
        // @ts-ignore
        (entity as SalesInvoiceEntity).VAT = entity.Amount * 0.2;
        // @ts-ignore
        (entity as SalesInvoiceEntity).Total = (entity.Amount + entity.VAT) - (entity.Amount * (entity.Discount ? entity.Discount : 0) / 100) + (entity.Taxes ? entity.Taxes : 0);
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESINVOICE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesInvoiceUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        // EntityUtils.setLocalDate(entity, "Due");
        // @ts-ignore
        (entity as SalesInvoiceEntity).VAT = entity.Amount * 0.2;
        // @ts-ignore
        (entity as SalesInvoiceEntity).Total = (entity.Amount + entity.VAT) - (entity.Amount * (entity.Discount ? entity.Discount : 0) / 100) + (entity.Taxes ? entity.Taxes : 0);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESINVOICE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesInvoiceCreateEntity | SalesInvoiceUpdateEntity): number {
        const id = (entity as SalesInvoiceUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesInvoiceUpdateEntity);
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
            table: "CODBEX_SALESINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESINVOICE_ID",
                value: id
            }
        });
    }

    public count(options?: SalesInvoiceEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalesInvoiceEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-SalesInvoices-SalesInvoice", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/SalesInvoices/SalesInvoice").send(JSON.stringify(data));
    }
}