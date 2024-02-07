import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

export interface CustomerEntity {
    readonly Id: number;
    Name?: string;
    Contact?: string;
    Email?: string;
    Phone?: string;
    Address?: string;
    PostCode?: string;
    City?: string;
    Country?: string;
    IBAN?: string;
    VATNO?: string;
}

export interface CustomerCreateEntity {
    readonly Name?: string;
    readonly Contact?: string;
    readonly Email?: string;
    readonly Phone?: string;
    readonly Address?: string;
    readonly PostCode?: string;
    readonly City?: string;
    readonly Country?: string;
    readonly IBAN?: string;
    readonly VATNO?: string;
}

export interface CustomerUpdateEntity extends CustomerCreateEntity {
    readonly Id: number;
}

export interface CustomerEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Contact?: string | string[];
            Email?: string | string[];
            Phone?: string | string[];
            Address?: string | string[];
            PostCode?: string | string[];
            City?: string | string[];
            Country?: string | string[];
            IBAN?: string | string[];
            VATNO?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Contact?: string | string[];
            Email?: string | string[];
            Phone?: string | string[];
            Address?: string | string[];
            PostCode?: string | string[];
            City?: string | string[];
            Country?: string | string[];
            IBAN?: string | string[];
            VATNO?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Contact?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            IBAN?: string;
            VATNO?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Contact?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            IBAN?: string;
            VATNO?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Contact?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            IBAN?: string;
            VATNO?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Contact?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            IBAN?: string;
            VATNO?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Contact?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: string;
            Country?: string;
            IBAN?: string;
            VATNO?: string;
        };
    },
    $select?: (keyof CustomerEntity)[],
    $sort?: string | (keyof CustomerEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CustomerEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CustomerEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CustomerRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CUSTOMER",
        properties: [
            {
                name: "Id",
                column: "CUSTOMER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CUSTOMER_NAME",
                type: "VARCHAR",
            },
            {
                name: "Contact",
                column: "CUSTOMER_CONTACT",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "CUSTOMER_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "Phone",
                column: "CUSTOMER_PHONE",
                type: "VARCHAR",
            },
            {
                name: "Address",
                column: "CUSTOMER_ADDRESS",
                type: "VARCHAR",
            },
            {
                name: "PostCode",
                column: "CUSTOMER_POSTCODE",
                type: "VARCHAR",
            },
            {
                name: "City",
                column: "CUSTOMER_CITY",
                type: "VARCHAR",
            },
            {
                name: "Country",
                column: "CUSTOMER_COUNTRY",
                type: "VARCHAR",
            },
            {
                name: "IBAN",
                column: "CUSTOMER_IBAN",
                type: "VARCHAR",
            },
            {
                name: "VATNO",
                column: "CUSTOMER_VATNO",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(CustomerRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CustomerEntityOptions): CustomerEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CustomerEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CustomerCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CUSTOMER",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CustomerUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CUSTOMER",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CustomerCreateEntity | CustomerUpdateEntity): number {
        const id = (entity as CustomerUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CustomerUpdateEntity);
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
            table: "CODBEX_CUSTOMER",
            entity: entity,
            key: {
                name: "Id",
                column: "CUSTOMER_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CUSTOMER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }


    private async triggerEvent(data: CustomerEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Partners/Customer", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Partners/Customer").send(JSON.stringify(data));
    }
}