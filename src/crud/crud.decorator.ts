import { PARAMTYPES_METADATA } from "@nestjs/common/constants";
import { get, merge } from "lodash";
import { CrudOptionsWithModel } from "./crud.interface";
import { CrudConfig } from "./crud.config";
import { CreateUpdateQueryDto, CrudPlaceholderDto, ICrudQuery } from "./crud.dto";
import { BaseCrudController } from "./crud.controller";
import { capitalize } from "./crud.helper";

const CRUD_ROUTES = {
  config: "config",
  find: "find",
  findOne: "findOne",
  create: "create",
  update: "update",
  patch: "patch",
  delete: "delete"
};
const allMethods = Object.values(CRUD_ROUTES);

export function cloneDecorators(from, to) {
  Reflect.getMetadataKeys(from).forEach((key) => {
    const value = Reflect.getMetadata(key, from);
    Reflect.defineMetadata(key, value, to);
  });
}

export function clonePropDecorators(from, to, name) {
  Reflect.getMetadataKeys(from, name).forEach((key) => {
    const value = Reflect.getMetadata(key, from, name);
    Reflect.defineMetadata(key, value, to, name);
  });
}

export const Crud = (options: CrudOptionsWithModel) => {
  options = merge({}, CrudConfig.options, options);
  return (target) => {
    const Controller = target;
    const controller = target.prototype;
    const crudController = new BaseCrudController(options.model);
    controller.crudOptions = options;

    const methods = allMethods.filter((v) => get(options, `routes.${v}`) !== false);
    for (const method of methods) {
      if (controller[method]) {
        continue;
      }
      controller[method] = function (...args) {
        return crudController[method].apply(this, args);
      };

      Object.defineProperty(controller[method], "name", {
        value: method
      });
      // clone instance decorators
      cloneDecorators(crudController, controller);
      cloneDecorators(crudController[method], controller[method]);
      // clone instance method decorators
      clonePropDecorators(crudController, controller, method);
      // clone class "method" decorators
      clonePropDecorators(BaseCrudController, Controller, method);

      Reflect.defineMetadata(
        "swagger/apiOperation",
        { summary: ` ${capitalize(method)} ${options.model.name}` },
        controller[method]
      );
      // get exists param types
      const types: [] = Reflect.getMetadata(PARAMTYPES_METADATA, controller, method);

      Reflect.decorate(
        [
          // replace fake dto to real dto
          Reflect.metadata(
            PARAMTYPES_METADATA,
            types.map((v: any) => {
              if (get(v, "name") === CrudPlaceholderDto.name) {
                return get(options, `routes.${method}.dto`, options.model);
              }

              if (get(v, "name") === CreateUpdateQueryDto.name) {
                return get(options, `routes.${method}.query`, CreateUpdateQueryDto);
              }

              if (get(v, "name") === ICrudQuery.name) {
                return get(options, `routes.${method}.query`, ICrudQuery);
              }

              return v;
            })
          ),
          ...get(options, `routes.${method}.decorators`, [])
        ],
        controller,
        method,
        Object.getOwnPropertyDescriptor(controller, method)
      );
    }
  };
};
