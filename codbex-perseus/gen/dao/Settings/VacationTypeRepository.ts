import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface VacationTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface VacationTypeCreateEntity {
    readonly Name?: string;
}

export interface VacationTypeUpdateEntity extends VacationTypeCreateEntity {
    readonly Id: number;
}

export interface VacationTypeEntityOptions {
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
    $select?: (keyof VacationTypeEntity)[],
    $sort?: string | (keyof VacationTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface VacationTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<VacationTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class VacationTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_VACATIONTYPE",
        properties: [
            {
                name: "Id",
                column: "VACATIONTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "VACATIONTYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(VacationTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: VacationTypeEntityOptions): VacationTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): VacationTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: VacationTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_VACATIONTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "VACATIONTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: VacationTypeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_VACATIONTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "VACATIONTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: VacationTypeCreateEntity | VacationTypeUpdateEntity): number {
        const id = (entity as VacationTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as VacationTypeUpdateEntity);
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
            table: "CODBEX_VACATIONTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "VACATIONTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: VacationTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: VacationTypeEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_VACATIONTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: VacationTypeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Settings-VacationType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Settings/VacationType").send(JSON.stringify(data));
    }
}