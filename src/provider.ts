export class Provider {
    token:any;
    useValue:any;
    useClass:any;

    constructor(token:any, {useValue, useClass}: {useValue?: any, useClass?:any}) {
        this.token = token;
        this.useValue = useValue;
        this.useClass = useClass;
    }
}

export default function provide(token:any, {
    useValue,
    useClass
    }: {
    useValue?: any,
    useClass?:any
}):Provider {
    return new Provider(token, {useValue, useClass});
}