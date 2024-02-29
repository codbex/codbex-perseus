import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PositionEntity {
    readonly Id: number;
    Name?: string;
}

export interface PositionCreateEntity {
    readonly Name?: string;
}

export interface PositionUpdateEntity extends PositionCreateEntity {
    readonly Id: number;
}

export interface PositionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof PositionEntity)[],
    $sort?: string | (keyof PositionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PositionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PositionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PositionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_POSITION",
        properties: [
            {
                name: "Id",
                column: "POSITION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "POSITION_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PositionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PositionEntityOptions): PositionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PositionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PositionCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_POSITION",
            entity: entity,
            key: {
                name: "Id",
                column: "POSITION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PositionUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_POSITION",
            entity: entity,
            key: {
                name: "Id",
                column: "POSITION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PositionCreateEntity | PositionUpdateEntity): number {
        const id = (entity as PositionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PositionUpdateEntity);
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
            table: "CODBEX_POSITION",
            entity: entity,
            key: {
                name: "Id",
                column: "POSITION_ID",
                value: id
            }
        });
    }

    public count(options?: PositionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: PositionEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_POSITION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PositionEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Settings-Position", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Settings/Position").send(JSON.stringify(data));
    }
}