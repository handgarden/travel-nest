import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export enum ConfigProperties {
  TypeOrmModuleOptions = 'TypeOrmModuleOptions',
  JwtModuleOptions = 'JWTModuleOptions',
}

export default () => {
  const TypeOrmModuleOptions: TypeOrmModuleOptions = {
    type: (process.env.DATABASE_TYPE as 'mysql') || 'sqlite',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306'),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    autoLoadEntities: true,
    synchronize:
      process.env.DATABASE_SYNCHRONIZE &&
      process.env.DATABASE_SYNCHRONIZE === 'true'
        ? true
        : false,
  };

  const JwtModuleOptions: JwtModuleOptions = {
    secret: process.env.JWT_SECRET || 'secret',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRES_IN || '60s',
    },
  };

  return {
    [ConfigProperties.TypeOrmModuleOptions]: TypeOrmModuleOptions,
    [ConfigProperties.JwtModuleOptions]: JwtModuleOptions,
  };
};
