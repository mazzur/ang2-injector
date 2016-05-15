export class Provider {
    useValue:any;
    useClass:any;
    useFactory:Function;
    useExisting:any;
    deps:Object[];
    multi: Boolean;

    constructor(public token:any, {
        useValue,
        useClass,
        useFactory,
        useExisting,
        deps,
        multi
        }: {
        useValue?: any,
        useClass?:any,
        useFactory?: Function,
        useExisting?: any,
        deps?: Object[],
        multi?: Boolean
    }) {
        this.useValue = useValue;
        this.useClass = useClass;
        this.useFactory = useFactory;
        this.useExisting = useExisting;
        this.deps = deps;
        this.multi = multi;
    }
}

export default function provide(token:any, {
    useValue,
    useClass,
    useFactory,
    useExisting,
    deps,
    multi
    }: {
    useValue?: any,
    useClass?:any,
    useFactory?: Function,
    useExisting?: any,
    deps?: Object[],
    multi?: Boolean
}):Provider {
    return new Provider(token, {useValue, useClass, useFactory, useExisting, deps, multi});
}