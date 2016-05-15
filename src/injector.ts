import 'reflect-metadata';
import provide, {Provider} from './provider';

class InternalInjector {
    private providers:Map<any, Provider | Provider[]> = new Map();
    private providerInstances:Map<any, any> = new Map();

    constructor(providerDescriptors:Array<any>) {
        providerDescriptors.forEach(this.registerProvider.bind(this));
    }

    public get(token:any):any {
        if (!this.providerInstances.has(token)) {
            if (!this.providers.has(token)) {
                return null;
            }

            const provider = this.providers.get(token);
            this.providerInstances.set(token, this.instantiate(provider));
        }

        return this.providerInstances.get(token);
    }

    private registerProvider(providerDescriptor:any):void {
        if (providerDescriptor instanceof Provider) {
            this.providers.set(providerDescriptor.token, providerDescriptor);
        }
        else if (providerDescriptor.provide) {
            this.registerProviderObject(providerDescriptor);
        }
        else {
            const provider = provide(providerDescriptor, {
                useClass: providerDescriptor
            });
            this.providers.set(provider.token, provider);
        }
    }

    private registerProviderObject(providerDefinitionObject:any):void {
        const provider = provide(providerDefinitionObject.provide, providerDefinitionObject);
        if (provider.multi) {
            this.registerMultiProvider(provider);
        }
        else {
            this.providers.set(provider.token, provider);
        }
    }

    private registerMultiProvider(provider:any):void {
        if (!this.providers.has(provider.token)) {
            this.providers.set(provider.token, [provider]);
        }
        else {
            (<Provider[]>this.providers.get(provider.token)).push(provider);
        }
    }

    private instantiate(provider:Provider | Provider[]):any {
        if (Array.isArray(provider)) {
            return provider.map(this.instantiate.bind(this));
        }
        else if (provider.useClass) {
            return this.instantiateClass(provider.useClass);
        }
        else if (provider.useFactory) {
            return provider.useFactory(...provider.deps.map(this.get.bind(this)));
        }
        else if (provider.useExisting) {
            return this.get(provider.useExisting);
        }
        else {
            return (<Provider>provider).useValue;
        }
    }

    private instantiateClass(cls:any):Object {
        const paramTypes:any[] = Reflect.getMetadata('design:paramtypes', cls);
        const params:any[] = Reflect.getMetadata('parameters', cls);

        if (!paramTypes) {
            return new cls();
        }

        const dependencies = this.paramsToTokens(params, paramTypes).map(this.get.bind(this));
        return new cls(...dependencies);
    }

    private paramsToTokens(params, paramTypes):any {
        return paramTypes.map((paramType, i) => {
            if (Array.isArray(params) && Array.isArray(params[i]) && params[i].length) {
                const tokenRef = params[i][0];
                return tokenRef.token;
            }
            else {
                return paramType;
            }
        });
    }
}

export default class Injector {
    static resolve(providers:any[]):InternalInjector {
        return new InternalInjector(providers);
    }
}
