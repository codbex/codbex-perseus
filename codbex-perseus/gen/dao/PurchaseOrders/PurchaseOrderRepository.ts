import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PurchaseOrderEntity {
    readonly Id: number;
    Name?: string;
    Number?: string;
    Date?: Date;
    Supplier?: number;
    Description?: string;
    Amount?: number;
    Currency?: number;
    VAT?: number;
    Total?: number;
    Status?: number;
    Company?: number;
}

export interface PurchaseOrderCreateEntity {
    readonly Name?: string;
    readonly Number?: string;
    readonly Date?: Date;
    readonly Supplier?: number;
    readonly Description?: string;
    readonly Amount?: number;
    readonly Currency?: number;
    readonly Status?: number;
    readonly Company?: number;
}

export interface PurchaseOrderUpdateEntity extends PurchaseOrderCreateEntity {
    readonly Id: number;
}

export interface PurchaseOrderEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Number?: string | string[];
            Date?: Date | Date[];
            Supplier?: number | number[];
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
            Description?: string;
            Amount?: number;
            Currency?: number;
            VAT?: number;
            Total?: number;
            Status?: number;
            Company?: number;
        };
    },
    $select?: (keyof PurchaseOrderEntity)[],
    $sort?: string | (keyof PurchaseOrderEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PurchaseOrderEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PurchaseOrderEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PurchaseOrderRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PURCHASEORDER",
        properties: [
            {
                name: "Id",
                column: "PURCHASEORDER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PURCHASEORDER_NAME",
                type: "VARCHAR",
            },
            {
                name: "Number",
                column: "PURCHASEORDER_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "PURCHASEORDER_DATE",
                type: "DATE",
            },
            {
                name: "Supplier",
                column: "PURCHASEORDER_SUPPLIER",
                type: "INTEGER",
            },
            {
                name: "Description",
                column: "PURCHASEORDER_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Amount",
                column: "PURCHASEORDER_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Currency",
                column: "PURCHASEORDER_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "VAT",
                column: "PURCHASEORDER_VAT",
                type: "DOUBLE",
            },
            {
                name: "Total",
                column: "PURCHASEORDER_TOTAL",
                type: "DOUBLE",
            },
            {
                name: "Status",
                column: "PURCHASEORDER_STATUS",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "PURCHASEORDER_COMPANY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PurchaseOrderRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PurchaseOrderEntityOptions): PurchaseOrderEntity[] {
        return this.dao.list(options).map((e: PurchaseOrderEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): PurchaseOrderEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: PurchaseOrderCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        (entity as PurchaseOrderEntity).VAT = entity['Amount'] * 0.2;
        (entity as PurchaseOrderEntity).Total = entity["Amount"] + entity["VAT"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PURCHASEORDER",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEORDER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PurchaseOrderUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        (entity as PurchaseOrderEntity).VAT = entity['Amount'] * 0.2;
        (entity as PurchaseOrderEntity).Total = entity["Amount"] + entity["VAT"];
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PURCHASEORDER",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEORDER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PurchaseOrderCreateEntity | PurchaseOrderUpdateEntity): number {
        const id = (entity as PurchaseOrderUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PurchaseOrderUpdateEntity);
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
            table: "CODBEX_PURCHASEORDER",
            entity: entity,
            key: {
                name: "Id",
                column: "PURCHASEORDER_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PURCHASEORDER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }


    private async triggerEvent(data: PurchaseOrderEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/PurchaseOrders/PurchaseOrder", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/PurchaseOrders/PurchaseOrder").send(JSON.stringify(data));
    }
}