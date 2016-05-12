import 'reflect-metadata';
import provide, {Provider} from './provider';

class InternalInjector {
    private providers:any = new Map();
    private providerInstances:any = new Map();

    constructor(providerDescriptors:Array<any>) {
        providerDescriptors.forEach(providerDescriptor => {
            if (providerDescriptor instanceof Provider) {
                this.providers.set(providerDescriptor.token, providerDescriptor);
            }
            else {
                const provider = provide(providerDescriptor, {
                    useClass: providerDescriptor
                });
                this.providers.set(provider.token, provider);
            }
        });
    }

    public get(token:any):any {
        if (!this.providerInstances.has(token)) {
            if (!this.providers.has(token)) {
                return null;
            }

            const provider = this.providers.get(token);
            this.providerInstances.set(token, this.resolveDependencies(provider));
        }

        return this.providerInstances.get(token);
    }

    private resolveDependencies(provider:any):any {
        if (provider.useValue) {
            return provider.useValue;
        }
        else if (provider.useClass) {
            const cls = provider.useClass;
            const dependencyTokens = Reflect.getMetadata('design:paramtypes', cls);

            const params = Reflect.getMetadata('parameters', cls);

            if (!dependencyTokens) {
                return new cls();
            }

            const dependencies = dependencyTokens.map((paramType, i) => {
                if (Array.isArray(params) && Array.isArray(params[i]) && params[i].length) {
                    return this.get(params[i][0].token);
                }
                return this.get(paramType);
            });
            return new cls(...dependencies);
        }
    }
}

export default class Injector {
    static resolve(providers:any[]):InternalInjector {
        return new InternalInjector(providers);
    }
}
