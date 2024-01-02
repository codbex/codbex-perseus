import { Controller, Get } from "@dirigible/http"
import { ProjectTimesheetsReportRepository, ProjectTimesheetsReportFilter, ProjectTimesheetsReportPaginatedFilter } from "../../dao/Reports/ProjectTimesheetsReportRepository";

@Controller
class ProjectTimesheetsReportService {

    private readonly repository = new ProjectTimesheetsReportRepository();

    @Get("/")
    public filter(_: any, ctx: any) {
        const filter: ProjectTimesheetsReportPaginatedFilter = {
            Project: ctx.queryParameters.Project ? parseInt(ctx.queryParameters.Project) : undefined,
            StartPeriod: ctx.queryParameters.StartPeriod ? new Date(parseInt(ctx.queryParameters.StartPeriod)) : undefined,
            EndPeriod: ctx.queryParameters.EndPeriod ? new Date(parseInt(ctx.queryParameters.EndPeriod)) : undefined,
            "$limit": ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
            "$offset": ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
        };

        return this.repository.findAll(filter);
    }

    @Get("/count")
    public count(_: any, ctx: any) {
        const filter: ProjectTimesheetsReportFilter = {
            Project: ctx.queryParameters.Project ? parseInt(ctx.queryParameters.Project) : undefined,
            StartPeriod: ctx.queryParameters.StartPeriod ? new Date(parseInt(ctx.queryParameters.StartPeriod)) : undefined,
            EndPeriod: ctx.queryParameters.EndPeriod ? new Date(parseInt(ctx.queryParameters.EndPeriod)) : undefined,
        };

        const count = this.repository.count(filter);
        return JSON.stringify(count);
    }

}