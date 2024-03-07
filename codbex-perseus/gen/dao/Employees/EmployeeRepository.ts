import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface EmployeeEntity {
    readonly Id: number;
    Name?: string;
    Email?: string;
    Phone?: string;
    Address?: string;
    PostCode?: string;
    City?: string;
    Country?: string;
    Team?: number;
    Company?: number;
    Vacation?: number;
}

export interface EmployeeCreateEntity {
    readonly Name?: string;
    readonly Email?: string;
    readonly Phone?: string;
    readonly Address?: string;
    readonly PostCode?: string;
    readonly City?: string;
    readonly Country?: string;
    readonly Team?: number;
    readonly Company?: number;
    readonly Vacation?: number;
}

export interface EmployeeUpdateEntity extends EmployeeCreateEntity {
    readonly Id: number;
}

export interface EmployeeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Phone?: string | string[];
            Address?: string | string[];
            PostCode?: string | string[];
            City?: string | string[];
            Country?: string | string[];
            Team?: number | number[];
            Company?: number | number[];
            Vacation?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Phone?: string | string[];
            Address?: string | string[];
            PostCode?: string | string[];
            City?: string | string[];
            Country?: string | string[];
            Team?: number | number[];
            Company?: number | number[];
            Vacation?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            Team?: number;
            Company?: number;
            Vacation?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            Team?: number;
            Company?: number;
            Vacation?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            Team?: number;
            Company?: number;
            Vacation?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            Team?: number;
            Company?: number;
            Vacation?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            Team?: number;
            Company?: number;
            Vacation?: number;
        };
    },
    $select?: (keyof EmployeeEntity)[],
    $sort?: string | (keyof EmployeeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface EmployeeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<EmployeeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class EmployeeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_EMPLOYEE",
        properties: [
            {
                name: "Id",
                column: "EMPLOYEE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "EMPLOYEE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "EMPLOYEE_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "Phone",
                column: "EMPLOYEE_PHONE",
                type: "VARCHAR",
            },
            {
                name: "Address",
                column: "EMPLOYEE_ADDRESS",
                type: "VARCHAR",
            },
            {
                name: "PostCode",
                column: "EMPLOYEE_POSTCODE",
                type: "VARCHAR",
            },
            {
                name: "City",
                column: "EMPLOYEE_CITY",
                type: "VARCHAR",
            },
            {
                name: "Country",
                column: "EMPLOYEE_COUNTRY",
                type: "VARCHAR",
            },
            {
                name: "Team",
                column: "EMPLOYEE_TEAM",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "EMPLOYEE_COMPANY",
                type: "INTEGER",
            },
            {
                name: "Vacation",
                column: "EMPLOYEE_VACATION",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(EmployeeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: EmployeeEntityOptions): EmployeeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): EmployeeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: EmployeeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: EmployeeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: EmployeeCreateEntity | EmployeeUpdateEntity): number {
        const id = (entity as EmployeeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as EmployeeUpdateEntity);
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
            table: "CODBEX_EMPLOYEE",
            entity: entity,
            key: {
                name: "Id",
                column: "EMPLOYEE_ID",
                value: id
            }
        });
    }

    public count(options?: EmployeeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_EMPLOYEE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: EmployeeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Employees-Employee", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Employees/Employee").send(JSON.stringify(data));
    }
}