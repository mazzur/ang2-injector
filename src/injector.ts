import 'reflect-metadata';

class InternalInjector {
    private providersMap:any = {};
    private providerInstancesMap:any = {};

    constructor(providers:Array<any>) {
        providers.forEach(provider => {
            this.providersMap[provider.name] = provider;
        });
    }

    public get(Provider:any):any {
        if (!this.providerInstancesMap[Provider.name]) {
            if (!this.providersMap[Provider.name]) {
                return null;
            }

            this.providerInstancesMap[Provider.name] = this.resolveDependencies(Provider);
        }

        return this.providerInstancesMap[Provider.name];
    }

    private resolveDependencies(Provider:any):any {
        const dependencyTokens = Reflect.getMetadata('design:paramtypes', Provider);

        const params = Reflect.getMetadata('parameters', Provider);

        if (!dependencyTokens) {
            return new Provider();
        }

        const dependencies = dependencyTokens.map((paramType, i) => {
            if (Array.isArray(params) && Array.isArray(params[i]) && params[i].length) {
                return this.get(params[i][0].token);
            }
            return this.get(paramType);
        });
        return new Provider(...dependencies);
    }
}

export default class Injector {
    static resolve(providers:any[]):InternalInjector {
        return new InternalInjector(providers);
    }
}
