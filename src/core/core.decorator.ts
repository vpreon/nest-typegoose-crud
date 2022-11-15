import { Inject } from "@nestjs/common";

export const InjectModel = (model) => Inject(model.name);
