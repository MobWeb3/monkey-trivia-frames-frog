const DEV_BASE_URL = 'http://localhost:3000';

export const isDev = process.env.MODE === 'dev' ? true : false;

export const BASE_URL = isDev ? DEV_BASE_URL : process.env.PROD_MT_SERVICE_URL;