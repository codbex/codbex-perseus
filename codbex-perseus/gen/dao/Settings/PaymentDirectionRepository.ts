import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface PaymentDirectionEntity {
    readonly Id: number;
    Name?: string;
}

export interface PaymentDirectionCreateEntity {
    readonly Name?: string;
}

export interface PaymentDirectionUpdateEntity extends PaymentDirectionCreateEntity {
    readonly Id: number;
}

export interface PaymentDirectionEntityOptions {
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
    $select?: (keyof PaymentDirectionEntity)[],
    $sort?: string | (keyof PaymentDirectionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface PaymentDirectionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<PaymentDirectionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class PaymentDirectionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PAYMENTDIRECTION",
        properties: [
            {
                name: "Id",
                column: "PAYMENTDIRECTION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "PAYMENTDIRECTION_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(PaymentDirectionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: PaymentDirectionEntityOptions): PaymentDirectionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): PaymentDirectionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: PaymentDirectionCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PAYMENTDIRECTION",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTDIRECTION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: PaymentDirectionUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PAYMENTDIRECTION",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTDIRECTION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: PaymentDirectionCreateEntity | PaymentDirectionUpdateEntity): number {
        const id = (entity as PaymentDirectionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as PaymentDirectionUpdateEntity);
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
            table: "CODBEX_PAYMENTDIRECTION",
            entity: entity,
            key: {
                name: "Id",
                column: "PAYMENTDIRECTION_ID",
                value: id
            }
        });
    }

    public count(options?: PaymentDirectionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: PaymentDirectionEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PAYMENTDIRECTION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: PaymentDirectionEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-perseus/Settings/PaymentDirection", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-perseus/Settings/PaymentDirection").send(JSON.stringify(data));
    }
}