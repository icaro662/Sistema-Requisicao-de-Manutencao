import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { diskStorage } from 'multer';

const uploadDirectory = join(process.cwd(), 'uploads');

if (!existsSync(uploadDirectory)) mkdirSync(uploadDirectory, { recursive: true });

export const multerConfig = {
	storage: diskStorage({
		destination: uploadDirectory,
		filename: (_request, file, callback) => {
			callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
		},
	}),
	limits: { fileSize: 5 * 1024 * 1024 },
};

export { uploadDirectory };
