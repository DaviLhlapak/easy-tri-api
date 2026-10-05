import { ConfigService } from '@nestjs/config';
import { LocalDisk, type StorageModuleOptions } from '@nestjs/storage';

export function createStorageOptions(
  config: ConfigService,
): StorageModuleOptions {
  const appUrl = config.getOrThrow<string>('appUrl');
  const root = config.getOrThrow<string>('storage.root');
  return {
    default: 'exams',
    disks: {
      exams: new LocalDisk({
        root: `${root}/exams`,
        publicUrl: `${appUrl}/exams`,
      }),
      // private: new LocalDisk({
      //   root: `${root}/private`,
      //   signedUrls: {
      //     baseUrl: `${appUrl}/files`,
      //     keys: [config.getOrThrow<string>('storage.signingKey')],
      //   },
      // }),
    },
  };
}
