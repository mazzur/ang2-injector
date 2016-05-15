import 'reflect-metadata';

export default function ParamDecoratorFactory(classToInject:any):Function {
    return function ParamDecorator(cls:Function, unusedKey:any, index:any):Function {
        let paramsMetadata:any[][] = Reflect.getMetadata('parameters', cls) || [];

        paramsMetadata[index] = (paramsMetadata[index] || []).concat([{
            token: classToInject
        }]);

        Reflect.defineMetadata('parameters', paramsMetadata, cls);

        return cls;
    }
}