export interface PaginateKeys {
  data?: string;
  total?: string;
  lastPage?: string;
  currentPage?: string;
}

export interface CrudRoute {
  decorators?: MethodDecorator[];
}

export interface CrudRouteWithDto extends CrudRoute {
  dto?: any;
  query?: any;
  transform?: (data: any) => any;
}

export interface CrudRouteForFind extends CrudRoute {
  paginate?: PaginateKeys | false;
  limit?: number;
  populate?: string | any;
  sort?: string | any;
  where?: any;
  query?: any;
}

export interface CrudRouteForFindOne extends CrudRoute {
  populate?: string | any;
  where?: any;
  select?: any;
}

export interface CrudRoutes {
  find?: CrudRouteForFind | null;
  findOne?: CrudRouteForFindOne | null;
  create?: CrudRouteWithDto | null;
  update?: CrudRouteWithDto | null;
  delete?: CrudRoute | null;
  patch?: CrudRouteWithDto | null;
}

export interface CrudOptions {
  routes?: CrudRoutes;
}

export interface CrudOptionsWithModel extends CrudOptions {
  name?: string | string[];
  model: any;
}
