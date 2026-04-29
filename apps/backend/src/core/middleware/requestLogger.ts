import morgan from 'morgan';
import pino from 'pino';

const logger = pino({ name: 'http' });

export const requestLogger = morgan('dev', {
    stream: {
        write: (message: string) => logger.info(message.trim()),
    },
});
