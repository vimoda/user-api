declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;

    MONGO_URI: string;
    MONGO_DB?: string;

    JWT_SECRET: string;
    JWT_EXPIRES?: string;

    BCRYPT_SALT?: string;
  }
}
