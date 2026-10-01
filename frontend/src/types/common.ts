export interface ApiMessage {
    message: string;
}
export interface Paginated<T> {
    data: T[];
    total: number;
}
