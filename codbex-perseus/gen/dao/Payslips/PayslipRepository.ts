import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface PayslipEntity {
    readonly Id: number;
    Name?: string;
    Employee?: number;
    Company?: number;
    StartDate?: Date;
    EndDate?: Date;
    Currency?: number;
    Net?: number;
    Gross?: number;
    Total?: number;
}

export interface PayslipCreateEntity {
    readonly Name?: string;
    readonly Employee?: number;
    readonly Company?: number;
    readonly StartDate?: Date;
    readonly EndDate?: Date;
    readonly Currency?: number;
    readonly Net?: number;
    readonly Gross?: number;
    readonly Total?: number;
}

export interface PayslipUpdateEntity extends PayslipCreateEntity {
    readonly Id: number;
}

export interface PayslipEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Employee?: number | number[];
            Company?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
            Currency?: number | number[];
            Net?: number | number[];
            Gross?: number | number[];
            Total?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Employee?: number | number[];
            Company?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
            Currency?: number | number[];
            Net?: number | number[];
            Gross?: number | number[];
            Total?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            StartDate?: Date;
            EndDate?: Date;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            StartDate?: Date;
            EndDate?: Date;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            StartDate?: Date;
            EndDate?: Date;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            StartDate?: Date;
            EndDate?: Date;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Employee?: number;
            Company?: number;
            StartDate?: Date;
            EndDate?: Date;
            Currency?: number;
            Net?: number;
            Gross?: number;
            Total?: number;
        };
    },
    $select?: (keyof PayslipEntity)[],
    $sort?: string | (keyof PayslipEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PayslipEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PayslipEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PayslipRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYSLIP",
        properties: [
            {
                name: "Id",
                column: "PAYSLIP_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PAYSLIP_NAME",
                type: "VARCHAR",
            },
            {
                name: "Employee",
                column: "PAYSLIP_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "PAYSLIP_COMPANY",
                type: "INTEGER",
            },
            {
                name: "StartDate",
                column: "PAYSLIP_STARTDATE",
                type: "DATE",
            },
            {
                name: "EndDate",
                column: "PAYSLIP_ENDDATE",
                type: "DATE",
            },
            {
                name: "Currency",
                column: "PAYSLIP_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Net",
                column: "PAYSLIP_NET",
                type: "DOUBLE",
            },
            {
                name: "Gross",
                column: "PAYSLIP_GROSS",
                type: "DOUBLE",
            },
            {
                name: "Total",
                column: "PAYSLIP_TOTAL",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PayslipRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PayslipEntityOptions): PayslipEntity[] {
        return this.dao.list(options).map((e: PayslipEntity) => {
            EntityUtils.setDate(e, "StartDate");
            EntityUtils.setDate(e, "EndDate");
            return e;
        });
    }

    public findById(id: number): PayslipEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartDate");
        EntityUtils.setDate(entity, "EndDate");
        return entity ?? undefined;
    }

    public create(entity: PayslipCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartDate");
        EntityUtils.setLocalDate(entity, "EndDate");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYSLIP",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIP_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PayslipUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "StartDate");
        // EntityUtils.setLocalDate(entity, "EndDate");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYSLIP",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIP_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PayslipCreateEntity | PayslipUpdateEntity): number {
        const id = (entity as PayslipUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PayslipUpdateEntity);
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
            table: "CODBEX_PAYSLIP",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIP_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYSLIP"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PayslipEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Payslips/Payslip", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Payslips/Payslip").send(JSON.stringify(data));
    }
}