import { Controller, Get, Post, Put, Delete, response } from "@dirigible/http"
import { PurchaseInvoicePaymentRepository, PurchaseInvoicePaymentEntityOptions } from "../../dao/PurchaseInvoices/PurchaseInvoicePaymentRepository";
import { HttpUtils } from "../utils/HttpUtils";

@Controller
class PurchaseInvoicePaymentService {

    private readonly repository = new PurchaseInvoicePaymentRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: PurchaseInvoicePaymentEntityOptions = {
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
            response.setHeader("Content-Location", "/services/ts/codbex-perseus/gen/api/PurchaseInvoices/PurchaseInvoicePaymentService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count/:PurchaseInvoice")
    public count(_: any, ctx: any) {
        try {
            let PurchaseInvoice = parseInt(ctx.pathParameters.PurchaseInvoice);
            PurchaseInvoice = isNaN(PurchaseInvoice) ? ctx.pathParameters.PurchaseInvoice : PurchaseInvoice;
            return this.repository.count(PurchaseInvoice);
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
                HttpUtils.sendResponseNotFound("PurchaseInvoicePayment not found");
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
                HttpUtils.sendResponseNotFound("PurchaseInvoicePayment not found");
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
