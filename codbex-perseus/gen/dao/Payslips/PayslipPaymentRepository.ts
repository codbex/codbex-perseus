import { query } from "@dirigible/db";
import { producer } from "@dirigible/messaging";
import { extensions } from "@dirigible/extensions";
import { dao as daoApi } from "@dirigible/db";

export interface PayslipPaymentEntity {
    readonly Id: number;
    Payslip?: number;
    Payment?: number;
    Amount?: number;
}

export interface PayslipPaymentCreateEntity {
    readonly Payslip?: number;
    readonly Payment?: number;
    readonly Amount?: number;
}

export interface PayslipPaymentUpdateEntity extends PayslipPaymentCreateEntity {
    readonly Id: number;
}

export interface PayslipPaymentEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Payslip?: number | number[];
            Payment?: number | number[];
            Amount?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Payslip?: number | number[];
            Payment?: number | number[];
            Amount?: number | number[];
        };
        contains?: {
            Id?: number;
            Payslip?: number;
            Payment?: number;
            Amount?: number;
        };
        greaterThan?: {
            Id?: number;
            Payslip?: number;
            Payment?: number;
            Amount?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Payslip?: number;
            Payment?: number;
            Amount?: number;
        };
        lessThan?: {
            Id?: number;
            Payslip?: number;
            Payment?: number;
            Amount?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Payslip?: number;
            Payment?: number;
            Amount?: number;
        };
    },
    $select?: (keyof PayslipPaymentEntity)[],
    $sort?: string | (keyof PayslipPaymentEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PayslipPaymentEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PayslipPaymentEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PayslipPaymentRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYSLIPPAYMENT",
        properties: [
            {
                name: "Id",
                column: "PAYSLIPPAYMENT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Payslip",
                column: "PAYSLIPPAYMENT_PAYSLIP",
                type: "INTEGER",
            },
            {
                name: "Payment",
                column: "PAYSLIPPAYMENT_PAYMENT",
                type: "INTEGER",
            },
            {
                name: "Amount",
                column: "PAYSLIPPAYMENT_AMOUNT",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PayslipPaymentRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PayslipPaymentEntityOptions): PayslipPaymentEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PayslipPaymentEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PayslipPaymentCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYSLIPPAYMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIPPAYMENT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PayslipPaymentUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYSLIPPAYMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIPPAYMENT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PayslipPaymentCreateEntity | PayslipPaymentUpdateEntity): number {
        const id = (entity as PayslipPaymentUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PayslipPaymentUpdateEntity);
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
            table: "CODBEX_PAYSLIPPAYMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYSLIPPAYMENT_ID",
                value: id
            }
        });
    }

    public count(): number {
        return this.dao.count();
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYSLIPPAYMENT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }


    private async triggerEvent(data: PayslipPaymentEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Payslips/PayslipPayment", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-perseus/Payslips/PayslipPayment").send(JSON.stringify(data));
    }
}