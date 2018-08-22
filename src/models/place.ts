import { Location } from "./locations";

export class Place {
    constructor(
        public title: string,
        public description: string, 
        public location: Location,
        public imageUrl: string,
        public imageNativeUrl: string
    ) {}
}