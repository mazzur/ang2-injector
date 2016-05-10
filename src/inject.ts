import 'reflect-metadata';

export default function ParamDecoratorFactory(classToInject:any):any {
    return function ParamDecorator(cls:Function, unusedKey:any, index:any):Function {
        let params:any[][] = Reflect.getMetadata('parameters', cls);
        params = params || [];

        const annotationInstance = {
            token: classToInject
        };

        params[index] = params[index] || [];
        params[index].push(annotationInstance);

        Reflect.defineMetadata('parameters', params, cls);

        return cls;
    }
}