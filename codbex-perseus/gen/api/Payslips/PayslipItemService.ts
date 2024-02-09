import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { PayslipItemRepository, PayslipItemEntityOptions } from "../../dao/Payslips/PayslipItemRepository";
import { HttpUtils } from "../utils/HttpUtils";

@Controller
class PayslipItemService {

    private readonly repository = new PayslipItemRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: PayslipItemEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-perseus/gen/api/Payslips/PayslipItemService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count/:Payslip")
    public count(_: any, ctx: any) {
        try {
            let Payslip = parseInt(ctx.pathParameters.Payslip);
            Payslip = isNaN(Payslip) ? ctx.pathParameters.Payslip : Payslip;
            return this.repository.count(Payslip);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity
            } else {
                HttpUtils.sendResponseNotFound("PayslipItem not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("PayslipItem not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }
}
