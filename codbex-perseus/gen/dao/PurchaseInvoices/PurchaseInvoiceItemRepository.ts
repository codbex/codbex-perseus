import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PurchaseInvoiceItemEntity {
    readonly Id: number;
    PurchaseInvoice?: number;
    Name?: string;
    Quantity?: number;
    Price?: number;
    Amount?: number;
}

export interface PurchaseInvoiceItemCreateEntity {
    readonly PurchaseInvoice?: number;
    readonly Name?: string;
    readonly Quantity?: number;
    readonly Price?: number;
}

export interface PurchaseInvoiceItemUpdateEntity extends PurchaseInvoiceItemCreateEntity {
    readonly Id: number;
}

export interface PurchaseInvoiceItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            PurchaseInvoice?: number | number[];
            Name?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Amount?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            PurchaseInvoice?: number | number[];
            Name?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Amount?: number | number[];
        };
        contains?: {
            Id?: number;
            PurchaseInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        greaterThan?: {
            Id?: number;
            PurchaseInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            PurchaseInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        lessThan?: {
            Id?: number;
            PurchaseInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            PurchaseInvoice?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
    },
    $select?: (keyof PurchaseInvoiceItemEntity)[],
    $sort?: string | (keyof PurchaseInvoiceItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PurchaseInvoiceItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PurchaseInvoiceItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PurchaseInvoiceItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PURCHASEINVOICEITEM",
        properties: [
            {
                name: "Id",
                column: "PURCHASEINVOICEITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "PurchaseInvoice",
                column: "PURCHASEINVOICEITEM_PURCHASEINVOICE",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "PURCHASEINVOICEITEM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Quantity",
                column: "PURCHASEINVOICEITEM_QUANTITY",
                type: "DOUBLE",
            },
            {
                name: "Price",
                column: "PURCHASEINVOICEITEM_PRICE",
                type: "DOUBLE",
            },
            {
                name: "Amount",
                column: "PURCHASEINVOICEITEM_AMOUNT",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PurchaseInvoiceItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PurchaseInvoiceItemEntityOptions): PurchaseInvoiceItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PurchaseInvoiceItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PurchaseInvoiceItemCreateEntity): number {
        (entity as PurchaseInvoiceItemEntity).Amount = entity["Quantity"] * entity["Price"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PURCHASEINVOICEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEINVOICEITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PurchaseInvoiceItemUpdateEntity): void {
        (entity as PurchaseInvoiceItemEntity).Amount = entity["Quantity"] * entity["Price"];
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PURCHASEINVOICEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEINVOICEITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PurchaseInvoiceItemCreateEntity | PurchaseInvoiceItemUpdateEntity): number {
        const id = (entity as PurchaseInvoiceItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PurchaseInvoiceItemUpdateEntity);
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
            table: "CODBEX_PURCHASEINVOICEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEINVOICEITEM_ID",
                value: id
            }
        });
    }



    public count(PurchaseInvoice: number): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEINVOICEITEM" WHERE "PURCHASEINVOICEITEM_PURCHASEINVOICE" = ?', [PurchaseInvoice]);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEINVOICEITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PurchaseInvoiceItemEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/PurchaseInvoices/PurchaseInvoiceItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/PurchaseInvoices/PurchaseInvoiceItem").send(JSON.stringify(data));
    }
}