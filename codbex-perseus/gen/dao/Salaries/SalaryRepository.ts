import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalaryEntity {
    readonly Id: number;
    Name?: string;
    Employee?: number;
    Company?: number;
    Currency?: number;
    Net?: number;
    Gross?: number;
    Total?: number;
}

export interface SalaryCreateEntity {
    readonly Name?: string;
    readonly Employee?: number;
    readonly Company?: number;
    readonly Currency?: number;
    readonly Net?: number;
    readonly Gross?: number;
    readonly Total?: number;
}

export interface SalaryUpdateEntity extends SalaryCreateEntity {
    readonly Id: number;
}

export interface SalaryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Employee?: number | number[];
            Company?: number | number[];
            Currency?: number | number[];
            Net?: number | number[];
            Gross?: number | number[];
            Total?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Employee?: number | number[];
            Company?: number | number[];
            Currency?: number | number[];
            Net?: number | number[];
            Gross?: number | number[];
            Total?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
    },
    $select?: (keyof SalaryEntity)[],
    $sort?: string | (keyof SalaryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalaryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalaryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SalaryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALARY",
        properties: [
            {
                name: "Id",
                column: "SALARY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "SALARY_NAME",
                type: "VARCHAR",
            },
            {
                name: "Employee",
                column: "SALARY_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "SALARY_COMPANY",
                type: "INTEGER",
            },
            {
                name: "Currency",
                column: "SALARY_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Net",
                column: "SALARY_NET",
                type: "DOUBLE",
            },
            {
                name: "Gross",
                column: "SALARY_GROSS",
                type: "DOUBLE",
            },
            {
                name: "Total",
                column: "SALARY_TOTAL",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SalaryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalaryEntityOptions): SalaryEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalaryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalaryCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALARY",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalaryUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALARY",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalaryCreateEntity | SalaryUpdateEntity): number {
        const id = (entity as SalaryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalaryUpdateEntity);
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
            table: "CODBEX_SALARY",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARY_ID",
                value: id
            }
        });
    }

    public count(options?: SalaryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: SalaryEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalaryEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Salaries-Salary", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Salaries/Salary").send(JSON.stringify(data));
    }
}