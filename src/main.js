import { MODULE } from './constants';
import { CustomUserConfig } from './sheets/CustomUserConfig';

import './styles/module.scss';

Hooks.once('init', async () => {
  Users.unregisterSheet('core', UserConfig, {
    types: ['base'],
  });

  Users.registerSheet(MODULE.ID, CustomUserConfig, {
    types: ['base'],
    makeDefault: true,
  });
});
