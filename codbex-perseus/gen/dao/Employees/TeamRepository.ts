import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface TeamEntity {
    readonly Id: number;
    Name?: string;
    Company?: number;
}

export interface TeamCreateEntity {
    readonly Name?: string;
    readonly Company?: number;
}

export interface TeamUpdateEntity extends TeamCreateEntity {
    readonly Id: number;
}

export interface TeamEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Company?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Company?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Company?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Company?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Company?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Company?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Company?: number;
        };
    },
    $select?: (keyof TeamEntity)[],
    $sort?: string | (keyof TeamEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface TeamEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<TeamEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class TeamRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_TEAM",
        properties: [
            {
                name: "Id",
                column: "TEAM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "TEAM_NAME",
                type: "VARCHAR",
            },
            {
                name: "Company",
                column: "TEAM_COMPANY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(TeamRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: TeamEntityOptions): TeamEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): TeamEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: TeamCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_TEAM",
            entity: entity,
            key: {
                name: "Id",
                column: "TEAM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: TeamUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_TEAM",
            entity: entity,
            key: {
                name: "Id",
                column: "TEAM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: TeamCreateEntity | TeamUpdateEntity): number {
        const id = (entity as TeamUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as TeamUpdateEntity);
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
            table: "CODBEX_TEAM",
            entity: entity,
            key: {
                name: "Id",
                column: "TEAM_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_TEAM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: TeamEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Employees/Team", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Employees/Team").send(JSON.stringify(data));
    }
}