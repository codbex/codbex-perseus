import { database } from "@dirigible/db";

export interface ProjectTimesheetsReport {
    readonly Project: string;
    readonly TotalHours: number;
    readonly AverageRate: number;
    readonly Total: number;
}

export interface ProjectTimesheetsReportFilter {
    readonly Project: number;
    readonly StartPeriod: Date;
    readonly EndPeriod: Date;
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
                select PROJECT_NAME as "Project",     sum(TIMESHEET_HOURS) as "TotalHours",     convert(avg(TIMESHEET_RATE), float) as "AverageRate",     convert(sum(TIMESHEET_HOURS * TIMESHEET_RATE), float) AS "Total" from CODBEX_PROJECT, CODBEX_PROJECTASSIGNMENT, CODBEX_TIMESHEET where PROJECT_ID = PROJECTASSIGNMENT_PROJECT and PROJECTASSIGNMENT_ID = TIMESHEET_PROJECTASSIGNMENT ${     filter.Project && filter.StartPeriod && filter.EndPeriod ?         'and PROJECT_ID = ? and TIMESHEET_STARTPERIOD >= ? and TIMESHEET_ENDPERIOD <= ?'     :     filter.Project && filter.StartPeriod ?         'and PROJECT_ID = ? and TIMESHEET_STARTPERIOD >= ?'     :     filter.Project && filter.EndPeriod ?         'and PROJECT_ID = ? and TIMESHEET_ENDPERIOD <= ?'     :     filter.StartPeriod && filter.EndPeriod ?         'and TIMESHEET_STARTPERIOD >= ? and TIMESHEET_ENDPERIOD <= ?'     :     filter.Project ?         'and PROJECT_ID = ?'     :     filter.StartPeriod ?         'and TIMESHEET_STARTPERIOD >= ?'     :     filter.EndPeriod ?         'and TIMESHEET_ENDPERIOD <= ?'     :         '' } group by PROJECT_NAME ${     filter["$limit"] && filter["$offset"] ?         'limit ? offset ?'     :     filter["$limit"] ?         'limit ?'     :     filter["$offset"] ?         'offset ?'     :         '' }
            `;

            const statement = connection.prepareStatement(sql);

            let paramIndex = 1;
            if (filter.Project) {
                statement.setInt(paramIndex++, filter.Project);
            }
            if (filter.StartPeriod) {
                statement.setDate(paramIndex++, filter.StartPeriod);
            }
            if (filter.EndPeriod) {
                statement.setDate(paramIndex++, filter.EndPeriod);
            }
            if (filter["$limit"]) {
                statement.setInt(paramIndex++, filter["$limit"]);
            }
            if (filter["$offset"]) {
                statement.setInt(paramIndex++, filter["$offset"]);
            }

            const resultSet = statement.executeQuery();
            while (resultSet.next()) {
                data.push({
                    Project: resultSet.getString("Project"),
                    TotalHours: resultSet.getInt("TotalHours"),
                    AverageRate: resultSet.getDouble("AverageRate"),
                    Total: resultSet.getDouble("Total")
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
                select count(*) from (     select PROJECT_NAME as "Project",         sum(TIMESHEET_HOURS) as "TotalHours",         convert(avg(TIMESHEET_RATE), float) as "AverageRate",         convert(sum(TIMESHEET_HOURS * TIMESHEET_RATE), float) AS "Total"     from CODBEX_PROJECT, CODBEX_PROJECTASSIGNMENT, CODBEX_TIMESHEET     where PROJECT_ID = PROJECTASSIGNMENT_PROJECT and PROJECTASSIGNMENT_ID = TIMESHEET_PROJECTASSIGNMENT     ${         filter.Project && filter.StartPeriod && filter.EndPeriod ?             'and PROJECT_ID = ? and TIMESHEET_STARTPERIOD >= ? and TIMESHEET_ENDPERIOD <= ?'         :         filter.Project && filter.StartPeriod ?             'and PROJECT_ID = ? and TIMESHEET_STARTPERIOD >= ?'         :         filter.Project && filter.EndPeriod ?             'and PROJECT_ID = ? and TIMESHEET_ENDPERIOD <= ?'         :         filter.StartPeriod && filter.EndPeriod ?             'and TIMESHEET_STARTPERIOD >= ? and TIMESHEET_ENDPERIOD <= ?'         :         filter.Project ?             'and PROJECT_ID = ?'         :         filter.StartPeriod ?             'and TIMESHEET_STARTPERIOD >= ?'         :         filter.EndPeriod ?             'and TIMESHEET_ENDPERIOD <= ?'         :             ''     }     group by PROJECT_NAME )
            `;

            const statement = connection.prepareStatement(sql);

            let paramIndex = 1;
            if (filter.Project) {
                statement.setInt(paramIndex++, filter.Project);
            }
            if (filter.StartPeriod) {
                statement.setDate(paramIndex++, filter.StartPeriod);
            }
            if (filter.EndPeriod) {
                statement.setDate(paramIndex++, filter.EndPeriod);
            }

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