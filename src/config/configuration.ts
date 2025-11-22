export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3000', 10),
  },

  mongo: {
    uri: process.env.MONGO_URI ?? '',
    dbName: process.env.MONGO_DB ?? 'users_db',
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    issuer: process.env.JWT_ISSUER ?? 'http://localhost:3001',
    audience: process.env.JWT_AUDIENCE ?? 'users-api',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },

  realms: {
    default: {
      name: 'default',
      issuer: process.env.JWT_ISSUER ?? 'http://localhost:3001',
      audience: process.env.JWT_AUDIENCE ?? 'users-api',
      accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH ?? 'keys/private.pem',
      publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH ?? 'keys/public.pem',
    },
    'users-api': {
      name: 'users-api',
      issuer: process.env.JWT_ISSUER ?? 'http://localhost:3001',
      audience: process.env.JWT_AUDIENCE ?? 'users-api',
      accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
      privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH ?? 'keys/private.pem',
      publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH ?? 'keys/public.pem',
    },
    // Puedes agregar más reinos aquí
    // admin: {
    //   name: 'admin',
    //   issuer: 'http://admin.example.com',
    //   audience: 'admin-api',
    //   accessTokenExpiresIn: '5m',
    //   refreshTokenExpiresIn: '1d',
    //   privateKeyPath: 'keys/admin-private.pem',
    //   publicKeyPath: 'keys/admin-public.pem',
    // }
  },

  bcrypt: {
    salt: parseInt(process.env.BCRYPT_SALT ?? '10', 10),
  },
});
