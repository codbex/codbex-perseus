import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

export interface CompanyEntity {
    readonly Id: number;
    Name?: string;
    Email?: string;
    Phone?: string;
    Address?: string;
    PostCode?: string;
    VATNO?: string;
    IBAN?: string;
    SWIFT?: string;
    Bank?: string;
    City?: string;
    Country?: string;
}

export interface CompanyCreateEntity {
    readonly Name?: string;
    readonly Email?: string;
    readonly Phone?: string;
    readonly Address?: string;
    readonly PostCode?: string;
    readonly VATNO?: string;
    readonly IBAN?: string;
    readonly SWIFT?: string;
    readonly Bank?: string;
    readonly City?: string;
    readonly Country?: string;
}

export interface CompanyUpdateEntity extends CompanyCreateEntity {
    readonly Id: number;
}

export interface CompanyEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Phone?: string | string[];
            Address?: string | string[];
            PostCode?: string | string[];
            VATNO?: string | string[];
            IBAN?: string | string[];
            SWIFT?: string | string[];
            Bank?: string | string[];
            City?: string | string[];
            Country?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Phone?: string | string[];
            Address?: string | string[];
            PostCode?: string | string[];
            VATNO?: string | string[];
            IBAN?: string | string[];
            SWIFT?: string | string[];
            Bank?: string | string[];
            City?: string | string[];
            Country?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
            City?: string;
            Country?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
            City?: string;
            Country?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
            City?: string;
            Country?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
            City?: string;
            Country?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            VATNO?: string;
            IBAN?: string;
            SWIFT?: string;
            Bank?: string;
            City?: string;
            Country?: string;
        };
    },
    $select?: (keyof CompanyEntity)[],
    $sort?: string | (keyof CompanyEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CompanyEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CompanyEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CompanyRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_COMPANY",
        properties: [
            {
                name: "Id",
                column: "COMPANY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "COMPANY_NAME",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "COMPANY_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "Phone",
                column: "COMPANY_PHONE",
                type: "VARCHAR",
            },
            {
                name: "Address",
                column: "COMPANY_ADDRESS",
                type: "VARCHAR",
            },
            {
                name: "PostCode",
                column: "COMPANY_POSTCODE",
                type: "VARCHAR",
            },
            {
                name: "VATNO",
                column: "COMPANY_VATNO",
                type: "VARCHAR",
            },
            {
                name: "IBAN",
                column: "COMPANY_IBAN",
                type: "VARCHAR",
            },
            {
                name: "SWIFT",
                column: "COMPANY_SWIFT",
                type: "VARCHAR",
            },
            {
                name: "Bank",
                column: "COMPANY_BANK",
                type: "VARCHAR",
            },
            {
                name: "City",
                column: "COMPANY_CITY",
                type: "VARCHAR",
            },
            {
                name: "Country",
                column: "COMPANY_COUNTRY",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(CompanyRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CompanyEntityOptions): CompanyEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): CompanyEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: CompanyCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_COMPANY",
            entity: entity,
            key: {
                name: "Id",
                column: "COMPANY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CompanyUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_COMPANY",
            entity: entity,
            key: {
                name: "Id",
                column: "COMPANY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CompanyCreateEntity | CompanyUpdateEntity): number {
        const id = (entity as CompanyUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CompanyUpdateEntity);
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
            table: "CODBEX_COMPANY",
            entity: entity,
            key: {
                name: "Id",
                column: "COMPANY_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_COMPANY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }


    private async triggerEvent(data: CompanyEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Settings/Company", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Settings/Company").send(JSON.stringify(data));
    }
}