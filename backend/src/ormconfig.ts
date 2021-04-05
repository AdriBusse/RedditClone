export default {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'readit',
  synchronize: false,
  logging: true,
  entities: [__dirname + '/entities/**/*{.ts,.js}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  subscribers: [__dirname + '/subscribers/**/*{.ts,.js}'],
  seeds: [__dirname + '/seeds/**/*{.ts,.js}'],
  cli: {
    entitiesDir: 'entity',
    migrationsDir: 'migrations',
    subscribersDir: 'subscribers',
  },
};
