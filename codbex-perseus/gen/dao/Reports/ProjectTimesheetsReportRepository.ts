import { database } from "@dirigible/db";

export interface ProjectTimesheetsReport {
    readonly Id: number;
    readonly StartDate: Date;
    readonly EndDate: Date;
    readonly Project: number;
}

export interface ProjectTimesheetsReportFilter {
}

export interface ProjectTimesheetsReportPaginatedFilter extends ProjectTimesheetsReportFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class ProjectTimesheetsReportRepository {

    private readonly datasourceName: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: ProjectTimesheetsReportPaginatedFilter): ProjectTimesheetsReport[] {
        const data: ProjectTimesheetsReport[] = [];
        let connection;
        try {
            connection = database.getConnection(this.datasourceName);

            const sql = `
                SELECT PROJECT_NAME, TIMESHEET_NAME, TIMESHEET_HOURS, TIMESHEET_RATE FROM CODBEX_PROJECT, CODBEX_PROJECTASSIGNMENT, CODBEX_TIMESHEET WHERE PROJECT_ID = PROJECTASSIGNMENT_PROJECT   AND PROJECTASSIGNMENT_ID = TIMESHEET_PROJECTASSIGNMENT
            `;

            const statement = connection.prepareStatement(sql);

            let paramIndex = 1;
            if (filter["$limit"]) {
                statement.setInt(paramIndex++, filter["$limit"]);
            }
            if (filter["$offset"]) {
                statement.setInt(paramIndex++, filter["$offset"]);
            }

            const resultSet = statement.executeQuery();
            while (resultSet.next()) {
                data.push({
                    Id: resultSet.getInt("Id"),
                    StartDate: resultSet.getDate("StartDate"),
                    EndDate: resultSet.getDate("EndDate"),
                    Project: resultSet.getInt("Project")
                });
            }
            resultSet.close();
            statement.close();
        } finally {
            if (connection) {
                connection.close();
            }
        }
        return data;
    }

    public count(filter: ProjectTimesheetsReportFilter): number {
        let count = 0;
        let connection;
        try {
            connection = database.getConnection(this.datasourceName);

            const sql = `
                SELECT COUNT(*) AS COUNT FROM "CODBEX_PROJECTTIMESHEETSREPORT"
            `;

            const statement = connection.prepareStatement(sql);

            let paramIndex = 1;

            const resultSet = statement.executeQuery();
            while (resultSet.next()) {
                count = resultSet.getInt(1);
            }
            resultSet.close();
            statement.close();
        } finally {
            if (connection) {
                connection.close();
            }
        }
        return count;
    }
}