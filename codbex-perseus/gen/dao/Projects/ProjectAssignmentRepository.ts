import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface ProjectAssignmentEntity {
    readonly Id: number;
    Name?: string;
    Employee?: number;
    Project?: number;
    Position?: number;
    HourlyRate?: number;
    StartDate?: Date;
    EndDate?: Date;
}

export interface ProjectAssignmentCreateEntity {
    readonly Name?: string;
    readonly Employee?: number;
    readonly Project?: number;
    readonly Position?: number;
    readonly HourlyRate?: number;
    readonly StartDate?: Date;
    readonly EndDate?: Date;
}

export interface ProjectAssignmentUpdateEntity extends ProjectAssignmentCreateEntity {
    readonly Id: number;
}

export interface ProjectAssignmentEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Employee?: number | number[];
            Project?: number | number[];
            Position?: number | number[];
            HourlyRate?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Employee?: number | number[];
            Project?: number | number[];
            Position?: number | number[];
            HourlyRate?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Project?: number;
            Position?: number;
            HourlyRate?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Project?: number;
            Position?: number;
            HourlyRate?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Project?: number;
            Position?: number;
            HourlyRate?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Project?: number;
            Position?: number;
            HourlyRate?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Project?: number;
            Position?: number;
            HourlyRate?: number;
            StartDate?: Date;
            EndDate?: Date;
        };
    },
    $select?: (keyof ProjectAssignmentEntity)[],
    $sort?: string | (keyof ProjectAssignmentEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface ProjectAssignmentEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProjectAssignmentEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class ProjectAssignmentRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PROJECTASSIGNMENT",
        properties: [
            {
                name: "Id",
                column: "PROJECTASSIGNMENT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PROJECTASSIGNMENT_NAME",
                type: "VARCHAR",
            },
            {
                name: "Employee",
                column: "PROJECTASSIGNMENT_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "Project",
                column: "PROJECTASSIGNMENT_PROJECT",
                type: "INTEGER",
            },
            {
                name: "Position",
                column: "PROJECTASSIGNMENT_POSITION",
                type: "INTEGER",
            },
            {
                name: "HourlyRate",
                column: "PROJECTASSIGNMENT_HOURLYRATE",
                type: "DOUBLE",
            },
            {
                name: "StartDate",
                column: "PROJECTASSIGNMENT_STARTDATE",
                type: "DATE",
            },
            {
                name: "EndDate",
                column: "PROJECTASSIGNMENT_ENDDATE",
                type: "DATE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(ProjectAssignmentRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: ProjectAssignmentEntityOptions): ProjectAssignmentEntity[] {
        return this.dao.list(options).map((e: ProjectAssignmentEntity) => {
            EntityUtils.setDate(e, "StartDate");
            EntityUtils.setDate(e, "EndDate");
            return e;
        });
    }

    public findById(id: number): ProjectAssignmentEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartDate");
        EntityUtils.setDate(entity, "EndDate");
        return entity ?? undefined;
    }

    public create(entity: ProjectAssignmentCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartDate");
        EntityUtils.setLocalDate(entity, "EndDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PROJECTASSIGNMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PROJECTASSIGNMENT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProjectAssignmentUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartDate");
        // EntityUtils.setLocalDate(entity, "EndDate");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PROJECTASSIGNMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PROJECTASSIGNMENT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProjectAssignmentCreateEntity | ProjectAssignmentUpdateEntity): number {
        const id = (entity as ProjectAssignmentUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProjectAssignmentUpdateEntity);
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
            table: "CODBEX_PROJECTASSIGNMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PROJECTASSIGNMENT_ID",
                value: id
            }
        });
    }

    public count(options?: ProjectAssignmentEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: ProjectAssignmentEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECTASSIGNMENT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProjectAssignmentEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus-Projects-ProjectAssignment", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Projects/ProjectAssignment").send(JSON.stringify(data));
    }
}