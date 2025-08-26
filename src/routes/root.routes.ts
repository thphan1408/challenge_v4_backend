import { Router } from 'express';
import ownerRoutes from './owner.routes';
import employeeRoutes from './employee.routes';
import { createChatRoutes } from './chat.routes';

export const createRootRouter = (wsHandler?: any): Router => {
  const rootRouter = Router();

  rootRouter.use('/owners', ownerRoutes);
  rootRouter.use('/employees', employeeRoutes);

  if (wsHandler) {
    rootRouter.use('/chat', createChatRoutes(wsHandler));
  }

  return rootRouter;
};

const rootRouter = createRootRouter();
export default rootRouter;
