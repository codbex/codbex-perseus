import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface TimesheetEntity {
    readonly Id: number;
    Name?: string;
    StartPeriod?: Date;
    EndPeriod?: Date;
    ProjectAssignment?: number;
    Hours?: number;
    Rate?: number;
}

export interface TimesheetCreateEntity {
    readonly Name?: string;
    readonly StartPeriod?: Date;
    readonly EndPeriod?: Date;
    readonly ProjectAssignment?: number;
    readonly Hours?: number;
    readonly Rate?: number;
}

export interface TimesheetUpdateEntity extends TimesheetCreateEntity {
    readonly Id: number;
}

export interface TimesheetEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            StartPeriod?: Date | Date[];
            EndPeriod?: Date | Date[];
            ProjectAssignment?: number | number[];
            Hours?: number | number[];
            Rate?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            StartPeriod?: Date | Date[];
            EndPeriod?: Date | Date[];
            ProjectAssignment?: number | number[];
            Hours?: number | number[];
            Rate?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            StartPeriod?: Date;
            EndPeriod?: Date;
            ProjectAssignment?: number;
            Hours?: number;
            Rate?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            StartPeriod?: Date;
            EndPeriod?: Date;
            ProjectAssignment?: number;
            Hours?: number;
            Rate?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            StartPeriod?: Date;
            EndPeriod?: Date;
            ProjectAssignment?: number;
            Hours?: number;
            Rate?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            StartPeriod?: Date;
            EndPeriod?: Date;
            ProjectAssignment?: number;
            Hours?: number;
            Rate?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            StartPeriod?: Date;
            EndPeriod?: Date;
            ProjectAssignment?: number;
            Hours?: number;
            Rate?: number;
        };
    },
    $select?: (keyof TimesheetEntity)[],
    $sort?: string | (keyof TimesheetEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface TimesheetEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<TimesheetEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class TimesheetRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_TIMESHEET",
        properties: [
            {
                name: "Id",
                column: "TIMESHEET_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "TIMESHEET_NAME",
                type: "VARCHAR",
            },
            {
                name: "StartPeriod",
                column: "TIMESHEET_STARTPERIOD",
                type: "DATE",
            },
            {
                name: "EndPeriod",
                column: "TIMESHEET_ENDPERIOD",
                type: "DATE",
            },
            {
                name: "ProjectAssignment",
                column: "TIMESHEET_PROJECTASSIGNMENT",
                type: "INTEGER",
            },
            {
                name: "Hours",
                column: "TIMESHEET_HOURS",
                type: "INTEGER",
            },
            {
                name: "Rate",
                column: "TIMESHEET_RATE",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(TimesheetRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: TimesheetEntityOptions): TimesheetEntity[] {
        return this.dao.list(options).map((e: TimesheetEntity) => {
            EntityUtils.setDate(e, "StartPeriod");
            EntityUtils.setDate(e, "EndPeriod");
            return e;
        });
    }

    public findById(id: number): TimesheetEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartPeriod");
        EntityUtils.setDate(entity, "EndPeriod");
        return entity ?? undefined;
    }

    public create(entity: TimesheetCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartPeriod");
        EntityUtils.setLocalDate(entity, "EndPeriod");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_TIMESHEET",
            entity: entity,
            key: {
                name: "Id",
                column: "TIMESHEET_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: TimesheetUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartPeriod");
        // EntityUtils.setLocalDate(entity, "EndPeriod");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_TIMESHEET",
            entity: entity,
            key: {
                name: "Id",
                column: "TIMESHEET_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: TimesheetCreateEntity | TimesheetUpdateEntity): number {
        const id = (entity as TimesheetUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as TimesheetUpdateEntity);
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
            table: "CODBEX_TIMESHEET",
            entity: entity,
            key: {
                name: "Id",
                column: "TIMESHEET_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_TIMESHEET"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: TimesheetEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Timesheets/Timesheet", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Timesheets/Timesheet").send(JSON.stringify(data));
    }
}