// oxlint-disable-next-line typescript/consistent-type-imports -- `typeof` needs the runtime schema binding, not a type-only import
import { APIv3Tag } from '@/core/api/generated/shokoServerAPI30.schemas';

import type { z } from 'zod';

export type TagType = z.infer<typeof APIv3Tag>;
