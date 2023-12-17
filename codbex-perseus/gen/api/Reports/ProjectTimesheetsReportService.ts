import { Controller, Get } from "@dirigible/http"
import { ProjectTimesheetsReportRepository, ProjectTimesheetsReportFilter, ProjectTimesheetsReportPaginatedFilter } from "../../dao/entities/ProjectTimesheetsReportRepository";

@Controller
class ProjectTimesheetsReportService {

    private readonly repository = new ProjectTimesheetsReportRepository();

    @Get("/")
    public filter(_, ctx) {
        const filter: ProjectTimesheetsReportPaginatedFilter = {
            "$limit": ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
            "$offset": ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
        };

        return this.repository.findAll(filter);
    }

    @Get("/count")
    public count(_, ctx) {
        const filter: ProjectTimesheetsReportFilter = {
        };

        const count = this.repository.count(filter);
        return JSON.stringify(count);
    }

}