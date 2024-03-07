import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PayslipItemEntity {
    readonly Id: number;
    Payslip?: number;
    Name?: string;
    Amount?: number;
    Direction?: number;
}

export interface PayslipItemCreateEntity {
    readonly Payslip?: number;
    readonly Name?: string;
    readonly Amount?: number;
    readonly Direction?: number;
}

export interface PayslipItemUpdateEntity extends PayslipItemCreateEntity {
    readonly Id: number;
}

export interface PayslipItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Payslip?: number | number[];
            Name?: string | string[];
            Amount?: number | number[];
            Direction?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Payslip?: number | number[];
            Name?: string | string[];
            Amount?: number | number[];
            Direction?: number | number[];
        };
        contains?: {
            Id?: number;
            Payslip?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
        greaterThan?: {
            Id?: number;
            Payslip?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Payslip?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
        lessThan?: {
            Id?: number;
            Payslip?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Payslip?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
    },
    $select?: (keyof PayslipItemEntity)[],
    $sort?: string | (keyof PayslipItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PayslipItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PayslipItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PayslipItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYSLIPITEM",
        properties: [
            {
                name: "Id",
                column: "PAYSLIPITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Payslip",
                column: "PAYSLIPITEM_PAYSLIP",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "PAYSLIPITEM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Amount",
                column: "PAYSLIPITEM_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Direction",
                column: "PAYSLIPITEM_DIRECTION",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PayslipItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PayslipItemEntityOptions): PayslipItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PayslipItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PayslipItemCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYSLIPITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIPITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PayslipItemUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYSLIPITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIPITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PayslipItemCreateEntity | PayslipItemUpdateEntity): number {
        const id = (entity as PayslipItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PayslipItemUpdateEntity);
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
            table: "CODBEX_PAYSLIPITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIPITEM_ID",
                value: id
            }
        });
    }

    public count(options?: PayslipItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYSLIPITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PayslipItemEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Payslips-PayslipItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Payslips/PayslipItem").send(JSON.stringify(data));
    }
}