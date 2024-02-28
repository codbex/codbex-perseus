import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface VacationEntity {
    readonly Id: number;
    Date?: Date;
    Employee?: number;
    Reason?: string;
    Ratio?: number;
    VacationTypeId?: number;
}

export interface VacationCreateEntity {
    readonly Date?: Date;
    readonly Employee?: number;
    readonly Reason?: string;
    readonly Ratio?: number;
    readonly VacationTypeId?: number;
}

export interface VacationUpdateEntity extends VacationCreateEntity {
    readonly Id: number;
}

export interface VacationEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Employee?: number | number[];
            Reason?: string | string[];
            Ratio?: number | number[];
            VacationTypeId?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Employee?: number | number[];
            Reason?: string | string[];
            Ratio?: number | number[];
            VacationTypeId?: number | number[];
        };
        contains?: {
            Id?: number;
            Date?: Date;
            Employee?: number;
            Reason?: string;
            Ratio?: number;
            VacationTypeId?: number;
        };
        greaterThan?: {
            Id?: number;
            Date?: Date;
            Employee?: number;
            Reason?: string;
            Ratio?: number;
            VacationTypeId?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Employee?: number;
            Reason?: string;
            Ratio?: number;
            VacationTypeId?: number;
        };
        lessThan?: {
            Id?: number;
            Date?: Date;
            Employee?: number;
            Reason?: string;
            Ratio?: number;
            VacationTypeId?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Employee?: number;
            Reason?: string;
            Ratio?: number;
            VacationTypeId?: number;
        };
    },
    $select?: (keyof VacationEntity)[],
    $sort?: string | (keyof VacationEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface VacationEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<VacationEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class VacationRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_VACATION",
        properties: [
            {
                name: "Id",
                column: "VACATION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Date",
                column: "VACATION_DATE",
                type: "DATE",
            },
            {
                name: "Employee",
                column: "VACATION_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "Reason",
                column: "VACATION_REASON",
                type: "VARCHAR",
            },
            {
                name: "Ratio",
                column: "VACATION_RATIO",
                type: "INTEGER",
            },
            {
                name: "VacationTypeId",
                column: "VACATION_VACATIONTYPEID",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(VacationRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: VacationEntityOptions): VacationEntity[] {
        return this.dao.list(options).map((e: VacationEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): VacationEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: VacationCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_VACATION",
            entity: entity,
            key: {
                name: "Id",
                column: "VACATION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: VacationUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_VACATION",
            entity: entity,
            key: {
                name: "Id",
                column: "VACATION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: VacationCreateEntity | VacationUpdateEntity): number {
        const id = (entity as VacationUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as VacationUpdateEntity);
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
            table: "CODBEX_VACATION",
            entity: entity,
            key: {
                name: "Id",
                column: "VACATION_ID",
                value: id
            }
        });
    }

    public count(options?: VacationEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: VacationEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_VACATION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: VacationEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Employees/Vacation", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Employees/Vacation").send(JSON.stringify(data));
    }
}