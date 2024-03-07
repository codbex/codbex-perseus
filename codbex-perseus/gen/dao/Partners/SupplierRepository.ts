import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SupplierEntity {
    readonly Id: number;
    Name?: string;
    Email?: string;
    Phone?: string;
    Address?: string;
    PostCode?: string;
    City?: string;
    Country?: string;
    VATNO?: string;
    IBAN?: string;
    SWIFT?: string;
    Bank?: string;
}

export interface SupplierCreateEntity {
    readonly Name?: string;
    readonly Email?: string;
    readonly Phone?: string;
    readonly Address?: string;
    readonly PostCode?: string;
    readonly City?: string;
    readonly Country?: string;
    readonly VATNO?: string;
    readonly IBAN?: string;
    readonly SWIFT?: string;
    readonly Bank?: string;
}

export interface SupplierUpdateEntity extends SupplierCreateEntity {
    readonly Id: number;
}

export interface SupplierEntityOptions {
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
            VATNO?: string | string[];
            IBAN?: string | string[];
            SWIFT?: string | string[];
            Bank?: string | string[];
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
            VATNO?: string | string[];
            IBAN?: string | string[];
            SWIFT?: string | string[];
            Bank?: string | string[];
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
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
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
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
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
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
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
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
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
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
        };
    },
    $select?: (keyof SupplierEntity)[],
    $sort?: string | (keyof SupplierEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SupplierEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SupplierEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class SupplierRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SUPPLIER",
        properties: [
            {
                name: "Id",
                column: "SUPPLIER_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "SUPPLIER_NAME",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "SUPPLIER_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "Phone",
                column: "SUPPLIER_PHONE",
                type: "VARCHAR",
            },
            {
                name: "Address",
                column: "SUPPLIER_ADDRESS",
                type: "VARCHAR",
            },
            {
                name: "PostCode",
                column: "SUPPLIER_POSTCODE",
                type: "VARCHAR",
            },
            {
                name: "City",
                column: "SUPPLIER_CITY",
                type: "VARCHAR",
            },
            {
                name: "Country",
                column: "SUPPLIER_COUNTRY",
                type: "VARCHAR",
            },
            {
                name: "VATNO",
                column: "SUPPLIER_VATNO",
                type: "VARCHAR",
            },
            {
                name: "IBAN",
                column: "SUPPLIER_IBAN",
                type: "VARCHAR",
            },
            {
                name: "SWIFT",
                column: "SUPPLIER_SWIFT",
                type: "VARCHAR",
            },
            {
                name: "Bank",
                column: "SUPPLIER_BANK",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(SupplierRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SupplierEntityOptions): SupplierEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SupplierEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SupplierCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SUPPLIER",
            entity: entity,
            key: {
                name: "Id",
                column: "SUPPLIER_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SupplierUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SUPPLIER",
            entity: entity,
            key: {
                name: "Id",
                column: "SUPPLIER_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SupplierCreateEntity | SupplierUpdateEntity): number {
        const id = (entity as SupplierUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SupplierUpdateEntity);
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
            table: "CODBEX_SUPPLIER",
            entity: entity,
            key: {
                name: "Id",
                column: "SUPPLIER_ID",
                value: id
            }
        });
    }

    public count(options?: SupplierEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SUPPLIER"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SupplierEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Partners-Supplier", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Partners/Supplier").send(JSON.stringify(data));
    }
}