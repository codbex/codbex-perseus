import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface SalesOrderEntity {
    readonly Id: number;
    Name?: string;
    Number?: string;
    Date?: Date;
    Customer?: number;
    Amount?: number;
    Currency?: number;
    VAT?: number;
    Total?: number;
    Status?: number;
    Company?: number;
}

export interface SalesOrderCreateEntity {
    readonly Name?: string;
    readonly Number?: string;
    readonly Date?: Date;
    readonly Customer?: number;
    readonly Amount?: number;
    readonly Currency?: number;
    readonly Status?: number;
    readonly Company?: number;
}

export interface SalesOrderUpdateEntity extends SalesOrderCreateEntity {
    readonly Id: number;
}

export interface SalesOrderEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Number?: string | string[];
            Date?: Date | Date[];
            Customer?: number | number[];
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
            Customer?: number | number[];
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
            Customer?: number;
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
            Customer?: number;
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
            Customer?: number;
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
            Customer?: number;
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
            Customer?: number;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Total?: number;
            Status?: number;
            Company?: number;
        };
    },
    $select?: (keyof SalesOrderEntity)[],
    $sort?: string | (keyof SalesOrderEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalesOrderEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalesOrderEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalesOrderRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALESORDER",
        properties: [
            {
                name: "Id",
                column: "SALESORDER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "SALESORDER_NAME",
                type: "VARCHAR",
            },
            {
                name: "Number",
                column: "SALESORDER_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "SALESORDER_DATE",
                type: "DATE",
            },
            {
                name: "Customer",
                column: "SALESORDER_CUSTOMER",
                type: "INTEGER",
            },
            {
                name: "Amount",
                column: "SALESORDER_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Currency",
                column: "SALESORDER_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "VAT",
                column: "SALESORDER_VAT",
                type: "DOUBLE",
            },
            {
                name: "Total",
                column: "SALESORDER_TOTAL",
                type: "DOUBLE",
            },
            {
                name: "Status",
                column: "SALESORDER_SALESORDERSTATUSID",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "SALESORDER_COMPANY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalesOrderRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalesOrderEntityOptions): SalesOrderEntity[] {
        return this.dao.list(options).map((e: SalesOrderEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): SalesOrderEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: SalesOrderCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as SalesOrderEntity).VAT = ${property.calculatedPropertyExpressionCreate};
        // @ts-ignore
        (entity as SalesOrderEntity).Total = ${property.calculatedPropertyExpressionCreate};
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALESORDER",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalesOrderUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as SalesOrderEntity).VAT = ${property.calculatedPropertyExpressionUpdate};
        // @ts-ignore
        (entity as SalesOrderEntity).Total = ${property.calculatedPropertyExpressionUpdate};
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALESORDER",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalesOrderCreateEntity | SalesOrderUpdateEntity): number {
        const id = (entity as SalesOrderUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalesOrderUpdateEntity);
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
            table: "CODBEX_SALESORDER",
            entity: entity,
            key: {
                name: "Id",
                column: "SALESORDER_ID",
                value: id
            }
        });
    }

    public count(options?: SalesOrderEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: SalesOrderEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALESORDER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalesOrderEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/SalesOrders/SalesOrder", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/SalesOrders/SalesOrder").send(JSON.stringify(data));
    }
}