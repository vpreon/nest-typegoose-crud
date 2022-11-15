import { DynamicModule, Global, Module } from "@nestjs/common";
import { TYPEGOOSE_CONNECTION_OPTIONS } from "./core.constant";
import * as mongoose from "mongoose";
import { getModelForClass } from "@typegoose/typegoose";

@Global()
@Module({})
export class TypegooseModule {
  static forRootAsync(options): DynamicModule {
    const asyncProvider = {
      provide: TYPEGOOSE_CONNECTION_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || []
    };

    const connectionProvider = {
      provide: options.connectionName,
      useFactory: (connectionOptions) => {
        const { uri, ...typegooseOptions } = connectionOptions;
        return mongoose.createConnection(uri, typegooseOptions);
      },
      inject: [TYPEGOOSE_CONNECTION_OPTIONS]
    };

    return {
      module: TypegooseModule,
      imports: options.imports,
      providers: [asyncProvider, connectionProvider],
      exports: [connectionProvider]
    };
  }
}

@Module({})
export class CoreTypegooseModule {
  static forRootAsync(options): DynamicModule {
    return {
      module: CoreTypegooseModule,
      imports: [TypegooseModule.forRootAsync(options)]
    };
  }

  static forFeature(models, connectionName): DynamicModule {
    const buildProvider = ({ name }, modelFactory) => ({
      provide: name,
      useFactory: modelFactory,
      inject: [connectionName]
    });

    const providers = models.map(({ typegooseClass, schemaOptions }) => {
      const modelFactory = (connection) =>
        getModelForClass(typegooseClass, { existingConnection: connection, schemaOptions });
      return buildProvider(typegooseClass, modelFactory);
    });

    return {
      module: CoreTypegooseModule,
      exports: providers
    };
  }
}
