import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalesOrderItemEntity {
    readonly Id: number;
    SalesOrder?: number;
    Name?: string;
    Quantity?: number;
    Price?: number;
    Amount?: number;
}

export interface SalesOrderItemCreateEntity {
    readonly SalesOrder?: number;
    readonly Name?: string;
    readonly Quantity?: number;
    readonly Price?: number;
}

export interface SalesOrderItemUpdateEntity extends SalesOrderItemCreateEntity {
    readonly Id: number;
}

export interface SalesOrderItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            SalesOrder?: number | number[];
            Name?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Amount?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            SalesOrder?: number | number[];
            Name?: string | string[];
            Quantity?: number | number[];
            Price?: number | number[];
            Amount?: number | number[];
        };
        contains?: {
            Id?: number;
            SalesOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        greaterThan?: {
            Id?: number;
            SalesOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            SalesOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        lessThan?: {
            Id?: number;
            SalesOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            SalesOrder?: number;
            Name?: string;
            Quantity?: number;
            Price?: number;
            Amount?: number;
        };
    },
    $select?: (keyof SalesOrderItemEntity)[],
    $sort?: string | (keyof SalesOrderItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesOrderItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesOrderItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalesOrderItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESORDERITEM",
        properties: [
            {
                name: "Id",
                column: "SALESORDERITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "SalesOrder",
                column: "SALESORDERITEM_SALESORDER",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "SALESORDERITEM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Quantity",
                column: "SALESORDERITEM_QUANTITY",
                type: "DOUBLE",
            },
            {
                name: "Price",
                column: "SALESORDERITEM_PRICE",
                type: "DOUBLE",
            },
            {
                name: "Amount",
                column: "SALESORDERITEM_AMOUNT",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalesOrderItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesOrderItemEntityOptions): SalesOrderItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalesOrderItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalesOrderItemCreateEntity): number {
        // @ts-ignore
        (entity as SalesOrderItemEntity).Amount = entity["Quantity"] * entity["Price"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesOrderItemUpdateEntity): void {
        // @ts-ignore
        (entity as SalesOrderItemEntity).Amount = entity["Quantity"] * entity["Price"];
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesOrderItemCreateEntity | SalesOrderItemUpdateEntity): number {
        const id = (entity as SalesOrderItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesOrderItemUpdateEntity);
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
            table: "CODBEX_SALESORDERITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDERITEM_ID",
                value: id
            }
        });
    }



    public count(SalesOrder: number): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERITEM" WHERE "SALESORDERITEM_SALESORDER" = ?', [SalesOrder]);
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
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDERITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalesOrderItemEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/SalesOrders/SalesOrderItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/SalesOrders/SalesOrderItem").send(JSON.stringify(data));
    }
}