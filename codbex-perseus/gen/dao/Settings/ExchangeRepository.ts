import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ExchangeEntity {
    readonly Id: number;
    Currency?: number;
    Rate?: number;
}

export interface ExchangeCreateEntity {
    readonly Currency?: number;
    readonly Rate?: number;
}

export interface ExchangeUpdateEntity extends ExchangeCreateEntity {
    readonly Id: number;
}

export interface ExchangeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Currency?: number | number[];
            Rate?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Currency?: number | number[];
            Rate?: number | number[];
        };
        contains?: {
            Id?: number;
            Currency?: number;
            Rate?: number;
        };
        greaterThan?: {
            Id?: number;
            Currency?: number;
            Rate?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Currency?: number;
            Rate?: number;
        };
        lessThan?: {
            Id?: number;
            Currency?: number;
            Rate?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Currency?: number;
            Rate?: number;
        };
    },
    $select?: (keyof ExchangeEntity)[],
    $sort?: string | (keyof ExchangeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ExchangeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ExchangeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ExchangeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_EXCHANGE",
        properties: [
            {
                name: "Id",
                column: "EXCHANGE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Currency",
                column: "EXCHANGE_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Rate",
                column: "EXCHANGE_RATE",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ExchangeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ExchangeEntityOptions): ExchangeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ExchangeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ExchangeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_EXCHANGE",
            entity: entity,
            key: {
                name: "Id",
                column: "EXCHANGE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ExchangeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_EXCHANGE",
            entity: entity,
            key: {
                name: "Id",
                column: "EXCHANGE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ExchangeCreateEntity | ExchangeUpdateEntity): number {
        const id = (entity as ExchangeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ExchangeUpdateEntity);
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
            table: "CODBEX_EXCHANGE",
            entity: entity,
            key: {
                name: "Id",
                column: "EXCHANGE_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_EXCHANGE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ExchangeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Settings/Exchange", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Settings/Exchange").send(JSON.stringify(data));
    }
}