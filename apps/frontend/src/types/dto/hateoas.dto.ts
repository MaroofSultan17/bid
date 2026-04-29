export interface LinkDTO {
    rel: string;
    href: string;
    method: string;
}

export interface LinksDTO {
    [key: string]: LinkDTO;
}
