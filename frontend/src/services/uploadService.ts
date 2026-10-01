import api from './api';

export interface UploadPhotoResponse {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
}

export const uploadService = {
    photo: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api
            .post<UploadPhotoResponse>('/arquivos/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            .then(({ data }) => data);
    },
    remove: (filename: string) =>
        api
            .delete<{
                filename: string;
                removed: boolean;
            }>(`/arquivos/${encodeURIComponent(filename)}`)
            .then(({ data }) => data),
};
