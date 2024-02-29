import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { CustomerRepository, CustomerEntityOptions } from "../../dao/Partners/CustomerRepository";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-perseus-Partners-Customer", ["validate"]);

@Controller
class CustomerService {

    private readonly repository = new CustomerRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: CustomerEntityOptions = {
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
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-perseus/gen/api/Partners/CustomerService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            return this.repository.findAll(filter);
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
                HttpUtils.sendResponseNotFound("Customer not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
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
                HttpUtils.sendResponseNotFound("Customer not found");
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

    private validateEntity(entity: any): void {
        if (entity.Name.length > 100) {
            throw new ValidationError(`The 'Name' exceeds the maximum length of [100] characters`);
        }
        if (entity.Contact.length > 20) {
            throw new ValidationError(`The 'Contact' exceeds the maximum length of [20] characters`);
        }
        if (entity.Email.length > 100) {
            throw new ValidationError(`The 'Email' exceeds the maximum length of [100] characters`);
        }
        if (entity.Phone.length > 20) {
            throw new ValidationError(`The 'Phone' exceeds the maximum length of [20] characters`);
        }
        if (entity.Address.length > 200) {
            throw new ValidationError(`The 'Address' exceeds the maximum length of [200] characters`);
        }
        if (entity.PostCode.length > 20) {
            throw new ValidationError(`The 'PostCode' exceeds the maximum length of [20] characters`);
        }
        if (entity.City.length > 100) {
            throw new ValidationError(`The 'City' exceeds the maximum length of [100] characters`);
        }
        if (entity.Country.length > 100) {
            throw new ValidationError(`The 'Country' exceeds the maximum length of [100] characters`);
        }
        if (entity.IBAN.length > 34) {
            throw new ValidationError(`The 'IBAN' exceeds the maximum length of [34] characters`);
        }
        if (entity.VATNO.length > 20) {
            throw new ValidationError(`The 'VATNO' exceeds the maximum length of [20] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }
}
