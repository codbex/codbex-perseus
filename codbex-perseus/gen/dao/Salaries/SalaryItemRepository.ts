import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalaryItemEntity {
    readonly Id: number;
    Salary?: number;
    Name?: string;
    Amount?: number;
    Direction?: number;
}

export interface SalaryItemCreateEntity {
    readonly Salary?: number;
    readonly Name?: string;
    readonly Amount?: number;
    readonly Direction?: number;
}

export interface SalaryItemUpdateEntity extends SalaryItemCreateEntity {
    readonly Id: number;
}

export interface SalaryItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Salary?: number | number[];
            Name?: string | string[];
            Amount?: number | number[];
            Direction?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Salary?: number | number[];
            Name?: string | string[];
            Amount?: number | number[];
            Direction?: number | number[];
        };
        contains?: {
            Id?: number;
            Salary?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
        greaterThan?: {
            Id?: number;
            Salary?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Salary?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
        lessThan?: {
            Id?: number;
            Salary?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Salary?: number;
            Name?: string;
            Amount?: number;
            Direction?: number;
        };
    },
    $select?: (keyof SalaryItemEntity)[],
    $sort?: string | (keyof SalaryItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalaryItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalaryItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalaryItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALARYITEM",
        properties: [
            {
                name: "Id",
                column: "SALARYITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Salary",
                column: "SALARYITEM_SALARY",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "SALARYITEM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Amount",
                column: "SALARYITEM_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Direction",
                column: "SALARYITEM_DIRECTION",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalaryItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalaryItemEntityOptions): SalaryItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalaryItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalaryItemCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALARYITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARYITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalaryItemUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALARYITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARYITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalaryItemCreateEntity | SalaryItemUpdateEntity): number {
        const id = (entity as SalaryItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalaryItemUpdateEntity);
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
            table: "CODBEX_SALARYITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARYITEM_ID",
                value: id
            }
        });
    }

    public count(options?: SalaryItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: SalaryItemEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARYITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalaryItemEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Salaries/SalaryItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Salaries/SalaryItem").send(JSON.stringify(data));
    }
}