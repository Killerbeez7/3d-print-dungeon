export interface NavSectionItem {
    label: string;
    to: string;
}

export interface NavSection {
    label: string;
    to: string;
    items: NavSectionItem[];
}

