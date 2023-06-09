import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from '@root/config';
import { redisConnection } from '@services/redis/redis.connection';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.DATABASE_URL!}`)
      .then(() => {
        log.info('Sucessfully conected to dabatabase.');
        //Connect tor redis
        redisConnection.connect();
      })
      .catch((error) => {
        log.error('Error connecting to database.', error);
      });
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
