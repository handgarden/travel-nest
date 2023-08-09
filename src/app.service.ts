import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {
    const logger = new Logger('INFO');
    const port = process.env.PORT || 3000;
    // initialize
    logger.log(
      '\n' +
        '\n' +
        ' ███╗   ██╗███████╗███████╗████████╗  ██╗███████╗ \n ' +
        '████╗  ██║██╔════╝██╔════╝╚══██╔══╝  ██║██╔════╝ \n ' +
        '██╔██╗ ██║█████╗  ███████╗   ██║     ██║███████╗ \n ' +
        '██║╚██╗██║██╔══╝  ╚════██║   ██║██   ██║╚════██║ \n ' +
        '██║ ╚████║███████╗███████║   ██║╚█████╔╝███████║ \n ' +
        '╚═╝  ╚═══╝╚══════╝╚══════╝   ╚═╝ ╚════╝ ╚══════╝ \n ' +
        +'\n',
    );
    logger.log(`node version: ${process.version}`);
    logger.log(`node env: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`port: ${port}`);
  }

  getHello(): string {
    return 'Hello World!';
  }
}
