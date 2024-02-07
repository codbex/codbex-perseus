import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

export interface SalesInvoiceItemEntity {
    readonly Id: number;
    SalesInvoice?: number;
    Name?: string;
    Quantity?: number;
    Price?: number;
    Amount?: number;
}

export interface SalesInvoiceItemCreateEntity {
    readonly SalesInvoice?: number;
    readonly Name?: string;
    readonly Quantity?: number;
    readonly Price?: number;
}

export interface SalesInvoiceItemUpdateEntity extends SalesInvoiceItemCreateEntity {
    readonly Id: number;
}

export interface SalesInvoiceItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            SalesInvoice?: number | number[];
            Name?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Amount?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            SalesInvoice?: number | number[];
            Name?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Amount?: number | number[];
        };
        contains?: {
            Id?: number;
            SalesInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        greaterThan?: {
            Id?: number;
            SalesInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            SalesInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        lessThan?: {
            Id?: number;
            SalesInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            SalesInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
    },
    $select?: (keyof SalesInvoiceItemEntity)[],
    $sort?: string | (keyof SalesInvoiceItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesInvoiceItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesInvoiceItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalesInvoiceItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESINVOICEITEM",
        properties: [
            {
                name: "Id",
                column: "SALESINVOICEITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "SalesInvoice",
                column: "SALESINVOICEITEM_SALESINVOICE",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "SALESINVOICEITEM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Quantity",
                column: "SALESINVOICEITEM_QUANTITY",
                type: "DOUBLE",
            },
            {
                name: "Price",
                column: "SALESINVOICEITEM_PRICE",
                type: "DOUBLE",
            },
            {
                name: "Amount",
                column: "SALESINVOICEITEM_AMOUNT",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalesInvoiceItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesInvoiceItemEntityOptions): SalesInvoiceItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalesInvoiceItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalesInvoiceItemCreateEntity): number {
        (entity as SalesInvoiceItemEntity).Amount = entity["Quantity"] * entity["Price"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESINVOICEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESINVOICEITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesInvoiceItemUpdateEntity): void {
        (entity as SalesInvoiceItemEntity).Amount = entity["Quantity"] * entity["Price"];
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESINVOICEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESINVOICEITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesInvoiceItemCreateEntity | SalesInvoiceItemUpdateEntity): number {
        const id = (entity as SalesInvoiceItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesInvoiceItemUpdateEntity);
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
            table: "CODBEX_SALESINVOICEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESINVOICEITEM_ID",
                value: id
            }
        });
    }



    public count(SalesInvoice: number): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICEITEM" WHERE "SALESINVOICEITEM_SALESINVOICE" = ?', [SalesInvoice]);
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESINVOICEITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }


    private async triggerEvent(data: SalesInvoiceItemEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/SalesInvoices/SalesInvoiceItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/SalesInvoices/SalesInvoiceItem").send(JSON.stringify(data));
    }
}