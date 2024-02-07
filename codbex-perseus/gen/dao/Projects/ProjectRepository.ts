import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ProjectEntity {
    readonly Id: number;
    Name?: string;
    Customer?: number;
    StartDate?: Date;
    EndDate?: Date;
    Company?: number;
}

export interface ProjectCreateEntity {
    readonly Name?: string;
    readonly Customer?: number;
    readonly StartDate?: Date;
    readonly EndDate?: Date;
    readonly Company?: number;
}

export interface ProjectUpdateEntity extends ProjectCreateEntity {
    readonly Id: number;
}

export interface ProjectEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Customer?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
            Company?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Customer?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
            Company?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Customer?: number;
            StartDate?: Date;
            EndDate?: Date;
            Company?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Customer?: number;
            StartDate?: Date;
            EndDate?: Date;
            Company?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Customer?: number;
            StartDate?: Date;
            EndDate?: Date;
            Company?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Customer?: number;
            StartDate?: Date;
            EndDate?: Date;
            Company?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Customer?: number;
            StartDate?: Date;
            EndDate?: Date;
            Company?: number;
        };
    },
    $select?: (keyof ProjectEntity)[],
    $sort?: string | (keyof ProjectEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProjectEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProjectEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ProjectRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PROJECT",
        properties: [
            {
                name: "Id",
                column: "PROJECT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PROJECT_NAME",
                type: "VARCHAR",
            },
            {
                name: "Customer",
                column: "PROJECT_CUSTOMER",
                type: "INTEGER",
            },
            {
                name: "StartDate",
                column: "PROJECT_STARTDATE",
                type: "DATE",
            },
            {
                name: "EndDate",
                column: "PROJECT_ENDDATE",
                type: "DATE",
            },
            {
                name: "Company",
                column: "PROJECT_COMPANY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ProjectRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProjectEntityOptions): ProjectEntity[] {
        return this.dao.list(options).map((e: ProjectEntity) => {
            EntityUtils.setDate(e, "StartDate");
            EntityUtils.setDate(e, "EndDate");
            return e;
        });
    }

    public findById(id: number): ProjectEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartDate");
        EntityUtils.setDate(entity, "EndDate");
        return entity ?? undefined;
    }

    public create(entity: ProjectCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartDate");
        EntityUtils.setLocalDate(entity, "EndDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PROJECT",
            entity: entity,
            key: {
                name: "Id",
                column: "PROJECT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProjectUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartDate");
        // EntityUtils.setLocalDate(entity, "EndDate");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PROJECT",
            entity: entity,
            key: {
                name: "Id",
                column: "PROJECT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProjectCreateEntity | ProjectUpdateEntity): number {
        const id = (entity as ProjectUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProjectUpdateEntity);
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
            table: "CODBEX_PROJECT",
            entity: entity,
            key: {
                name: "Id",
                column: "PROJECT_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }


    private async triggerEvent(data: ProjectEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Projects/Project", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Projects/Project").send(JSON.stringify(data));
    }
}