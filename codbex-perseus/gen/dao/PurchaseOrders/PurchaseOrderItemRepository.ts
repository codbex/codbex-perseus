import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PurchaseOrderItemEntity {
    readonly Id: number;
    PurchaseOrder?: number;
    Name?: string;
    Quantity?: number;
    Price?: number;
    Amount?: number;
}

export interface PurchaseOrderItemCreateEntity {
    readonly PurchaseOrder?: number;
    readonly Name?: string;
    readonly Quantity?: number;
    readonly Price?: number;
}

export interface PurchaseOrderItemUpdateEntity extends PurchaseOrderItemCreateEntity {
    readonly Id: number;
}

export interface PurchaseOrderItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            PurchaseOrder?: number | number[];
            Name?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Amount?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            PurchaseOrder?: number | number[];
            Name?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Amount?: number | number[];
        };
        contains?: {
            Id?: number;
            PurchaseOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        greaterThan?: {
            Id?: number;
            PurchaseOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            PurchaseOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        lessThan?: {
            Id?: number;
            PurchaseOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            PurchaseOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
    },
    $select?: (keyof PurchaseOrderItemEntity)[],
    $sort?: string | (keyof PurchaseOrderItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PurchaseOrderItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PurchaseOrderItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PurchaseOrderItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PURCHASEORDERITEM",
        properties: [
            {
                name: "Id",
                column: "PURCHASEORDERITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "PurchaseOrder",
                column: "PURCHASEORDERITEM_PURCHASEORDER",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "PURCHASEORDERITEM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Quantity",
                column: "PURCHASEORDERITEM_QUANTITY",
                type: "DOUBLE",
            },
            {
                name: "Price",
                column: "PURCHASEORDERITEM_PRICE",
                type: "DOUBLE",
            },
            {
                name: "Amount",
                column: "PURCHASEORDERITEM_AMOUNT",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PurchaseOrderItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PurchaseOrderItemEntityOptions): PurchaseOrderItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PurchaseOrderItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PurchaseOrderItemCreateEntity): number {
        // @ts-ignore
        (entity as PurchaseOrderItemEntity).Amount = entity["Quantity"] * entity["Price"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PURCHASEORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEORDERITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PurchaseOrderItemUpdateEntity): void {
        // @ts-ignore
        (entity as PurchaseOrderItemEntity).Amount = entity["Quantity"] * entity["Price"];
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PURCHASEORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEORDERITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PurchaseOrderItemCreateEntity | PurchaseOrderItemUpdateEntity): number {
        const id = (entity as PurchaseOrderItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PurchaseOrderItemUpdateEntity);
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
            table: "CODBEX_PURCHASEORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEORDERITEM_ID",
                value: id
            }
        });
    }



    public count(PurchaseOrder: number): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEORDERITEM" WHERE "PURCHASEORDERITEM_PURCHASEORDER" = ?', [PurchaseOrder]);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEORDERITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PurchaseOrderItemEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/PurchaseOrders/PurchaseOrderItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/PurchaseOrders/PurchaseOrderItem").send(JSON.stringify(data));
    }
}