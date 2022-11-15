import { Body, Delete, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { BaseCrudService, FindParams } from "./crud.service";
import { CrudOptionsWithModel, PaginateKeys } from "./crud.interface";
import { CreateUpdateQueryDto, CrudDto, CrudPlaceholderDto, GetQuery, ICrudQuery } from "./crud.dto";
import { defaultPaginate } from "./crud.config";

export class CrudController {
  constructor(public model: BaseCrudService) {}

  performFind(options?: FindParams) {
    return this.model.find(options);
  }

  performFindOne(id, populate, select) {
    return this.model.findOne({ id, populate, select });
  }

  performCreate({ body, populate }) {
    return this.model.create(body, populate);
  }

  async performUpdate({ id, body, populate }) {
    return this.model.update(id, body, populate);
  }

  performDelete(id) {
    return this.model.delete({ _id: id });
  }
}

export class BaseCrudController extends CrudController {
  constructor(public model: BaseCrudService, public crudOptions?: CrudOptionsWithModel) {
    super(model);
  }

  @Get()
  @ApiOperation({ summary: "Find all records" })
  @ApiOkResponse({ type: CrudDto })
  async find(@Query() query: ICrudQuery): Promise<CrudDto> {
    const {
      where = this.crudOptions?.routes?.find?.where || {},
      limit = this.crudOptions?.routes?.find?.limit || 10,
      page = 1,
      skip = 0,
      populate = this.crudOptions?.routes?.find?.populate || undefined,
      sort = this.crudOptions?.routes.find.sort,
      select = undefined
    } = query;

    const paginateKeys: PaginateKeys | false = this.crudOptions?.routes?.find?.paginate || defaultPaginate;

    return this.performFind({ where, populate, page, skip, limit, sort, paginateKeys, select });
  }

  @Get(":id")
  @ApiOperation({ summary: "Find a record" })
  async findOne(@Param("id") id: string, @Query() query: GetQuery) {
    const {
      populate = this.crudOptions?.routes?.findOne?.populate || undefined,
      select = this.crudOptions?.routes?.findOne?.select || undefined
    } = query;
    return this.performFindOne(id, populate, select);
  }

  @Post()
  @ApiOperation({ summary: "Create a record" })
  async create(@Body() body: CrudPlaceholderDto, @Query() query: CreateUpdateQueryDto) {
    const transform = this.crudOptions?.routes?.create?.transform;
    const { populate = undefined } = query;
    if (transform) body = transform(body);

    return this.performCreate({ body, populate });
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a record" })
  async update(@Param("id") id: string, @Body() body: CrudPlaceholderDto, @Query() query: CreateUpdateQueryDto) {
    const transform = this.crudOptions?.routes?.update?.transform;
    const { populate = undefined } = query;
    if (transform) body = transform(body);

    return this.performUpdate({ id, body, populate });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Patch a record" })
  async patch(@Param("id") id: string, @Body() body: any, @Query() query: CreateUpdateQueryDto) {
    const { populate = undefined } = query;

    return this.performUpdate({ id, body, populate });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a record" })
  async delete(@Param("id") id: string) {
    return this.performDelete(id);
  }
}
