import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PaymentEntryEntity {
    readonly Id: number;
    Date?: Date;
    Valor?: Date;
    Company?: number;
    CompanyIBAN?: string;
    CounterpartyIBAN?: string;
    CounterpartyName?: string;
    Amount?: number;
    Currency?: number;
    Reason?: string;
    Description?: string;
    Direction?: number;
}

export interface PaymentEntryCreateEntity {
    readonly Date?: Date;
    readonly Valor?: Date;
    readonly Company?: number;
    readonly CompanyIBAN?: string;
    readonly CounterpartyIBAN?: string;
    readonly CounterpartyName?: string;
    readonly Amount?: number;
    readonly Currency?: number;
    readonly Reason?: string;
    readonly Description?: string;
    readonly Direction?: number;
}

export interface PaymentEntryUpdateEntity extends PaymentEntryCreateEntity {
    readonly Id: number;
}

export interface PaymentEntryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Valor?: Date | Date[];
            Company?: number | number[];
            CompanyIBAN?: string | string[];
            CounterpartyIBAN?: string | string[];
            CounterpartyName?: string | string[];
            Amount?: number | number[];
            Currency?: number | number[];
            Reason?: string | string[];
            Description?: string | string[];
            Direction?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Valor?: Date | Date[];
            Company?: number | number[];
            CompanyIBAN?: string | string[];
            CounterpartyIBAN?: string | string[];
            CounterpartyName?: string | string[];
            Amount?: number | number[];
            Currency?: number | number[];
            Reason?: string | string[];
            Description?: string | string[];
            Direction?: number | number[];
        };
        contains?: {
            Id?: number;
            Date?: Date;
            Valor?: Date;
            Company?: number;
            CompanyIBAN?: string;
            CounterpartyIBAN?: string;
            CounterpartyName?: string;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
            Direction?: number;
        };
        greaterThan?: {
            Id?: number;
            Date?: Date;
            Valor?: Date;
            Company?: number;
            CompanyIBAN?: string;
            CounterpartyIBAN?: string;
            CounterpartyName?: string;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
            Direction?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Valor?: Date;
            Company?: number;
            CompanyIBAN?: string;
            CounterpartyIBAN?: string;
            CounterpartyName?: string;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
            Direction?: number;
        };
        lessThan?: {
            Id?: number;
            Date?: Date;
            Valor?: Date;
            Company?: number;
            CompanyIBAN?: string;
            CounterpartyIBAN?: string;
            CounterpartyName?: string;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
            Direction?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Valor?: Date;
            Company?: number;
            CompanyIBAN?: string;
            CounterpartyIBAN?: string;
            CounterpartyName?: string;
            Amount?: number;
            Currency?: number;
            Reason?: string;
            Description?: string;
            Direction?: number;
        };
    },
    $select?: (keyof PaymentEntryEntity)[],
    $sort?: string | (keyof PaymentEntryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PaymentEntryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PaymentEntryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PaymentEntryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYMENTENTRY",
        properties: [
            {
                name: "Id",
                column: "PAYMENTENTRY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Date",
                column: "PAYMENTENTRY_DATE",
                type: "DATE",
            },
            {
                name: "Valor",
                column: "PAYMENTENTRY_VALOR",
                type: "DATE",
            },
            {
                name: "Company",
                column: "PAYMENTENTRY_COMPANY",
                type: "INTEGER",
            },
            {
                name: "CompanyIBAN",
                column: "PAYMENTENTRY_COMPANYIBAN",
                type: "VARCHAR",
            },
            {
                name: "CounterpartyIBAN",
                column: "PAYMENTENTRY_COUNTERPARTYIBAN",
                type: "VARCHAR",
            },
            {
                name: "CounterpartyName",
                column: "PAYMENTENTRY_COUNTERPARTYNAME",
                type: "VARCHAR",
            },
            {
                name: "Amount",
                column: "PAYMENTENTRY_AMOUNT",
                type: "DOUBLE",
            },
            {
                name: "Currency",
                column: "PAYMENTENTRY_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Reason",
                column: "PAYMENTENTRY_REASON",
                type: "VARCHAR",
            },
            {
                name: "Description",
                column: "PAYMENTENTRY_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Direction",
                column: "PAYMENTENTRY_DIRECTION",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PaymentEntryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PaymentEntryEntityOptions): PaymentEntryEntity[] {
        return this.dao.list(options).map((e: PaymentEntryEntity) => {
            EntityUtils.setDate(e, "Date");
            EntityUtils.setDate(e, "Valor");
            return e;
        });
    }

    public findById(id: number): PaymentEntryEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        EntityUtils.setDate(entity, "Valor");
        return entity ?? undefined;
    }

    public create(entity: PaymentEntryCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        EntityUtils.setLocalDate(entity, "Valor");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYMENTENTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTENTRY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PaymentEntryUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        // EntityUtils.setLocalDate(entity, "Valor");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYMENTENTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTENTRY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PaymentEntryCreateEntity | PaymentEntryUpdateEntity): number {
        const id = (entity as PaymentEntryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PaymentEntryUpdateEntity);
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
            table: "CODBEX_PAYMENTENTRY",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTENTRY_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYMENTENTRY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PaymentEntryEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Payments/PaymentEntry", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Payments/PaymentEntry").send(JSON.stringify(data));
    }
}