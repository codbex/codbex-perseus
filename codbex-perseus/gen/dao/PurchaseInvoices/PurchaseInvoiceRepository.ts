import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PurchaseInvoiceEntity {
    readonly Id: number;
    Name?: string;
    Number?: string;
    Date?: Date;
    Supplier?: number;
    PurchaseOrder?: number;
    Description?: string;
    Amount?: number;
    Currency?: number;
    VAT?: number;
    Total?: number;
    Status?: number;
    Company?: number;
}

export interface PurchaseInvoiceCreateEntity {
    readonly Name?: string;
    readonly Number?: string;
    readonly Date?: Date;
    readonly Supplier?: number;
    readonly PurchaseOrder?: number;
    readonly Description?: string;
    readonly Amount?: number;
    readonly Currency?: number;
    readonly Status?: number;
    readonly Company?: number;
}

export interface PurchaseInvoiceUpdateEntity extends PurchaseInvoiceCreateEntity {
    readonly Id: number;
}

export interface PurchaseInvoiceEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Number?: string | string[];
            Date?: Date | Date[];
            Supplier?: number | number[];
            PurchaseOrder?: number | number[];
            Description?: string | string[];
            Amount?: number | number[];
            Currency?: number | number[];
            VAT?: number | number[];
            Total?: number | number[];
            Status?: number | number[];
            Company?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Number?: string | string[];
            Date?: Date | Date[];
            Supplier?: number | number[];
            PurchaseOrder?: number | number[];
            Description?: string | string[];
            Amount?: number | number[];
            Currency?: number | number[];
            VAT?: number | number[];
            Total?: number | number[];
            Status?: number | number[];
            Company?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            PurchaseOrder?: number;
            Description?: string;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Total?: number;
            Status?: number;
            Company?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            PurchaseOrder?: number;
            Description?: string;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Total?: number;
            Status?: number;
            Company?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            PurchaseOrder?: number;
            Description?: string;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Total?: number;
            Status?: number;
            Company?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            PurchaseOrder?: number;
            Description?: string;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Total?: number;
            Status?: number;
            Company?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            PurchaseOrder?: number;
            Description?: string;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Total?: number;
            Status?: number;
            Company?: number;
        };
    },
    $select?: (keyof PurchaseInvoiceEntity)[],
    $sort?: string | (keyof PurchaseInvoiceEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PurchaseInvoiceEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PurchaseInvoiceEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PurchaseInvoiceRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PURCHASEINVOICE",
        properties: [
            {
                name: "Id",
                column: "PURCHASEINVOICE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PURCHASEINVOICE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Number",
                column: "PURCHASEINVOICE_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "PURCHASEINVOICE_DATE",
                type: "DATE",
            },
            {
                name: "Supplier",
                column: "PURCHASEINVOICE_SUPPLIER",
                type: "INTEGER",
            },
            {
                name: "PurchaseOrder",
                column: "PURCHASEINVOICE_PURCHASEORDER",
                type: "INTEGER",
            },
            {
                name: "Description",
                column: "PURCHASEINVOICE_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Amount",
                column: "PURCHASEINVOICE_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Currency",
                column: "PURCHASEINVOICE_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "VAT",
                column: "PURCHASEINVOICE_VAT",
                type: "DOUBLE",
            },
            {
                name: "Total",
                column: "PURCHASEINVOICE_TOTAL",
                type: "DOUBLE",
            },
            {
                name: "Status",
                column: "PURCHASEINVOICE_STATUS",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "PURCHASEINVOICE_COMPANY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PurchaseInvoiceRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PurchaseInvoiceEntityOptions): PurchaseInvoiceEntity[] {
        return this.dao.list(options).map((e: PurchaseInvoiceEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): PurchaseInvoiceEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: PurchaseInvoiceCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as PurchaseInvoiceEntity).VAT = entity.Amount * 0.2;
        // @ts-ignore
        (entity as PurchaseInvoiceEntity).Total = entity.Amount + entity.VAT;
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PURCHASEINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEINVOICE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PurchaseInvoiceUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as PurchaseInvoiceEntity).VAT = entity.Amount * 0.2;
        // @ts-ignore
        (entity as PurchaseInvoiceEntity).Total = entity.Amount + entity.VAT;
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PURCHASEINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEINVOICE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PurchaseInvoiceCreateEntity | PurchaseInvoiceUpdateEntity): number {
        const id = (entity as PurchaseInvoiceUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PurchaseInvoiceUpdateEntity);
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
            table: "CODBEX_PURCHASEINVOICE",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEINVOICE_ID",
                value: id
            }
        });
    }

    public count(options?: PurchaseInvoiceEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: PurchaseInvoiceEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEINVOICE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PurchaseInvoiceEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/PurchaseInvoices/PurchaseInvoice", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/PurchaseInvoices/PurchaseInvoice").send(JSON.stringify(data));
    }
}