import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface CurrencyEntity {
    readonly Id: number;
    Name?: string;
    Default?: boolean;
}

export interface CurrencyCreateEntity {
    readonly Name?: string;
    readonly Default?: boolean;
}

export interface CurrencyUpdateEntity extends CurrencyCreateEntity {
    readonly Id: number;
}

export interface CurrencyEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Default?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Default?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Default?: boolean;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Default?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Default?: boolean;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Default?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Default?: boolean;
        };
    },
    $select?: (keyof CurrencyEntity)[],
    $sort?: string | (keyof CurrencyEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface CurrencyEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<CurrencyEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class CurrencyRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_CURRENCY",
        properties: [
            {
                name: "Id",
                column: "CURRENCY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "CURRENCY_NAME",
                type: "VARCHAR",
            },
            {
                name: "Default",
                column: "CURRENCY_DEFAULT",
                type: "BOOLEAN",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(CurrencyRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: CurrencyEntityOptions): CurrencyEntity[] {
        return this.dao.list(options).map((e: CurrencyEntity) => {
            EntityUtils.setBoolean(e, "Default");
            return e;
        });
    }

    public findById(id: number): CurrencyEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "Default");
        return entity ?? undefined;
    }

    public create(entity: CurrencyCreateEntity): number {
        EntityUtils.setBoolean(entity, "Default");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_CURRENCY",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: CurrencyUpdateEntity): void {
        EntityUtils.setBoolean(entity, "Default");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_CURRENCY",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: CurrencyCreateEntity | CurrencyUpdateEntity): number {
        const id = (entity as CurrencyUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as CurrencyUpdateEntity);
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
            table: "CODBEX_CURRENCY",
            entity: entity,
            key: {
                name: "Id",
                column: "CURRENCY_ID",
                value: id
            }
        });
    }

    public count(options?: CurrencyEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: CurrencyEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_CURRENCY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: CurrencyEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Settings-Currency", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Settings/Currency").send(JSON.stringify(data));
    }
}