export interface HrefQuery {
    sluggedId: string;
}

export interface Href {
    pathname: string;
    query: HrefQuery;
}
